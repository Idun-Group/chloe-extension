export default function createToast(
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
    duration = 3000,
) {
    const toastContainer = document.querySelector('#toast-container');
    if (!toastContainer) {
        console.error('Toast container not found');
        return;
    }

    const toast = document.createElement('div');

    toast.classList.add('toast', type);

    toast.textContent = message;

    toastContainer.prepend(toast);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, duration);
}
