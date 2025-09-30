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

const globalNav = document.querySelector<HTMLElement>('.global-nav');

const container = document.createElement('div');
container.id = 'chloe-extension-root'; // <— ID unique
container.innerHTML = `
    <button type="button" id="chloe-floating-btn" class="retracted" style="top: ${
        globalNav ? globalNav.offsetHeight + 24 : 70 + 25
    }px"> <img class="chloe-floating-btn__icon" src="${chrome.runtime.getURL(
    'public/assets/images',
)}/brand/chloe.jpg" alt="Chloe Icon" /> </button>
    <div class="chloe-extension retracted" id="chloe-extension">

            
        <header class="chloe-extension__header">
        <button id="chloe-extension-title-btn">
            <h2  class="chloe-extension__header__title">
                <img class="chloe-extension__header__title__logo" src="${chrome.runtime.getURL(
                    'public/assets/images',
                )}/brand/chloe.jpg" alt="Chloe Icon" />
                Chloe
            </h2>
        </button>
        <div style="display: flex; align-items: center;">
            <button id="settings-btn" class="chloe-extension__header__btn--user action-btn" style="padding: 8px; margin: 0 !important">
                <img class="chloe-extension__header__btn--user__icon" src="${chrome.runtime.getURL(
                    'public/assets/images',
                )}/icons/settings.png" alt="User Icon" />
            </button>
            <button id="retract-btn" class="chloe-extension__top-bar__btn-retract chloe-extension__header__btn--user" style="padding: 8px; margin: 0 !important; font-size: 18px; font-weight: bold"> — </button> 
        </div>
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

const titleButton = document.getElementById('chloe-extension-title-btn');

const chloeFloatingBtn = document.getElementById('chloe-floating-btn');
const retractButton = document.getElementById('retract-btn');

chloeFloatingBtn?.addEventListener('click', () => {
    const shell = document.getElementById('chloe-extension');
    if (shell && chloeFloatingBtn) {
        shell.classList.remove('retracted');
        chloeFloatingBtn.classList.add('retracted');
    }
});

retractButton?.addEventListener('click', () => {
    const shell = document.getElementById('chloe-extension');
    if (shell && chloeFloatingBtn) {
        shell.classList.add('retracted');
        chloeFloatingBtn.classList.remove('retracted');
    }
});

titleButton?.addEventListener('click', () => {
    if (location.href.includes('/in/')) {
        displayProfilePage(bodyEl, 'people');
    } else {
        displayProfilePage(bodyEl, 'organization');
    }
});

settingsBtn?.addEventListener('click', () => {
    displaySettingsPage(bodyEl);
});

// Init first-load pour les URLs déjà sur profil/org/school
function renderFor(url: string) {
    const isProfile = url.includes('/in/');
    const isOrg = url.includes('/company/') || url.includes('/school/');

    if (isProfile || isOrg) {
        shell.classList.remove('retracted');
        displayProfilePage(bodyEl, isProfile ? 'people' : 'organization');
    } else {
        shell.classList.add('retracted');
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

        const url = request.url as string;
        const re =
            /^https?:\/\/(?:[\w-]+\.)?linkedin\.com\/(in|company|school)\/[^/?#]+\/?$/i;
        if (re.test(url)) {
            chrome.runtime.sendMessage({
                action: 'REGISTER_PROFILE_IN_HISTORY',
                url: url,
            });
        }
    }
});
