const assert = require('assert');
const Module = require('module');
const { imapAuth, imapConfig } = require('../lib/imap-config');

const account = {
  settings: {
    imap_host: 'imap.example.com',
    imap_port: '993',
    imap_username: 'eli@example.com',
    imap_security: 'SSL / TLS',
    imap_allow_insecure_ssl: false,
  },
};

const passwordAuth = { user: 'eli@example.com', pass: 'secret' };
const config = imapConfig(account, passwordAuth);
assert.strictEqual(config.port, 993);
assert.strictEqual(config.secure, true);
assert.strictEqual(config.doSTARTTLS, undefined);
assert.strictEqual(config.tls.rejectUnauthorized, true);
assert.deepStrictEqual(config.auth, passwordAuth);

account.settings.imap_security = 'STARTTLS';
assert.strictEqual(imapConfig(account, passwordAuth).doSTARTTLS, true);

account.settings.imap_security = 'none';
assert.strictEqual(imapConfig(account, passwordAuth).doSTARTTLS, false);

(async () => {
  assert.deepStrictEqual(
    await imapAuth({ ...account, settings: { ...account.settings, imap_password: 'secret' } }),
    passwordAuth
  );

  const originalFetch = global.fetch;
  const originalLoad = Module._load;
  global.AppEnv = { getLoadSettings: () => ({ resourcePath: '/mailspring/app.asar' }) };
  Module._load = function (request) {
    if (request.endsWith('/internal_packages/onboarding/lib/onboarding-constants')) {
      return { GMAIL_CLIENT_SECRET: 'client-secret' };
    }
    return originalLoad.apply(this, arguments);
  };
  global.fetch = async (url, options) => {
    assert.strictEqual(url, 'https://www.googleapis.com/oauth2/v4/token');
    assert.match(String(options.body), /grant_type=refresh_token/);
    assert.match(String(options.body), /client_id=client-id/);
    assert.match(String(options.body), /client_secret=client-secret/);
    assert.match(String(options.body), /refresh_token=refresh-token/);
    return { ok: true, json: async () => ({ access_token: 'access-token' }) };
  };
  try {
    assert.deepStrictEqual(
      await imapAuth({
        provider: 'gmail',
        settings: {
          imap_username: 'gmail@example.com',
          refresh_client_id: 'client-id',
          refresh_token: 'refresh-token',
        },
      }),
      { user: 'gmail@example.com', accessToken: 'access-token' }
    );
  } finally {
    global.fetch = originalFetch;
    Module._load = originalLoad;
    delete global.AppEnv;
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
