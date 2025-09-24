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

    const response = await fetch('http://localhost:8000/aicontext', {
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

export async function getAIContextById(id: string) {
    const token = await getToken();

    if (!token) {
        return { ok: false, message: 'No auth token found' };
    }

    const response = await fetch(`http://localhost:8000/aicontext/${id}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token.access_token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        return {
            ok: false,
            message: errorData.message || 'Error fetching context',
        };
    }

    const context = await response.json();

    return { ok: true, context };
}

export async function updateAIContext(
    id: string,
    title: string,
    content: string,
    isDefault: boolean,
) {
    const token = await getToken();
    if (!token) {
        return { ok: false, message: 'No auth token found' };
    }

    const response = await fetch(`http://localhost:8000/aicontext/${id}`, {
        method: 'PUT',
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
            message: errorData.message || 'Error updating context',
        };
    } else {
        return { ok: true, message: 'Context updated' };
    }
}

export async function deleteAIContext(id: string) {
    const token = await getToken();
    if (!token) {
        return { ok: false, message: 'No auth token found' };
    }

    const response = await fetch(`http://localhost:8000/aicontext/${id}`, {
        method: 'delete',
        headers: {
            Authorization: `Bearer ${token.access_token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        return {
            ok: false,
            message: errorData.message || 'Error deleting context',
        };
    } else {
        return { ok: true, message: 'Context deleted' };
    }
}
