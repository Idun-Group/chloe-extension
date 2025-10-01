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

    const res = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
    });

    const data = await res.json();

    if (!res.ok || !data.access_token) {
        throw new Error(`Token exchange failed: ${JSON.stringify(data)}`);
    }

    await saveToken(data);
}

type Token = {
    access_token: string;
    access_token_expire_in: number;
};

export async function saveToken(tokens: Token) {
    await chrome.storage.local.set({ tokens });
}

export async function getToken(): Promise<Token | null> {
    const result = await chrome.storage.local.get('tokens');
    return result.tokens || null;
}
export async function clearToken() {
    await chrome.storage.local.remove('tokens');
}

export async function getValidAccessToken() {
    const token = await getToken();

    if (!token) return null;

    if (token.access_token_expire_in > Date.now() / 1000 + 60) {
        return token;
    }

    const res = await fetch('http://localhost:8000/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    if (!res.ok || !data.access_token) {
        await clearToken();
        return null;
    }

    const newToken: Token = {
        access_token: data.access_token,
        access_token_expire_in: Math.floor(Date.now() / 1000) + 900, // 15 minutes
    };

    await saveToken(newToken);

    return newToken;
}
