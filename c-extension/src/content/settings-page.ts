import { displayCreateContextModal, displayCreateListModal } from './modal';

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
                            <div class="info-container"> 
                                <p> Abonnement : <span class="plan">Gratuit</span> </p>
                                <button> Passer Premium </button>
                                <div class="info-container"> i </div>
                            </div>
                        </div>

                        <div class="chloe-extension__body__my-lists">
                            <div class="chloe-extension__body__my-lists__header">
                                <h3> Mes listes </h3> 
                                <button id="add-list-button" class="add-button"> Créer </button>
                            </div>

                            <ul class="chloe-extension__body__my-lists__container">
                                <li class="chloe-extension__body__my-lists__container__item">
                                    <p>
                                        <img src="${imgBaseUrl}/icons/members.png" class="icon" alt="list icon"/>
                                        Tech & SSII | 9 personnes | 3 entreprises 
                                    </p> 
                                    <button class="action-btn"> <img src="${imgBaseUrl}/icons/go-to.png" class="icon" alt="document icon"/> </button>
                                </li>
                                <li class="chloe-extension__body__my-lists__container__item">
                                    <p> 
                                        <img src="${imgBaseUrl}/icons/members.png" class="icon" alt="list icon"/>
                                        BTP & Industries | 3 personnes | 5 entreprises
                                    </p>
                                    <button class="action-btn"> <img src="${imgBaseUrl}/icons/go-to.png" class="icon" alt="document icon"/> </button>
                                </li>
                            </ul>
                        </div>

                        <div class="chloe-extension__body__my-contexts">
                            <div class="chloe-extension__body__my-contexts__header">
                                <h3> Mes Contextes </h3> 
                                <button id="add-context-button" class="add-button"> Créer </button>
                            </div>

                            <ul class="chloe-extension__body__my-contexts__container">
                               ${response.profile.contexts.map(
                                   (context: {
                                       title: string;
                                       content: string;
                                       isDefault: boolean;
                                   }) => `
                                    <li class="chloe-extension__body__my-contexts__container__item">
                                        <p> <img src="${imgBaseUrl}/icons/document.png" class="icon" alt="document icon"/> ${
                                       context.title
                                   } </p> ${
                                       context.isDefault
                                           ? '<span class="default-badge">Par défaut</span>'
                                           : ''
                                   }
                                        <div class="chloe-extension__body__my-contexts__container__item__action"> 
                                            <button class="chloe-extension__body__my-contexts__container__item__action__btn action-btn"> <img src="${imgBaseUrl}/icons/modify.png" class="icon" alt="document icon"/> </button>
                                            <button class="chloe-extension__body__my-contexts__container__item__action__btn action-btn"> <img src="${imgBaseUrl}/icons/trash.png" class="icon" alt="document icon"/> </button>
                                        </div>
                                     </li>
                                `,
                               )}
                            </ul>
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
                },
            );
        }
    });
}
