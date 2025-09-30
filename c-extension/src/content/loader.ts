export const displayLoader = (
    container: HTMLElement,
    textLoader: string = 'Loading...',
) => {
    // Vérifier si le loader existe déjà
    if (document.getElementById('loader-container')) return;

    const loader = document.createElement('div');
    loader.id = 'loader-container';
    loader.innerHTML = `
        <div class="loader-container__spinner"></div>
        <div class="loader-container__text" id="text-loading">${textLoader}</div>
    `;
    container.appendChild(loader);
};

export const hideLoader = () => {
    const loader = document.getElementById('loader-container');
    if (loader) {
        loader.remove();
    }
};
