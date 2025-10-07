export default function createToast(
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
    duration = 3000,
) {
    console.log('Creating toast:', message, type);

    const toastContainer = document.querySelector('#toast-container');
    if (!toastContainer) {
        console.error('Toast container not found');
        return;
    }

    const toast = document.createElement('div');

    toast.classList.add('toast', type);
    toast.textContent = message;

    toastContainer.prepend(toast);

    // Forcer un reflow pour que l'animation CSS fonctionne
    toast.offsetHeight;

    // Ajouter la classe show pour déclencher l'animation
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, duration);
}
