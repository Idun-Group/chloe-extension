import { displayCreateContextModal, displayCreateListModal } from './modal';
import { displayListPage } from './profile-list-tab';
import createToast from './toast';

export default function displaySettingsPage(container: HTMLElement) {
    console.log('Displaying Settings Page');
    chrome.runtime.sendMessage({ action: 'GET_TOKEN' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('runtime error:', chrome.runtime.lastError);
            return;
        }
        const { token } = response;

        console.log('token :', token);
        if (!token) {
            container.innerHTML =
                '<h1>Veuillez vous connecter pour accéder aux paramètres.</h1>';
        } else {
            const imgBaseUrl = chrome.runtime.getURL('public/assets/images');
            chrome.runtime.sendMessage(
                { action: 'GET_PROFILE' },
                (response) => {
                    console.log('profile response :', response);
                    container.innerHTML = `
                        <div class="chloe-extension__body__personnal-info">
                            <h2> Mon compte </h2>
                            <h3> ${response.profile.fullName} </h3>
                            <p> Email : <span class="email">${
                                response.profile.email
                            }</span> </p>
                        </div>

                        <div class="chloe-extension__body__my-lists">
                            <div class="chloe-extension__body__my-lists__header">
                                <h3> Mes listes </h3> 
                                <button id="add-list-button" class="add-button"> Créer </button>
                            </div>

                            ${
                                response.profile.profileList &&
                                response.profile.profileList.length > 0
                                    ? `
                                    <ul class="chloe-extension__body__my-lists__container">
                                        ${
                                            response.profile.profileList
                                                ? response.profile.profileList
                                                      .map(
                                                          (list: {
                                                              id: string;
                                                              name: string;
                                                              type:
                                                                  | 'PEOPLE'
                                                                  | 'ORGANIZATION';
                                                              peopleProfiles: any[];
                                                              organizationProfiles: any[];
                                                          }) => `
                                                    <li class="chloe-extension__body__my-lists__container__item profile-list-item" data-list-id="${
                                                        list.id
                                                    }">
                                                        <p>
                                                            <img src="${imgBaseUrl}/icons/members.png" class="icon" alt="list icon"/>
                                                            ${list.name} | ${
                                                              {
                                                                  PEOPLE: `${list.peopleProfiles.length} personnes`,
                                                                  ORGANIZATION: `${list.organizationProfiles.length} entreprises`,
                                                              }[list.type]
                                                          }
                                                        </p>
                                                        
                                                        <div>
                                                            <button class="delete-list-button action-btn"> <img src="${imgBaseUrl}/icons/trash.png" class="icon" alt="document icon"/> </button>

                                                            <button class="download-list-button action-btn" data-list-name="${
                                                                list.name
                                                            }">
                                                                <img src="${imgBaseUrl}/icons/export.png" class="icon" alt="export icon"/>
                                                            </button>

                                                            <button class="go-to-list-button action-btn" data-list-name="${
                                                                list.name
                                                            }">
                                                                <img src="${imgBaseUrl}/icons/go-to.png" class="icon" alt="Go To icon"/>
                                                            </button>
                                                        </div>
                                                    </li>
                                                `,
                                                      )
                                                      .join('')
                                                : '<p>Aucune liste trouvée.</p>'
                                        }
                                    </ul>
                                    `
                                    : `<p>Aucune liste trouvée. Créez-en une pour commencer à organiser vos contacts !</p>`
                            }
                        </div>

                        <div class="chloe-extension__body__my-contexts">
                            <div class="chloe-extension__body__my-contexts__header">
                                <h3> Mes Contextes </h3> 
                                <button id="add-context-button" class="add-button"> Créer </button>
                            </div>

                            ${
                                response.profile.aiContext &&
                                response.profile.aiContext.length > 0
                                    ? `
                                        <ul class="chloe-extension__body__my-contexts__container">
                                            ${response.profile.aiContext
                                                .map(
                                                    (context: {
                                                        id: string;
                                                        title: string;
                                                        content: string;
                                                        default: boolean;
                                                    }) => `
                                                    <li data-id="${
                                                        context.id
                                                    }" class="chloe-extension__body__my-contexts__container__item chloe-context-item">
                                                        <p> <img src="${imgBaseUrl}/icons/document.png" class="icon" alt="document icon"/> ${
                                                        context.title
                                                    } </p> ${
                                                        context.default
                                                            ? '<span class="default-badge">Par défaut</span>'
                                                            : ''
                                                    }
                                                        <div class="chloe-extension__body__my-contexts__container__item__action"> 
                                                            <button class="chloe-extension__body__my-contexts__container__item__action__btn chloe-context-modify action-btn"> <img src="${imgBaseUrl}/icons/modify.png" class="icon" alt="document icon"/> </button>
                                                            <button class="chloe-extension__body__my-contexts__container__item__action__btn chloe-context-delete action-btn"> <img src="${imgBaseUrl}/icons/trash.png" class="icon" alt="document icon"/> </button>
                                                        </div>
                                                    </li>
                                                `,
                                                )
                                                .join('')}
                                        </ul>
                                    `
                                    : `<p>Aucun contexte trouvé. Créez-en un pour améliorer vos interactions !</p>`
                            }
                        </div>

                        <div class="chloe-extension__body__profile__outreach">
                            <h3> Enrichissement </h3>
                            <button class="chloe-extension__body__profile__outreach__prepare-button"> 
                                <img class="chloe-extension__body__profile__outreach__prepare-button__icon" src="${imgBaseUrl}/icons/magnifying-glass.png" alt="message icon" />
                                Lancer une recherche approfondie
                            </button>
                        </div>

                    `;

                    const createListButton =
                        document.getElementById('add-list-button');

                    createListButton?.addEventListener('click', () => {
                        displayCreateListModal();
                    });

                    const createContextButton =
                        document.getElementById('add-context-button');

                    createContextButton?.addEventListener('click', () => {
                        displayCreateContextModal();
                    });

                    const profileListItems =
                        document.querySelectorAll('.profile-list-item');

                    profileListItems.forEach((item) => {
                        const listId = item.getAttribute('data-list-id');

                        item.querySelector(
                            '.download-list-button',
                        )?.addEventListener('click', (e) => {
                            e.stopPropagation();
                            // Récupérer l'ID directement depuis l'élément parent pour éviter le problème de closure
                            const currentListId = (e.target as HTMLElement)
                                .closest('.profile-list-item')
                                ?.getAttribute('data-list-id');
                            console.log('Download list:', currentListId);
                            chrome.runtime.sendMessage(
                                {
                                    action: 'DOWNLOAD_PROFILE_LIST',
                                    data: { id: currentListId },
                                },
                                (response) => {
                                    console.log('Download response:', response);
                                },
                            );
                        });

                        item.querySelector(
                            '.delete-list-button',
                        )?.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const currentListId = (e.target as HTMLElement)
                                .closest('.profile-list-item')
                                ?.getAttribute('data-list-id');
                            console.log('Delete list:', currentListId);
                            chrome.runtime.sendMessage(
                                {
                                    action: 'DELETE_PROFILE_LIST',
                                    data: { id: currentListId },
                                },
                                (response) => {
                                    console.log('Delete response:', response);

                                    if (response.message) {
                                        displaySettingsPage(container);
                                        createToast(
                                            'Liste supprimée avec succès',
                                            'success',
                                        );
                                    }
                                },
                            );
                        });

                        item.querySelector(
                            '.go-to-list-button',
                        )?.addEventListener('click', (e) => {
                            e.stopPropagation();
                            // Même correction pour le bouton "go-to-list"
                            const currentListId = (e.target as HTMLElement)
                                .closest('.profile-list-item')
                                ?.getAttribute('data-list-id');
                            displayListPage(currentListId!);
                        });
                    });

                    const contextItems = document.querySelectorAll(
                        '.chloe-context-item',
                    );

                    contextItems.forEach((item) => {
                        const contextId = item.getAttribute('data-id');
                        console.log('Clicked context with id:', contextId);
                        // Ici, tu peux ajouter le code pour gérer la modification du contexte

                        item.querySelector(
                            '.chloe-context-modify',
                        )?.addEventListener('click', (e) => {
                            e.stopPropagation();
                            console.log('Modify context with id:', contextId);

                            chrome.runtime.sendMessage(
                                {
                                    action: 'GET_AICONTEXT_BY_ID',
                                    data: { id: contextId },
                                },
                                (response) => {
                                    displayCreateContextModal('edit', response);
                                },
                            );
                        });

                        item.querySelector(
                            '.chloe-context-delete',
                        )?.addEventListener('click', (e) => {
                            e.stopPropagation();
                            if (
                                confirm(
                                    'Voulez-vous vraiment supprimer ce contexte ?',
                                )
                            ) {
                                chrome.runtime.sendMessage(
                                    {
                                        action: 'DELETE_AICONTEXT',
                                        data: { id: contextId },
                                    },
                                    (response) => {
                                        if (response.ok) {
                                            displaySettingsPage(container);
                                        } else {
                                            createToast(
                                                'Erreur lors de la suppression du contexte',
                                                'error',
                                            );
                                        }

                                        createToast(
                                            response.ok
                                                ? 'Contexte supprimé avec succès'
                                                : 'Erreur lors de la suppression du contexte',
                                            response.ok ? 'success' : 'error',
                                        );
                                    },
                                );
                            }
                        });
                    });
                },
            );
        }
    });
}
