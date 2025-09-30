import { getValidAccessToken } from './auth';

export async function getProfileEmailByLinkedInUrl(
    linkedinUrl: string,
): Promise<string | null> {
    const token = await getValidAccessToken();
    const baseUrl = 'http://localhost:8000/chloe-api/profile';

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
