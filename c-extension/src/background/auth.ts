const CLIENT_ID = '787vqxyis93jh6';
const REDIRECT_URI = chrome.identity.getRedirectURL(); // ex: https://<ext>.chromiumapp.org/

export async function signinWithLinkedin() {
    const STATE = crypto.randomUUID(); // génère par tentative
    const scope = 'openid profile email'; // besoin du produit OIDC activé
    const authUrl =
        'https://www.linkedin.com/oauth/v2/authorization' +
        `?response_type=code` +
        `&client_id=${encodeURIComponent(CLIENT_ID)}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&state=${encodeURIComponent(STATE)}` +
        `&scope=${encodeURIComponent(scope)}`;

    const redirectUrl = await chrome.identity.launchWebAuthFlow({
        url: authUrl,
        interactive: true,
    });

    if (!redirectUrl) return null;

    console.log('Redirect URL:', redirectUrl);

    const params = new URLSearchParams(new URL(redirectUrl).search);
    const code = params.get('code');
    const returnedState = params.get('state');

    if (!code) throw new Error('No code in callback');
    if (returnedState !== STATE) throw new Error('State mismatch');

    const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
    });

    const data = await res.json();
    console.log('Access Token Response:', data);

    if (!res.ok || !data.access_token) {
        throw new Error(`Token exchange failed: ${JSON.stringify(data)}`);
    }
    return data.access_token;
}
