import { getToken } from './auth';

export default async function getUserProfile() {
    try {
        const token = await getToken();

        if (!token) throw new Error('No token available');
        const response = await fetch('http://localhost:3000/user/me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.access_token}`, // Assurez-vous que 'token' est défini
            },
        });

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
