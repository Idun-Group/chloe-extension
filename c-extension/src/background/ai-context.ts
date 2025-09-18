import { getToken } from './auth';

export async function createAIContext(
    title: string,
    content: string,
    isDefault: boolean,
) {
    const token = await getToken();
    if (!token) {
        return { ok: false, message: 'No auth token found' };
    }

    const response = await fetch('http://localhost:3000/aicontext', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.access_token}`,
        },
        body: JSON.stringify({
            title,
            content,
            isDefault,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        return {
            ok: false,
            message: errorData.message || 'Error creating context',
        };
    } else {
        const responseData = await response.json();
        return { ok: true, message: 'Context created' };
    }
}
