export async function imapAuth(account) {
  const settings = account.settings;
  if (settings.imap_password) {
    return { user: settings.imap_username, pass: settings.imap_password };
  }

  if (account.provider !== 'gmail' || !settings.refresh_client_id || !settings.refresh_token) {
    throw new Error('The destination account has no supported IMAP credentials.');
  }

  const resourcePath = AppEnv.getLoadSettings().resourcePath;
  const constants = require(`${resourcePath}/internal_packages/onboarding/lib/onboarding-constants`);

  const response = await fetch('https://www.googleapis.com/oauth2/v4/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: settings.refresh_client_id,
      client_secret: constants.GMAIL_CLIENT_SECRET,
      refresh_token: settings.refresh_token,
    }),
  });
  const result = await response.json();
  if (!response.ok || !result.access_token) {
    const message = result.error_description || result.error || response.statusText;
    throw new Error(`Gmail authentication failed: ${message}`);
  }
  return { user: settings.imap_username, accessToken: result.access_token };
}

export function imapConfig(account, auth) {
  const settings = account.settings;
  const security = settings.imap_security;

  return {
    host: settings.imap_host,
    port: Number(settings.imap_port),
    secure: security === 'SSL / TLS' || (!security && Number(settings.imap_port) === 993),
    doSTARTTLS: security === 'STARTTLS' ? true : security === 'none' ? false : undefined,
    tls: { rejectUnauthorized: !settings.imap_allow_insecure_ssl },
    auth,
    logger: false,
  };
}
