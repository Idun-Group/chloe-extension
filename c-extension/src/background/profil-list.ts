import { getToken } from './auth';
import { readyTabs } from './current-pages';

export async function fetchProfileLists() {
    const token = await getToken();

    if (!token) {
        throw new Error('No token found');
    }

    const response = await fetch('http://localhost:8000/profile-list', {
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

    const response = await fetch(`http://localhost:8000/profile-list/${id}`, {
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

export async function getProfileListsByType(type: 'PEOPLE' | 'ORGANISATION') {
    const token = await getToken();

    if (!token) {
        throw new Error('No token found');
    }

    const response = await fetch(
        `http://localhost:8000/profile-list?type=${type}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.access_token}`,
            },
        },
    );

    if (!response.ok) {
        throw new Error(
            `Failed to fetch profile lists by type: ${response.statusText}`,
        );
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

    const response = await fetch('http://localhost:8000/profile-list', {
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

    const response = await fetch(`http://localhost:8000/profile-list/${id}`, {
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

    const response = await fetch(`http://localhost:8000/profile-list/${id}`, {
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

export async function createPeopleProfile(
    profileListId: string,
    profileData: {
        linkedinUrl: string;
        job?: string;
        fullName: string;
        location: string;
        phone?: string;
        email?: string;
    },
) {
    const token = await getToken();

    if (!token) {
        throw new Error('No token found');
    }

    console.log(profileData);

    const response = await fetch('http://localhost:8000/people-profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.access_token}`,
        },
        body: JSON.stringify({
            profileListId,
            ...profileData,
        }),
    });

    if (!response.ok) {
        throw new Error(
            `Failed to create people profile: ${response.statusText}`,
        );
    }

    return response.json();
}

export async function createOrganizationProfile(
    profileListId: string,
    profileData: {
        linkedinUrl: string;
        name: string;
        location?: string;
        industry?: string;
        size?: string;
    },
) {
    const token = await getToken();
    profileData;
    if (!token) {
        throw new Error('No token found');
    }
    console.log(profileData);

    const response = await fetch('http://localhost:8000/organization-profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.access_token}`,
        },
        body: JSON.stringify({
            profileListId,
            ...profileData,
        }),
    });

    if (!response.ok) {
        throw new Error(
            `Failed to create people profile: ${response.statusText}`,
        );
    }

    return response.json();
}
// background.ts
function getFilenameFromCD(cd?: string | null, fallback = 'export.csv') {
    if (!cd) return fallback;
    const m = cd.match(/filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i);
    const raw = decodeURIComponent((m?.[1] || m?.[2] || '').trim());
    return raw || fallback;
}

export async function downloadProfileList(id: string) {
    const token = await getToken();

    if (!token) {
        throw new Error('No token found');
    }

    try {
        console.log('🔽 Starting download for list:', id);

        const res = await fetch(
            `http://localhost:8000/profile-list/csv/${id}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token.access_token}`,
                    Accept: 'text/csv',
                },
            },
        );

        console.log('📡 Response status:', res.status, res.statusText);

        if (!res.ok) {
            throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }

        const blob = await res.blob();
        console.log('📦 Blob received - size:', blob.size, 'type:', blob.type);

        if (blob.size === 0) {
            throw new Error('Received empty file');
        }

        // Extract filename from Content-Disposition header or use default
        const contentDisposition = res.headers.get('Content-Disposition');
        const filename = getFilenameFromCD(contentDisposition, 'profiles.csv');
        console.log('📄 Filename:', filename);

        // Convert blob to data URL for service worker compatibility
        const arrayBuffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binaryString = '';
        for (let i = 0; i < bytes.length; i++) {
            binaryString += String.fromCharCode(bytes[i]);
        }
        const base64Data = btoa(binaryString);
        const dataUrl = `data:${blob.type || 'text/csv'};base64,${base64Data}`;

        console.log('🔗 Data URL created, length:', dataUrl.length);

        return new Promise<void>((resolve, reject) => {
            chrome.downloads.download(
                {
                    url: dataUrl,
                    filename: filename,
                    saveAs: true,
                },
                (downloadId) => {
                    if (chrome.runtime.lastError) {
                        console.error(
                            '❌ Download failed:',
                            chrome.runtime.lastError.message,
                        );
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        console.log('✅ Download started with ID:', downloadId);
                        resolve();
                    }
                },
            );
        });
    } catch (error) {
        console.error('💥 Download failed:', error);
        throw error;
    }
}
