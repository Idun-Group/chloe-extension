// --- Utils pour scrapping posts entreprise

import { displayLoader, hideLoader } from './loader';
import { displayAddToListModal } from './modal';

// --- Navigation SPA : écoute les changements d'URL et rafraîchit la vue
let lastUrl = '';
function getProfileTypeFromUrl(url: string) {
    if (/linkedin\.com\/(company|school)\//.test(url)) return 'organization';
    if (/linkedin\.com\/in\//.test(url)) return 'people';
    return null;
}

function renderProfilePage(force = false) {
    const url = location.href;
    const profileType = getProfileTypeFromUrl(url);
    if (!profileType) return; // Ne rien afficher si ce n'est pas un profil reconnu
    if (force || url !== lastUrl) {
        lastUrl = url;
        const container = document.querySelector('.chloe-extension__body');
        if (container) {
            displayProfilePage(container as HTMLElement, profileType);
        }
    }
}

// Initialisation dès le premier chargement
document.addEventListener('DOMContentLoaded', () => {
    renderProfilePage(true);
});

// Timer pour surveiller les changements d'URL (SPA)
setInterval(() => renderProfilePage(false), 500);

// Réagit aux messages du background (navigation Chrome)
chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.action === 'CONTENT_READY') {
        renderProfilePage(true);
    }
});
const clean = (t?: string | null) => (t ?? '').replace(/\s+/g, ' ').trim();

async function waitFor<T extends Element>(
    sel: string,
    timeout = 6000,
): Promise<T | null> {
    const first = document.querySelector<T>(sel);
    if (first) return first;
    return new Promise<T | null>((resolve) => {
        const obs = new MutationObserver(() => {
            const el = document.querySelector<T>(sel);
            if (el) {
                obs.disconnect();
                resolve(el);
            }
        });
        obs.observe(document.documentElement, {
            childList: true,
            subtree: true,
        });
        setTimeout(() => {
            obs.disconnect();
            resolve(null);
        }, timeout);
    });
}

interface CompanyUpdate {
    description: string | null;
    dateText: string | null; // ex: "2 h", "5 j", "1 sem"
    url: string | null;
}

export async function scrapeCompanyUpdates(max = 6): Promise<CompanyUpdate[]> {
    const root = await waitFor<HTMLElement>(
        'section.org-view-section .org-view-updates-carousel',
    );
    if (!root) return [];
    const items = Array.from(
        root.querySelectorAll<HTMLLIElement>(
            'ul.artdeco-carousel__slider > li.artdeco-carousel__item',
        ),
    ).filter((li) => !!li.querySelector('[data-view-name="feed-full-update"]'));
    const results: CompanyUpdate[] = [];
    for (const li of items.slice(0, max)) {
        // Ne pas déclencher de clic pour éviter la redirection
        // On récupère uniquement le texte visible
        const description =
            clean(
                li.querySelector<HTMLElement>(
                    '.update-components-update-v2__commentary .update-components-text',
                )?.textContent,
            ) || null;
        const dateText =
            clean(
                li.querySelector<HTMLElement>(
                    '.update-components-actor__sub-description',
                )?.textContent,
            ) ||
            clean(
                li.querySelector<HTMLElement>(
                    '.update-components-actor__sub-description .visually-hidden',
                )?.textContent,
            ) ||
            null;
        const url =
            li.querySelector<HTMLAnchorElement>(
                'a.tap-target[href*="/feed/update/"]',
            )?.href ||
            li.querySelector<HTMLAnchorElement>('a[href*="/feed/update/"]')
                ?.href ||
            null;
        results.push({ description, dateText, url });
    }
    return results;
}
export function displayProfilePage(
    container: HTMLElement,
    profileType: 'people' | 'organization',
    linkedInData?: any, // Données récupérées depuis le backend
) {
    container.innerHTML = `
        <nav class="chloe-extension__body__nav"> 
            <div id="btn-people" class="chloe-extension__body__nav__button${
                profileType === 'people' ? ' selected' : ''
            }"> Personne </div>
            <div id="btn-company" class="chloe-extension__body__nav__button${
                profileType === 'organization' ? ' selected' : ''
            }"> Entreprise </div>
        </nav>
        <section id="chloe-extension-body-profile" class="chloe-extension__body__profile"></section>
    `;
    const profileContent = container.querySelector(
        '#chloe-extension-body-profile',
    );
    if (profileContent) {
        const contentEl = profileContent as HTMLElement;
        (profileType === 'people' ? displayPeoplePage : displayCompanyPage)(
            contentEl,
        );
    }
}

async function displayPeoplePage(container: HTMLElement) {
    const imgUrl = chrome.runtime.getURL('public/assets/images');
    const user = location.href.split('/')[4];

    const url = location.href;

    container.innerHTML = `
        <button id="add-profile-button" class="add-profile-button"> Ajouter à une liste </button>
        <div class="chloe-extension__body__profile__introduce">
            <h2 id="profile-full-name" class="chloe-extension__body__profile__introduce__full-name"> Prénom Nom </h2>
            <p> <span id="profile-job"> Job name </span>  <span id="profile-companie"> Entreprise </span> </p>
            <p> Séniorité : <span id="seniority"> + ans </span> | Location : <span id="profile-location"> Ville, Pays </span> </p>
        </div>

        <div class="chloe-extension__body__profile__contacts">
            <h3> Contacts </h3>
            <div class="info-container">
                <p class="info-container"> 
                    téléphone :  <span id="profile-phone"> 06 ** ** ** ** </span> 
                    <button id="get-phone-button"> obtenir </button> 
                    <div class="info-button" id="get-phone-info" data-tip="5 crédits par obtentions"> i </div>
                </p>
            </div>

            <div class="info-container">
                <p>
                    email : <span id="profile-email"> ***@***.com </span> 
                    <button id="get-email-button"> obtenir </button> 
                </p>
                <div class="info-button"data-tip="5 crédits par obtentions" id="get-email-info"> i </div>
            </div>
        </div>

        <div id="profile-activity" class="chloe-extension__body__profile__activities">
             <div class="chloe-extension__body__profile__activities__header info-container">
                <h3> Activités  </h3>
                <button> Résumer </button>
                <div class="info-button"> i </div>
            </div>
            <div class="chloe-extension__body__profile__activities__item">
                <div>
                    <p id="profile-activity-date" class="chloe-extension__body__profile__activities__item__date"> Date </p>
                    <p id="profile-activity-description" class="chloe-extension__body__profile__activities__item__description"> lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                </div>

                <button id="go-to-activities" class="go-to-btn"> <img src="${imgUrl}/icons/go-to.png" alt="go to icon" /> </a>
            </div>

            <p class="chloe-extension__body__profile__activities__more"> <span id="profile-activities-count"> 1 </span>+ activités <a href="https://www.linkedin.com/in/${user}/recent-activity/">voir tout</a> </p>
        </div>

        <div class="chloe-extension__body__profile__outreach">
            <h3> Enrichissement </h3>
            <div class="info-container">
                <button class="chloe-extension__body__profile__outreach__prepare-button"> 
                    <img class="chloe-extension__body__profile__outreach__prepare-button__icon" src="${imgUrl}/icons/message.png" alt="message icon" />
                    Préparer un messages Linkedin 
                </button>

                <div class="info-button"> i </div>
            </div>
            <div class="info-container">
                <button class="chloe-extension__body__profile__outreach__prepare-button"> 
                    <img class="chloe-extension__body__profile__outreach__prepare-button__icon" src="${imgUrl}/icons/phone.png" alt="phone icon" />
                    Préparer Appel 
                </button>

                <div class="info-button"> i </div>
            </div>
        </div>
    `;

    const { fullName, job, userLocation } = await scrapeLinkedinUserProfile();
    container.querySelectorAll('.info-button').forEach((button) => {
        button.addEventListener('mouseover', () => {
            console.log('Info button hovered!');
        });
    });
    container
        .querySelector('#go-to-activities')
        ?.addEventListener('click', () => {
            window.open(
                `https://www.linkedin.com/in/${user}/details/recent-activity/`,
                '_blank',
            );
        });

    const addProfileBtn = container.querySelector('#add-profile-button');

    addProfileBtn?.addEventListener('click', () => {
        displayAddToListModal('PEOPLE', {
            fullName,
            location: userLocation,
            job,
        });
    });

    const phoneBtn = container.querySelector('#get-phone-button');

    phoneBtn?.addEventListener('click', () => {
        const linkedinUrl = location.href;

        displayLoader(container, 'Recherche en cours...');

        chrome.runtime.sendMessage(
            {
                action: 'GET_PROFILE_PHONE',
                data: { linkedinUrl },
            },
            (response) => {
                hideLoader();
                console.log('Response from background:', response);

                const phoneSpan = document.getElementById('profile-phone');
                if (phoneSpan) {
                    phoneSpan.textContent =
                        response.phone || 'Téléphone non trouvé';
                }

                phoneBtn?.remove(); // Supprime le bouton après obtention
                document.getElementById('get-phone-info')?.remove();
            },
        );
    });

    const emailBtn = container.querySelector('#get-email-button');
    emailBtn?.addEventListener('click', () => {
        const linkedinUrl = location.href;

        console.log(linkedinUrl);

        displayLoader(container, 'Recherche en cours...');

        chrome.runtime.sendMessage(
            {
                action: 'GET_PROFILE_EMAIL',
                data: { linkedinUrl },
            },
            (response) => {
                hideLoader();
                console.log('Response from background:', response);

                const emailSpan = document.getElementById('profile-email');
                if (emailSpan) {
                    emailSpan.textContent =
                        response.email || 'Email non trouvé';
                }

                emailBtn?.remove(); // Supprime le bouton après obtention
                document.getElementById('get-email-info')?.remove();
            },
        );
    });

    chrome.runtime.sendMessage(
        {
            action: 'REGISTER_PROFILE_IN_HISTORY',
            url: url,
        },
        (response) => {
            if (response.profile && response.status === 'success') {
                console.log('Registered profile:', response);
                document.getElementById('profile-phone')!.textContent =
                    response.profile.phone || '06 ** ** ** **';
                if (response.profile.phone) {
                    phoneBtn?.remove();
                    document.getElementById('get-phone-info')?.remove();
                }
                document.getElementById('profile-email')!.textContent =
                    response.profile.email || '***@***.com';
                if (response.profile.email) {
                    emailBtn?.remove();
                    document.getElementById('get-email-info')?.remove();
                }
            }
        },
    );
}

const displayCompanyPage = async (container: HTMLElement) => {
    const imgUrl = chrome.runtime.getURL('public/assets/images');

    container.innerHTML = `
        <button id="add-profile-button" class="add-profile-button"> Ajouter à une liste </button>
        <div class="chloe-extension__body__profile__introduce">
            <h3 id="company-name"> nom de l'entreprise </h3>
            <p> <span id="nb-employees"> 10+ </span> Employés </p>
            <p> Site Web : <span id="company-website"> www.xyzcorp.com </span> | Location: <span id="company-location"> Paris, France </span> </p>
        </div>

        <div class="chloe-extension__body__profile__members">
            <h3> Membres </h3>

            <div class="chloe-extension__body__profile__members__list">
                <div class="chloe-extension__body__profile__members__list__item">
                    <div class="chloe-extension__body__profile__members__list__item__left">
                        <img class="chloe-extension__body__profile__members__list__item__left__icon" src="${imgUrl}/icons/members.png" alt="User Icon" />
                        <p class="chloe-extension__body__profile__members__list__item__left__name"> Prénom Nom | <span id="member-role"> Rôle </span> </p>
                    </div>
                    <button class="go-to-btn-member"> <img src="${imgUrl}/icons/go-to.png" alt="go to icon" /> </a>
                </div>

                <div class="chloe-extension__body__profile__members__list__item">
                    <div class="chloe-extension__body__profile__members__list__item__left">
                        <img class="chloe-extension__body__profile__members__list__item__left__icon" src="${imgUrl}/icons/members.png" alt="User Icon" />
                        <p class="chloe-extension__body__profile__members__list__item__left__name"> Prénom Nom | <span id="member-role"> Rôle </span> </p>
                    </div>
                    <button class="go-to-btn-member"> <img src="${imgUrl}/icons/go-to.png" alt="go to icon" /> </a>
                </div>
                <a href="#">Voir tous les membres</a> </p>
            </div>
        </div>
        <div class="chloe-extension__body__profile__activities">
            <div class="chloe-extension__body__profile__activities__header info-container">
                <h3> Activités  </h3>
                <button> Résumer </button>
                <div class="info-button"> i </div>
            </div>
            <div class="chloe-extension__body__profile__members__list">
                <div class="chloe-extension__body__profile__activities__item">
                    <div>
                        <p id="company-activity-date" class="chloe-extension__body__profile__activities__item__date"> Date </p>
                        <p id="company-activity-description" class="chloe-extension__body__profile__activities__item__description"> lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                    </div>

                    <button id="go-to-activities" class="go-to-btn"> <img src="${imgUrl}/icons/go-to.png" alt="go to icon" /> </a>
                </div>

                <p class="chloe-extension__body__profile__activities__more"> <span id="activities-count"> 1 </span>+ activités <a href="#">voir tout</a> </p>
            </div>
        </div>
        <div class="chloe-extension__body__profile__outreach">
            <h3> Enrichissement </h3>
            <button class="chloe-extension__body__profile__outreach__prepare-button"> 
                <img class="chloe-extension__body__profile__outreach__prepare-button__icon" src="${imgUrl}/icons/magnifying-glass.png" alt="message icon" />
                Lancer une recherche approfondie
            </button>
        </div>
    `;

    const companyData = await scrapeCompanyTopCard();
    const name = companyData?.name || 'Nom de l’entreprise';
    const location = companyData?.location || 'Paris, France';
    const industry = companyData?.sector || '';
    const employees = companyData?.employees || '10+';

    // Récupère et affiche le dernier post d'entreprise
    setTimeout(() => {
        const activitySection = container.querySelector(
            '.chloe-extension__body__profile__activities',
        ) as HTMLElement;
        const allPosts = document.querySelectorAll(
            'li.artdeco-carousel__item[data-item-index]',
        );
        const firstPost = document.querySelector(
            'li.artdeco-carousel__item.active[data-item-index="0"]',
        );
        const activitiesCountEl = document.getElementById('activities-count');
        if (activitiesCountEl)
            activitiesCountEl.textContent = allPosts.length.toString();
        if (firstPost) {
            // Récupère l'heure (ex: '2 h')
            const dateRaw =
                firstPost
                    .querySelector(
                        '.update-components-actor__sub-description [aria-hidden="true"]',
                    )
                    ?.textContent?.trim() || '';
            const dateMatch = dateRaw.match(/^(\d+\s*[hmj]|\d+\s*sem\.?)/i);
            const dateText = dateMatch ? dateMatch[0].trim() : 'Date inconnue';

            // Récupère la description dans le bon bloc
            const descEl = firstPost.querySelector(
                '.update-components-update-v2__commentary',
            );
            const descText =
                descEl?.textContent?.trim() || 'Aucune description.';

            document.getElementById('company-activity-date')!.textContent =
                dateText;
            document.getElementById(
                'company-activity-description',
            )!.textContent = descText;
            activitySection?.classList.remove('hidden');
        } else {
            activitySection?.classList.add('hidden');
        }
    }, 800);

    const addProfileBtn = container.querySelector('#add-profile-button');

    addProfileBtn?.addEventListener('click', () => {
        displayAddToListModal('ORGANIZATION', undefined, {
            name,
            location,
            industry,
            employees,
        });
    });
};

const scrapeLinkedinUserProfile = async () => {
    const getText = (sel: string) =>
        document.querySelector(sel)?.textContent?.trim() || '';
    const fullName = getText('.artdeco-card h1') || 'Prénom Nom';
    const location =
        getText('.text-body-small.inline.t-black--light.break-words') ||
        'Ville, Pays';
    const job = getText('.text-body-medium.break-words') || 'Job name';
    const companie = getText("button[aria-label*='Entreprise'") || '';

    document.getElementById('profile-full-name')!.textContent = fullName;
    document.getElementById('profile-location')!.textContent = location;
    document.getElementById('profile-job')!.textContent = job;
    document.getElementById('profile-companie')!.textContent = `| ${companie}`;

    // Section activités pour profil utilisateur (pas entreprise)
    setTimeout(() => {
        const lastActivity = document.querySelector(
            'section.pv-profile-card:has(#content_collections) li.artdeco-carousel__item[data-item-index="0"]',
        );
        const activityCount = document.querySelectorAll(
            'section.pv-profile-card:has(#content_collections) li.artdeco-carousel__item',
        ).length;
        if (activityCount === 0) {
            document
                .getElementById('profile-activity')
                ?.classList.add('hidden');
        }
        console.log('Number of activities found:', activityCount);
        if (lastActivity) {
            const lastUpdatedDate = lastActivity.querySelector(
                '.update-components-actor__sub-description span[aria-hidden=true]',
            );
            const lastUpdatedContent = lastActivity.querySelector(
                '.update-components-text.relative',
            );
            const date =
                lastUpdatedDate?.textContent?.trim().replace(' •', '') ||
                'Date de l’activité';
            const description =
                lastUpdatedContent?.textContent
                    ?.trim()
                    .replace(' Voir plus', '') || 'Description de l’activité';
            document.getElementById('profile-activity-date')!.textContent =
                date;
            document.getElementById('profile-activities-count')!.textContent =
                activityCount.toString();
            document.getElementById(
                'profile-activity-description',
            )!.textContent = description;
            highlightTagsInElement(
                document.getElementById('profile-activity-description')!,
            );
        } else {
            console.log('Bloc activité non trouvé');
        }
    }, 2000);
    return { fullName, job, userLocation: location };
};

interface CompanyTopCard {
    sector: string | null;
    specialty: string | null;
    location: string | null;
    employees: string | null;
    followers: string | null;
}

export async function scrapeCompanyTopCard() {
    // root est un <div> :
    const root = await waitFor<HTMLDivElement>(
        '.org-top-card-summary-info-list',
        200,
    );
    if (!root) return null; // après ce guard, root n'est plus null

    // 1) Secteur (1er item direct)
    const sector =
        clean(
            root.querySelector<HTMLDivElement>(
                ':scope > .org-top-card-summary-info-list__info-item',
            )?.textContent,
        ) || null;

    // 2) Spécialité (souvent dans un <a>)
    let specialty =
        clean(
            root.querySelector<HTMLAnchorElement>(
                ':scope > .org-top-card-summary-info-list__info-item a, a.link-without-hover-visited[href*="productCategory"]',
            )?.textContent,
        ) || null;

    if (!specialty) {
        const secondItem = root.querySelectorAll<HTMLDivElement>(
            ':scope > .org-top-card-summary-info-list__info-item',
        )[1];
        specialty = clean(secondItem?.textContent) || null;
    }

    // 3) Localisation (dans le bloc .inline-block)
    const inline = root.querySelector<HTMLDivElement>('.inline-block') ?? root;
    const location =
        clean(
            inline.querySelector<HTMLDivElement>(
                ':scope > .org-top-card-summary-info-list__info-item',
            )?.textContent,
        ) || null;

    // 4) Employés (lien people/currentCompany)
    const employees =
        clean(
            inline.querySelector<HTMLAnchorElement>(
                'a.org-top-card-summary-info-list__info-item-link, a[href*="currentCompany"]',
            )?.textContent ?? '',
        ) || null;

    // (optionnel) Abonnés
    const followers =
        clean(
            [
                ...root.querySelectorAll<HTMLDivElement>(
                    '.org-top-card-summary-info-list__info-item',
                ),
            ].find((el) => /abonn[eé]s?/i.test(el.textContent || ''))
                ?.textContent,
        ) || null;

    console.log({ sector, specialty, location, employees, followers });

    const dom = {
        name: document.getElementById('company-name'),
        website: document.getElementById('company-website'),
        employees: document.getElementById('nb-employees'),
        location: document.getElementById('company-location'),
    };
    const companyName =
        (await waitFor('.org-top-card-summary__title'))?.textContent?.trim() ||
        'Nom de l’entreprise';
    const companyWebsite =
        (
            await waitFor(
                'a.org-top-card-primary-actions__action>a[href^="http"]',
                200,
            )
        )?.textContent?.trim() || '';

    console.log(
        'Company Website:',
        await waitFor(
            '.org-top-card-primary-actions__action>a[href^="http"]',
            200,
        ),
    );
    // ✅ Mettre à jour le nom de l'entreprise dans le DOM
    dom.name && (dom.name.textContent = companyName);
    dom.employees && (dom.employees.textContent = employees || '10+');
    dom.location && (dom.location.textContent = location || 'Paris, France');

    // ✅ Afficher le site web seulement s'il existe
    if (companyWebsite && dom.website) {
        dom.website.textContent = companyWebsite;
        // S'assurer que le champ site web est visible
        const websiteContainer = dom.website.parentElement;
        if (websiteContainer) {
            websiteContainer.style.display = '';
        }
    } else if (dom.website) {
        // Cacher le champ site web s'il n'y a pas de site
        const websiteContainer = dom.website.parentElement;
        if (websiteContainer) {
            websiteContainer.style.display = 'none';
        }
    }

    return {
        name: companyName,
        website: companyWebsite,
        sector,
        specialty,
        location,
        employees,
        followers,
    };
}

export function highlightTagsInElement(el: HTMLElement) {
    const rx = /(?:hashtag#|#)([\p{L}\p{N}_-]+)/gu;

    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const toProcess: Text[] = [];

    // collecte d'abord (pour éviter de modifier pendant l'itération)
    let node: Node | null;
    while ((node = walker.nextNode())) {
        if (rx.test((node as Text).data)) toProcess.push(node as Text);
        rx.lastIndex = 0;
    }

    for (const textNode of toProcess) {
        const frag = document.createDocumentFragment();
        const text = textNode.data;
        let lastIndex = 0;
        rx.lastIndex = 0;

        let m: RegExpExecArray | null;
        while ((m = rx.exec(text))) {
            const [full, word] = m;
            // texte avant le tag
            if (m.index > lastIndex) {
                frag.appendChild(
                    document.createTextNode(text.slice(lastIndex, m.index)),
                );
            }
            // span du tag
            const span = document.createElement('span');
            span.className = 'tag';
            span.textContent = `#${word}`; // <-- on retire "hashtag" et on garde #word
            frag.appendChild(span);

            lastIndex = m.index + full.length;
        }
        // reste du texte
        if (lastIndex < text.length) {
            frag.appendChild(document.createTextNode(text.slice(lastIndex)));
        }
        textNode.replaceWith(frag);
    }
}
