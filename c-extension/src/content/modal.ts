import displaySettingsPage from './settings-page';

export function displayModal() {
    const body = document.getElementById('chloe-extension-body');
    if (body) {
        // Supprime toute modal existante avant d'en ajouter une nouvelle
        const oldModal = document.getElementById('modal');
        if (oldModal) oldModal.remove();

        const modalSection = document.createElement('section');
        modalSection.id = 'modal';
        modalSection.className = 'modal-background';

        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'modal-overlay';
        modalOverlay.className = 'modal-background__overlay';

        const closeButton = document.createElement('button');
        closeButton.id = 'modal-close-button';
        closeButton.className = 'modal-background__overlay__close-button';
        closeButton.textContent = 'x';

        modalOverlay.appendChild(closeButton);
        modalSection.appendChild(modalOverlay);
        body.appendChild(modalSection);

        modalSection.addEventListener('click', (e) => {
            if (e.target === modalSection) {
                closeModal();
            }
        });
        closeButton.addEventListener('click', () => {
            closeModal();
        });
    }
}
export function displayCreateListModal() {
    displayModal();
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        const contentDiv = document.createElement('div');
        contentDiv.className = 'modal-content create-list';
        contentDiv.innerHTML = `
            <h2 class="create-list__title">Créer une nouvelle liste</h2>
            <form id="create-list-form" class="create-list__form">
                <div class="create-list__field-group">
                    <label for="list-name" class="create-list__label">Nom de la liste :</label>
                    <input type="text" id="list-name" name="list-name" class="create-list__input" required />
                </div>
                <div class="create-list__checkbox-group">
                    <input type="checkbox" id="entreprise" name="entreprise" class="create-list__checkbox" />
                    <label for="entreprise" class="create-list__label create-list__label--checkbox">Entreprise & école</label>
                </div>
                <div class="create-list__checkbox-group">
                    <input type="checkbox" id="user" name="user" class="create-list__checkbox" />
                    <label for="user" class="create-list__label create-list__label--checkbox">Utilisateur</label>
                </div>
                <div class="create-list__checkbox-group">
                    <input type="checkbox" id="is-private" name="is-private" class="create-list__checkbox" />
                    <label for="is-private" class="create-list__label create-list__label--checkbox">Privée</label>
                </div>
                <button type="submit" class="create-list__submit-button submit-button">Créer ma liste</button>
            </form>
        `;
        modalOverlay.appendChild(contentDiv);

        const form = document.getElementById('create-list-form');
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            const listNameInput = document.getElementById(
                'list-name',
            ) as HTMLInputElement;
            const listName = listNameInput.value;
            const isEntreprise = (
                document.getElementById('entreprise') as HTMLInputElement
            ).checked;
            const isUser = (document.getElementById('user') as HTMLInputElement)
                .checked;
            const isPrivate = (
                document.getElementById('is-private') as HTMLInputElement
            ).checked;
            console.log('Creating list:', {
                listName,
                isEntreprise,
                isUser,
                isPrivate,
            });
        });
    }
}

export function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.remove();
    }
}

export function displayCreateContextModal() {
    displayModal();
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        const contentDiv = document.createElement('div');
        contentDiv.className = 'modal-content create-context';
        contentDiv.innerHTML = `
            <h2 class="create-context__title">Créer un nouveau contexte</h2>
            <form id="create-context-form" class="create-context__form">
                <label for="context-name" class="create-context__label">Nom du contexte :</label>
                <input type="text" id="context-name" name="context-name" class="create-context__input" required />
                <label for="context-description" class="create-context__label">Description :</label>
                <textarea id="context-description" name="context-description" class="create-context__textarea" resize rows="4"></textarea>
                <input type="checkbox" id="is-default" name="is-default" class="create-context__checkbox" />
                <label for="is-default" class="create-context__label create-context__label--checkbox">Définir comme contexte par défaut</label>
                <button type="submit" class="create-context__submit-button submit-button">Créer le contexte</button>
            </form>
        `;
        modalOverlay.appendChild(contentDiv);

        const form = document.getElementById('create-context-form');
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            const contextNameInput = document.getElementById(
                'context-name',
            ) as HTMLInputElement;
            const contextDescriptionInput = document.getElementById(
                'context-description',
            ) as HTMLInputElement;
            const isDefaultInput = document.getElementById(
                'is-default',
            ) as HTMLInputElement;
            const contextName = contextNameInput.value;
            const contextDescription = contextDescriptionInput.value;
            const isDefault = isDefaultInput.checked;
            console.log('Creating context:', {
                contextName,
                contextDescription,
                isDefault,
            });

            chrome.runtime.sendMessage(
                {
                    action: 'CREATE_AICONTEXT',
                    data: {
                        title: contextName,
                        content: contextDescription,
                        default: isDefault,
                    },
                },
                () => {
                    if (chrome.runtime.lastError) {
                        console.error(
                            'runtime error:',
                            chrome.runtime.lastError,
                        );
                        return;
                    } else {
                        const chloeBody = document.getElementById(
                            'chloe-extension-body',
                        );
                        if (chloeBody) {
                            chloeBody.innerHTML = '';
                            displaySettingsPage(chloeBody);
                            closeModal();
                        }
                    }
                },
            );
        });
    }
}
