import { getValidAccessToken } from './auth';

export async function getProfileEmailByLinkedInUrl(
    linkedinUrl: string,
): Promise<string | null> {
    const token = await getValidAccessToken();
    const baseUrl =
        'https://chloe-extension-102305464279.europe-west1.run.app/chloe-api/email';

    const params = new URLSearchParams({ linkedinUrl }).toString();

    const response = await fetch(`${baseUrl}?${params}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token?.access_token}` },
    });

    if (!response.ok) {
        console.error('Error fetching profile email:', response.statusText);
        return null;
    }

    const data = await response.json();
    return data.profileEmail || null;
}

export async function getProfilePhoneByLinkedInUrl(
    linkedinUrl: string,
): Promise<string | null> {
    const token = await getValidAccessToken();
    const baseUrl =
        'https://chloe-extension-102305464279.europe-west1.run.app/chloe-api/phone';

    const params = new URLSearchParams({ linkedinUrl }).toString();

    const response = await fetch(`${baseUrl}?${params}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token?.access_token}` },
    });

    if (!response.ok) {
        console.error('Error fetching profile email:', response.statusText);
        return null;
    }

    const data = await response.json();
    return data.profilePhone || null;
}
