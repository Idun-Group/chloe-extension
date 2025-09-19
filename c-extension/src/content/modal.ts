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

                <div class="create-list__field-group">
                    <label for="list-description" class="create-list__label">Description :</label>
                    <textarea id="list-description" name="list-description" class="create-list__textarea" resize rows="4"></textarea>
                </div>

                <div class="create-list__field-group">
                    <label for="list-type" class="create-list__label">Type de liste :</label>
                    <select id="list-type" name="list-type" class="create-list__select">
                        <option value="PEOPLE">Personnes</option>
                        <option value="ORGANIZATION">Entreprises</option>
                    </select>
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

            const listDescriptionInput = document.getElementById(
                'list-description',
            ) as HTMLTextAreaElement;

            const listTypeSelect = document.getElementById(
                'list-type',
            ) as HTMLSelectElement;
            console.log('Creating list:', {
                listName,
                listDescription: listDescriptionInput.value,
                listType: listTypeSelect.value,
            });

            chrome.runtime.sendMessage(
                {
                    action: 'CREATE_PROFILE_LIST',
                    data: {
                        name: listName,
                        description: listDescriptionInput.value,
                        type: listTypeSelect.value,
                    },
                },
                (response) => {
                    if (response.success) {
                        console.log(
                            'List created successfully:',
                            response.data,
                        );

                        displaySettingsPage(
                            document.getElementById(
                                'chloe-extension-body',
                            ) as HTMLElement,
                        );
                    } else {
                        console.error('Error creating list:', response.error);
                    }
                },
            );
        });
    }
}

export function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.remove();
    }
}

export function displayCreateContextModal(
    type: 'create' | 'edit' = 'create',
    contextData?: {
        id: string;
        title: string;
        content: string;
        default: boolean;
    },
) {
    displayModal();
    const modalOverlay = document.getElementById('modal-overlay');

    console.log(contextData);
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

        // Pré-remplissage des champs en mode édition
        if (type === 'edit' && contextData) {
            const contextNameInput = document.getElementById(
                'context-name',
            ) as HTMLInputElement;
            const contextDescriptionInput = document.getElementById(
                'context-description',
            ) as HTMLTextAreaElement;
            const isDefaultInput = document.getElementById(
                'is-default',
            ) as HTMLInputElement;
            if (contextNameInput)
                contextNameInput.value = contextData.title || '';
            if (contextDescriptionInput)
                contextDescriptionInput.value = contextData.content || '';
            if (isDefaultInput) isDefaultInput.checked = !!contextData.default;
        }

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
            if (type === 'create') {
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
                                displaySettingsPage(chloeBody);
                            }
                        }
                    },
                );
            } else if (type === 'edit' && contextData) {
                chrome.runtime.sendMessage(
                    {
                        action: 'EDIT_AICONTEXT',
                        data: {
                            ...contextData,
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
                        }
                        const chloeBody = document.getElementById(
                            'chloe-extension-body',
                        );
                        if (chloeBody) {
                            displaySettingsPage(chloeBody);
                        }
                    },
                );
            }
        });
    }
}

export function displayAddToListModal(
    profileType: 'PEOPLE' | 'ORGANIZATION',
    fullName: string,
    location: string,
    jobTitle?: string,
    email?: string,
    phone?: string,
) {
    displayModal();
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        const contentDiv = document.createElement('div');
        contentDiv.className = 'modal-content add-to-list';

        chrome.runtime.sendMessage(
            { action: 'GET_PROFILELISTS_BY_TYPE', type: profileType },
            (response) => {
                console.log(response);
                contentDiv.innerHTML = `
                    <h2 class="add-to-list__title">Ajouter à une liste</h2>
                    <div id="add-to-list-container" class="add-to-list__container">
                        ${
                            response.length === 0
                                ? `
                                <p class="add-to-list__no-lists">Aucune liste disponible. Créez-en une nouvelle dans les paramètres.</p>
                                <button id="create-list-button" class="add-to-list__create-list-button submit-button">Créer une liste</button>`
                                : `
                                <ul class="add-to-list__list">
                                    ${response
                                        .map(
                                            (list: {
                                                id: string;
                                                name: string;
                                            }) => `
                                                <li class="add-to-list__list__item profile-list-item" data-list-id="${list.id}">
                                                    <span class="add-to-list__list__item__name">${list.name}</span>
                                                    <button class="add-to-list__list__item__button add-button">Ajouter</button>
                                                </li>
                                            `,
                                        )
                                        .join(``)}
                                </ul>
                            `
                        }
                    </div>
                `;

                contentDiv
                    .querySelectorAll('.profile-list-item')
                    .forEach((item) => {
                        const addButton = item.querySelector(
                            '.add-button',
                        ) as HTMLButtonElement;

                        addButton.addEventListener('click', () => {
                            const listId = item.getAttribute('data-list-id');
                            const linkedinUrl = window.location.href;
                            chrome.runtime.sendMessage(
                                {
                                    action: 'ADD_TO_LIST',
                                    type: profileType,
                                    listId,
                                    data: {
                                        linkedinUrl,
                                        job: jobTitle,
                                        fullName,
                                        location,
                                        email,
                                        phone,
                                    },
                                },
                                () => {
                                    alert('Profil ajouté à la liste !');
                                },
                            );
                        });
                    });
            },
        );

        modalOverlay.appendChild(contentDiv);
    }
}
