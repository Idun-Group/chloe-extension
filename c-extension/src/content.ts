import { displayProfilePage } from './content/profile-page';
import displaySettingsPage from './content/settings-page';
import createToast from './content/toast';

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
        <div id="toast-container"></div>

    <button type="button" id="chloe-floating-btn" style="top: ${
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

// Créer le conteneur de toast global (en dehors de l'extension) pour les messages d'erreur
const globalToastContainer = document.createElement('div');
globalToastContainer.id = 'global-toast-container';
globalToastContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10001;
    display: flex;
    flex-direction: column;
    gap: 10px;
`;
document.body.appendChild(globalToastContainer);

// Sélecteurs sûrs
const shell = document.getElementById('chloe-extension')!;
const bodyEl = document.getElementById('chloe-extension-body')!;
const settingsBtn = document.getElementById('settings-btn');

const titleButton = document.getElementById('chloe-extension-title-btn');

const chloeFloatingBtn = document.getElementById('chloe-floating-btn');
const retractButton = document.getElementById('retract-btn');

// Variables pour le drag & drop
let isDragging = false;
let hasMoved = false; // Nouvelle variable pour détecter le mouvement
let startX = 0;
let startY = 0;
let startTop = 0;
let startLeft = 0;
let dragStartTime = 0;
const DRAG_THRESHOLD = 5; // Seuil de mouvement pour considérer qu'on drag (en pixels)

// Fonction pour afficher des toasts d'erreur dans le conteneur global
function showGlobalErrorToast(message: string, duration = 4000) {
    const globalToastContainer = document.getElementById(
        'global-toast-container',
    );
    if (!globalToastContainer) {
        console.error('Global toast container not found');
        return;
    }

    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.style.cssText = `
        padding: 15px 20px;
        color: #fff;
        background-color: #f44336;
        border-radius: 8px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        opacity: 0;
        transform: translateX(100%);
        transition: opacity 0.4s ease-out, transform 0.4s ease-out;
        min-width: 280px;
        max-width: 90vw;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
    `;

    toast.innerHTML = `
        <span style="font-size: 18px;">⚠️</span>
        <span>${message}</span>
    `;

    globalToastContainer.appendChild(toast);

    // Forcer un reflow pour que l'animation CSS fonctionne
    toast.offsetHeight;

    // Animation d'entrée
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 10);

    // Retirer automatiquement après la durée spécifiée
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 400);
    }, duration);

    // Permettre de fermer en cliquant
    toast.addEventListener('click', () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 400);
    });
}

// Fonction pour vérifier si on est sur une page valide
function isValidPage(url: string): boolean {
    return (
        url.includes('/in/') ||
        url.includes('/company/') ||
        url.includes('/school/')
    );
}

// Fonction pour ajuster la position du container en fonction du bouton
function adjustContainerPosition() {
    const container = document.getElementById('chloe-extension');
    const button = document.getElementById('chloe-floating-btn');

    if (!container || !button) return;

    const buttonRect = button.getBoundingClientRect();
    const containerWidth = 450; // Largeur du container
    const containerHeight = container.offsetHeight; // Hauteur actuelle du container
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let newTop = buttonRect.top;
    let newLeft = buttonRect.left;

    // Déterminer la meilleure position pour le container
    // Préférence : à droite du bouton, puis à gauche, puis en dessous

    if (buttonRect.right + containerWidth + 20 <= windowWidth) {
        // À droite du bouton
        newLeft = buttonRect.right + 20;
    } else if (buttonRect.left - containerWidth - 20 >= 0) {
        // À gauche du bouton
        newLeft = buttonRect.left - containerWidth - 20;
    } else {
        // Centré horizontalement
        newLeft = Math.max(
            20,
            Math.min(
                windowWidth - containerWidth - 20,
                buttonRect.left - containerWidth / 2,
            ),
        );
    }

    // Ajustement vertical
    if (newTop + containerHeight > windowHeight) {
        newTop = Math.max(20, windowHeight - containerHeight - 20);
    }

    // S'assurer que le container reste dans les limites
    newTop = Math.max(20, newTop);
    newLeft = Math.max(20, newLeft);

    // Appliquer la nouvelle position
    container.style.top = newTop + 'px';
    container.style.left = newLeft + 'px';
    container.style.bottom = 'auto';
}

// Récupérer la position sauvegardée du bouton flottant
if (chloeFloatingBtn) {
    chrome.storage.local.get(['chloeButtonPosition'], (result) => {
        if (result.chloeButtonPosition && chloeFloatingBtn) {
            const { top, left } = result.chloeButtonPosition;
            chloeFloatingBtn.style.top = top;
            chloeFloatingBtn.style.left = left;
        }
    });

    // Événement mousedown - début du drag
    chloeFloatingBtn.addEventListener('mousedown', (e: MouseEvent) => {
        e.preventDefault();
        isDragging = true;
        hasMoved = false; // Réinitialiser le flag de mouvement
        dragStartTime = Date.now();

        // Position de la souris au début
        startX = e.clientX;
        startY = e.clientY;

        // Position du bouton au début
        const rect = chloeFloatingBtn!.getBoundingClientRect();
        startTop = rect.top;
        startLeft = rect.left;

        // Ajouter les événements globaux
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        // Ne pas modifier userSelect ici, on le fait seulement lors du drag réel
    }); // Fonction pour gérer le mouvement
    function handleMouseMove(e: MouseEvent) {
        if (!isDragging || !chloeFloatingBtn) return;

        // Calculer le déplacement depuis le point de départ
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Vérifier si on a dépassé le seuil de mouvement
        if (!hasMoved && distance > DRAG_THRESHOLD) {
            hasMoved = true;
            // Maintenant on peut commencer le drag visuel
            chloeFloatingBtn.classList.add('dragging');
            document.body.style.userSelect = 'none';
        }

        // Ne bouger le bouton que si on a dépassé le seuil
        if (!hasMoved) return;

        e.preventDefault();

        let newTop = startTop + deltaY;
        let newLeft = startLeft + deltaX;

        // Contraintes pour rester dans la fenêtre
        const buttonWidth = chloeFloatingBtn.offsetWidth;
        const buttonHeight = chloeFloatingBtn.offsetHeight;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Limites
        newTop = Math.max(0, Math.min(newTop, windowHeight - buttonHeight));
        newLeft = Math.max(0, Math.min(newLeft, windowWidth - buttonWidth));

        // Appliquer la nouvelle position
        chloeFloatingBtn.style.top = newTop + 'px';
        chloeFloatingBtn.style.left = newLeft + 'px';
    }

    // Fonction pour terminer le drag
    function handleMouseUp(e: MouseEvent) {
        if (!isDragging || !chloeFloatingBtn) return;

        const dragDuration = Date.now() - dragStartTime;
        const wasClick = !hasMoved; // Si on n'a pas bougé, c'est un click

        isDragging = false;

        // Retirer les événements globaux
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        // Si c'était un click (pas de mouvement), gérer le toggle de Chloe
        if (wasClick) {
            const container = document.getElementById('chloe-extension');
            if (container) {
                // Vérifier si on est sur une page valide
                if (isValidPage(window.location.href)) {
                    // Toggle l'état de l'extension
                    if (container.classList.contains('retracted')) {
                        container.classList.remove('retracted');
                        adjustContainerPosition();
                    } else {
                        container.classList.add('retracted');
                    }
                } else {
                    // Afficher le toast d'erreur et empêcher l'ouverture
                    showGlobalErrorToast('Profil non trouvé');
                    // Ne pas ouvrir l'extension
                }
            }
        }

        // Retirer les classes CSS et restaurer les styles seulement si on a dragué
        if (hasMoved) {
            chloeFloatingBtn.classList.remove('dragging');
            chloeFloatingBtn.classList.add('dropping');

            // Retirer la classe dropping après l'animation
            setTimeout(() => {
                if (chloeFloatingBtn) {
                    chloeFloatingBtn.classList.remove('dropping');
                }
            }, 300);
        }

        document.body.style.userSelect = '';

        // Sauvegarder la position et ajuster le container seulement si on a dragué
        if (hasMoved) {
            const position = {
                top: chloeFloatingBtn.style.top,
                left: chloeFloatingBtn.style.left,
            };
            chrome.storage.local.set({ chloeButtonPosition: position });

            // Ajuster la position du container avec animation
            const container = document.getElementById('chloe-extension');
            if (container) {
                container.classList.add('repositioning');
                adjustContainerPosition();
                setTimeout(() => {
                    container.classList.remove('repositioning');
                }, 300);
            }
        }

        // Réinitialiser le flag de mouvement pour le prochain interaction
        hasMoved = false;
    }

    // Effet hover pour indiquer que le bouton est draggable
    chloeFloatingBtn.addEventListener('mouseenter', () => {
        if (!isDragging && chloeFloatingBtn) {
            // Les styles hover sont maintenant gérés par CSS
        }
    });

    chloeFloatingBtn.addEventListener('mouseleave', () => {
        if (!isDragging && chloeFloatingBtn) {
            // Les styles hover sont maintenant gérés par CSS
        }
    });
}

// Ajuster la position du container lors du redimensionnement de la fenêtre
window.addEventListener('resize', () => {
    const container = document.getElementById('chloe-extension');
    if (container && !container.classList.contains('retracted')) {
        adjustContainerPosition();
    }
});

retractButton?.addEventListener('click', () => {
    const shell = document.getElementById('chloe-extension');
    if (shell) {
        shell.classList.add('retracted');
        // Le bouton flottant reste toujours visible
    }
});

titleButton?.addEventListener('click', () => {
    // Vérifier si on est sur une page valide avant d'afficher le contenu
    if (isValidPage(location.href)) {
        if (location.href.includes('/in/')) {
            displayProfilePage(bodyEl, 'people');
        } else {
            displayProfilePage(bodyEl, 'organization');
        }
    } else {
        showGlobalErrorToast('Profil non trouvé');
        // Afficher un message d'erreur dans le body
        bodyEl.innerHTML = `
            <div class="error-message">
                <div class="error-message__icon">⚠️</div>
                <h3 class="error-message__title">Profil non trouvé</h3>
                <p class="error-message__text">Cette fonctionnalité n'est disponible que sur les pages de profil LinkedIn, d'entreprise ou d'école.</p>
            </div>
        `;
    }
});

settingsBtn?.addEventListener('click', () => {
    displaySettingsPage(bodyEl);
});

// Init first-load pour les URLs déjà sur profil/org/school
function renderFor(url: string) {
    const isProfile = url.includes('/in/');
    const isOrg = url.includes('/company/') || url.includes('/school/');

    // L'extension reste toujours rétractée par défaut, peu importe la page
    shell.classList.add('retracted');

    if (isProfile || isOrg) {
        // Sur les pages valides, préparer le contenu approprié mais garder l'extension fermée
        displayProfilePage(bodyEl, isProfile ? 'people' : 'organization');
    } else {
        // Sur les pages non valides, préparer le message d'erreur
        bodyEl.innerHTML = `
            <div class="error-message">
                <div class="error-message__icon">⚠️</div>
                <h3 class="error-message__title">Profil non trouvé</h3>
                <p class="error-message__text">Cette fonctionnalité n'est disponible que sur les pages de profil LinkedIn, d'entreprise ou d'école.</p>
            </div>
        `;
    }
}

// Un petit observer pour l’initialisation (DOM prêt) puis on passe au background pour la suite
const observer = new MutationObserver((_m, obs) => {
    if (document.body.contains(shell)) {
        renderFor(location.href);
        chrome.runtime.sendMessage(
            {
                action: 'CONTENT_READY',
                url: location.href,
            },
            () => {
                chrome.runtime.onMessage.addListener((request) => {
                    if (request.action === 'LI_URL_CHANGED') {
                        renderFor(request.url);
                    }
                });
            },
        );
        obs.disconnect();
    }
});

observer.observe(document.body, { childList: true, subtree: true });
