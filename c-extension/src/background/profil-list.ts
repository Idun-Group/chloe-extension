import { getToken } from './auth';

export async function fetchProfileLists() {
    const token = await getToken();

    if (!token) {
        throw new Error('No token found');
    }

    const response = await fetch('http://localhost:3000/profile-list', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.access_token}`,
        },
    });
    if (!response.ok) {
        throw new Error(
            `Failed to fetch profile lists: ${response.statusText}`,
        );
    }

    return response.json();
}

export async function getProfileListById(id: string) {
    const token = await getToken();

    if (!token) {
        throw new Error('No token found');
    }

    const response = await fetch(`http://localhost:3000/profile-list/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.access_token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch profile list: ${response.statusText}`);
    }

    return response.json();
}

export async function createProfileList(
    type: 'PEOPLE' | 'ORGANIZATION',
    name: string,
    description: string,
) {
    const token = await getToken();

    if (!token) {
        throw new Error('No token found');
    }

    const response = await fetch('http://localhost:3000/profile-list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.access_token}`,
        },
        body: JSON.stringify({
            type,
            name,
            description,
        }),
    });

    if (!response.ok) {
        throw new Error(
            `Failed to create profile list: ${response.statusText}`,
        );
    }

    return response.json();
}

export async function updateProfileList(
    id: string,
    name: string,
    description: string,
    type: 'PEOPLE' | 'ORGANIZATION',
) {
    const token = await getToken();

    if (!token) {
        throw new Error('No token found');
    }

    const response = await fetch(`http://localhost:3000/profile-list/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.access_token}`,
        },
        body: JSON.stringify({
            name,
            description,
            type,
        }),
    });

    if (!response.ok) {
        throw new Error(
            `Failed to update profile list: ${response.statusText}`,
        );
    }

    return response.json();
}

export async function deleteProfileList(id: string) {
    const token = await getToken();
    if (!token) {
        throw new Error('No token found');
    }

    const response = await fetch(`http://localhost:3000/profile-list/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.access_token}`,
        },
    });

    if (!response.ok) {
        throw new Error(
            `Failed to delete profile list: ${response.statusText}`,
        );
    }

    return response.json();
}
