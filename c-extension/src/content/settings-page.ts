import {
    displayCreateContextModal,
    displayCreateListModal,
    displayModal,
} from './modal';

export default function displaySettingsPage(container: HTMLElement) {
    const imgBaseUrl = chrome.runtime.getURL('public/assets/images');
    container.innerHTML = `
        <div class="chloe-extension__body__personnal-info">
            <h2> Mon compte </h2>
            <p> Email : <span class="email">user@example.com</span> </p>
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
                <li class="chloe-extension__body__my-contexts__container__item">
                    <p> <img src="${imgBaseUrl}/icons/document.png" class="icon" alt="document icon"/> Agent IA </p>
                    <div class="chloe-extension__body__my-contexts__container__item__action"> 
                        <button class="chloe-extension__body__my-contexts__container__item__action__btn action-btn"> <img src="${imgBaseUrl}/icons/modify.png" class="icon" alt="document icon"/> </button>
                        <button class="chloe-extension__body__my-contexts__container__item__action__btn action-btn"> <img src="${imgBaseUrl}/icons/trash.png" class="icon" alt="document icon"/> </button>
                    </div>
                </li>
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

    const createListButton = document.getElementById('add-list-button');

    createListButton?.addEventListener('click', () => {
        displayCreateListModal();
    });

    const createContextButton = document.getElementById('add-context-button');

    createContextButton?.addEventListener('click', () => {
        displayCreateContextModal();
    });
}
