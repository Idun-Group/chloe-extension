import { getValidAccessToken } from './auth';

export default async function getUserProfile() {
    try {
        const token = await getValidAccessToken();

        if (!token) throw new Error('No token available');
        const response = await fetch(
            'https://chloe-extension-102305464279.europe-west1.run.app/user/me',
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.access_token}`, // Assurez-vous que 'token' est défini
                },
            },
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                `Error fetching user profile: ${errorData.message}`,
            );
        }

        const profile = await response.json();

        return profile;
    } catch (error) {
        throw new Error('Error fetching user profile');
    }
}
