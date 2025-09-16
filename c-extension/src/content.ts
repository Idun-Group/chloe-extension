import { displayProfilePage } from './content/profile-page';
import displaySettingsPage from './content/settings-page';

// --- Injecter le CSS (si tu ne l'as pas déjà via manifest "content_scripts.css")
(function ensureStyles() {
    const href = chrome.runtime.getURL('public/styles/styles.css');
    if (!document.querySelector(`link[data-chloe="styles"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.setAttribute('data-chloe', 'styles');
        document.documentElement.appendChild(link);
    }
})();

const container = document.createElement('div');
container.id = 'chloe-extension-root'; // <— ID unique
container.innerHTML = `
  <div class="chloe-extension" id="chloe-extension">
    <header class="chloe-extension__header">
      <h2 class="chloe-extension__header__title">
        <img class="chloe-extension__header__title__logo" src="${chrome.runtime.getURL(
            'public/assets/images',
        )}/brand/chloe.jpg" alt="Chloe Icon" />
        Chloe
      </h2>
      <button id="settings-btn" class="chloe-extension__header__btn--user">
        <img class="chloe-extension__header__btn--user__icon" src="${chrome.runtime.getURL(
            'public/assets/images',
        )}/icons/user.png" alt="User Icon" />
      </button>
    </header>
    <section id="chloe-extension-body" class="chloe-extension__body">
      <p>Welcome to the Chloe Extension !</p>
    </section>
  </div>
`;
document.body.appendChild(container);

// Sélecteurs sûrs
const shell = document.getElementById('chloe-extension')!;
const bodyEl = document.getElementById('chloe-extension-body')!;
const settingsBtn = document.getElementById('settings-btn');

settingsBtn?.addEventListener('click', () => {
    displaySettingsPage(bodyEl);
});

// Init first-load pour les URLs déjà sur profil/org/school
function renderFor(url: string) {
    const isProfile = url.includes('/in/');
    const isOrg = url.includes('/company/') || url.includes('/school/');

    if (isProfile || isOrg) {
        shell.classList.remove('hidden');
        displayProfilePage(bodyEl, isProfile ? 'people' : 'organization');
    } else {
        shell.classList.add('hidden');
    }
}

// Un petit observer pour l’initialisation (DOM prêt) puis on passe au background pour la suite
const observer = new MutationObserver((_m, obs) => {
    if (document.body.contains(shell)) {
        renderFor(location.href);
        chrome.runtime.sendMessage({
            action: 'CONTENT_READY',
            url: location.href,
        });
        obs.disconnect();
    }
});
observer.observe(document.body, { childList: true, subtree: true });

// Réaction au background (SPA)
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'LI_URL_CHANGED') {
        renderFor(request.url);
    }
});
