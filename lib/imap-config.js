"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function imapAuth(account) {
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
exports.imapAuth = imapAuth;
function imapConfig(account, auth) {
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
exports.imapConfig = imapConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hcC1jb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW1hcC1jb25maWcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBTyxLQUFLLFVBQVUsUUFBUSxDQUFDLE9BQU87SUFDcEMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztJQUNsQyxJQUFJLFFBQVEsQ0FBQyxhQUFhLEVBQUU7UUFDMUIsT0FBTyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsYUFBYSxFQUFFLENBQUM7S0FDdkU7SUFFRCxJQUFJLE9BQU8sQ0FBQyxRQUFRLEtBQUssT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRTtRQUMxRixNQUFNLElBQUksS0FBSyxDQUFDLDREQUE0RCxDQUFDLENBQUM7S0FDL0U7SUFFRCxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUMsWUFBWSxDQUFDO0lBQzNELE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxHQUFHLFlBQVksd0RBQXdELENBQUMsQ0FBQztJQUVuRyxNQUFNLFFBQVEsR0FBRyxNQUFNLEtBQUssQ0FBQyw0Q0FBNEMsRUFBRTtRQUN6RSxNQUFNLEVBQUUsTUFBTTtRQUNkLE9BQU8sRUFBRSxFQUFFLGNBQWMsRUFBRSxpREFBaUQsRUFBRTtRQUM5RSxJQUFJLEVBQUUsSUFBSSxlQUFlLENBQUM7WUFDeEIsVUFBVSxFQUFFLGVBQWU7WUFDM0IsU0FBUyxFQUFFLFFBQVEsQ0FBQyxpQkFBaUI7WUFDckMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxtQkFBbUI7WUFDNUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxhQUFhO1NBQ3RDLENBQUM7S0FDSCxDQUFDLENBQUM7SUFDSCxNQUFNLE1BQU0sR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNyQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUU7UUFDeEMsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLGlCQUFpQixJQUFJLE1BQU0sQ0FBQyxLQUFLLElBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQztRQUNoRixNQUFNLElBQUksS0FBSyxDQUFDLGdDQUFnQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0tBQzVEO0lBQ0QsT0FBTyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsYUFBYSxFQUFFLFdBQVcsRUFBRSxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDNUUsQ0FBQztBQTdCRCw0QkE2QkM7QUFFRCxTQUFnQixVQUFVLENBQUMsT0FBTyxFQUFFLElBQUk7SUFDdEMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztJQUNsQyxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDO0lBRXhDLE9BQU87UUFDTCxJQUFJLEVBQUUsUUFBUSxDQUFDLFNBQVM7UUFDeEIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDO1FBQ2hDLE1BQU0sRUFBRSxRQUFRLEtBQUssV0FBVyxJQUFJLENBQUMsQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLENBQUM7UUFDckYsVUFBVSxFQUFFLFFBQVEsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTO1FBQ3BGLEdBQUcsRUFBRSxFQUFFLGtCQUFrQixFQUFFLENBQUMsUUFBUSxDQUFDLHVCQUF1QixFQUFFO1FBQzlELElBQUk7UUFDSixNQUFNLEVBQUUsS0FBSztLQUNkLENBQUM7QUFDSixDQUFDO0FBYkQsZ0NBYUMifQ==