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
            <p> Séniorité : <span id="seniority-level">  </span> + | Location : <span id="profile-location"> Ville, Pays </span> </p>
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

    const { fullName, job, userLocation, experiences, totalExperience } =
        await scrapeLinkedinUserProfile();

    // Mettre à jour les informations dans l'interface maintenant que l'HTML existe
    const seniorityElement = container.querySelector('#seniority-level');
    if (seniorityElement) {
        seniorityElement.textContent = totalExperience;
        console.log('Séniorité mise à jour:', totalExperience);
    } else {
        console.error('Élément #seniority-level non trouvé !');
    }

    // Mettre à jour les autres informations
    const fullNameElement = container.querySelector('#profile-full-name');
    if (fullNameElement) {
        fullNameElement.textContent = fullName;
    }

    const jobElement = container.querySelector('#profile-job');
    if (jobElement) {
        jobElement.textContent = job;
    }

    const locationElement = container.querySelector('#profile-location');
    if (locationElement) {
        locationElement.textContent = userLocation;
    }

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

    // Scraper les expériences professionnelles
    const { experiences, totalExperience } = await scrapeUserExperiences();
    console.log("Durée totale d'expérience:", totalExperience);

    // Ne pas mettre à jour l'interface ici - ce sera fait après l'insertion HTML

    return {
        fullName,
        job,
        userLocation: location,
        experiences,
        totalExperience,
    };
};

// Fonction pour scraper les expériences professionnelles
async function scrapeUserExperiences(): Promise<{
    experiences: Array<{
        position: string;
        company: string;
        duration: string;
        startDate: string;
        endDate: string;
        location: string;
        description: string;
    }>;
    totalExperience: string;
}> {
    const experiences: Array<{
        position: string;
        company: string;
        duration: string;
        startDate: string;
        endDate: string;
        location: string;
        description: string;
    }> = [];

    try {
        console.log('Début du scraping des expériences...');

        // Attendre que la section expérience soit disponible avec waitFor
        const experienceSection = await waitFor<HTMLElement>(
            '.pv-profile-card',
            5000,
        );

        if (!experienceSection) {
            console.log(
                'Aucune section .pv-profile-card trouvée après attente',
            );
            return { experiences, totalExperience: '0 mois' };
        }

        // Trouver la section Expérience par la classe et le texte
        const allSections = Array.from(
            document.querySelectorAll('.pv-profile-card'),
        );

        const targetSection = allSections.find((section) => {
            const heading = section.querySelector('h2, h3');
            const headingText = heading?.textContent?.trim();
            console.log('Texte du heading trouvé:', headingText);
            return headingText && headingText.startsWith('Expérience');
        });

        if (!targetSection) {
            console.log('Section Expérience non trouvée');
            return { experiences, totalExperience: '0 mois' };
        }

        console.log('Section Expérience trouvée:', targetSection);

        // Trouver l'ul dans la section expérience
        const experienceUl = targetSection.querySelector('ul');
        if (!experienceUl) {
            console.log('Aucun ul trouvé dans la section Expérience');
            return { experiences, totalExperience: '0 mois' };
        }

        console.log('UL des expériences trouvé:', experienceUl);

        // Récupérer tous les li de cet ul
        const experienceItems = experienceUl.querySelectorAll('li');

        console.log(
            "Nombre d'items d'expérience trouvés:",
            experienceItems.length,
        );

        experienceItems.forEach((item, index) => {
            try {
                console.log(
                    `\n--- Traitement de l'expérience ${index + 1} ---`,
                );

                // Extraire les informations de chaque expérience
                const positionElement = item.querySelector(
                    'h3, .t-16.t-black.t-bold, .pv-entity__summary-info h3',
                );
                const companyElement = item.querySelector(
                    '.t-14.t-black--light .pv-entity__secondary-title, .t-14.t-black--light, .pv-entity__secondary-title',
                );

                // Cibler spécifiquement le span avec la classe pvs-entity__caption-wrapper
                const captionWrapper = item.querySelector(
                    '.pvs-entity__caption-wrapper',
                );
                let duration = '';
                let startDate = '';
                let endDate = '';

                if (captionWrapper) {
                    const fullText = captionWrapper.textContent?.trim() || '';
                    console.log('Texte complet du caption-wrapper:', fullText);

                    // Récupérer la partie avant le "·" (période)
                    const parts = fullText.split('·');
                    if (parts.length > 0) {
                        const periodText = parts[0].trim(); // "sept. 2023 - aujourd'hui"
                        console.log('Période extraite:', periodText);

                        // Parser la période pour extraire dates de début et fin
                        const { start, end } = parsePeriod(periodText);
                        startDate = start;
                        endDate = end;
                        console.log('Dates parsées:', { startDate, endDate });
                    }

                    // Récupérer la partie après le "·" (durée)
                    if (parts.length > 1) {
                        duration = parts[1].trim(); // "2&nbsp;ans 2 mois"
                        console.log('Durée extraite:', duration);
                    }
                } else {
                    console.log(
                        'Caption-wrapper non trouvé pour cette expérience',
                    );
                }

                const locationElement = item.querySelector(
                    '.t-12.t-black--light.pb1 .pv-entity__location span:last-child, .pv-entity__location span:last-child',
                );
                const descriptionElement = item.querySelector(
                    '.pv-entity__description, .pvs-list__outer-container .t-14',
                );

                const position = positionElement?.textContent?.trim() || '';
                const company = companyElement?.textContent?.trim() || '';
                // On utilise la variable duration déjà extraite du caption-wrapper
                const location = locationElement?.textContent?.trim() || '';
                const description =
                    descriptionElement?.textContent?.trim() || '';

                console.log('Données extraites:', {
                    position,
                    company,
                    duration,
                    startDate,
                    endDate,
                    location,
                    description,
                });

                if (position || company) {
                    experiences.push({
                        position,
                        company,
                        duration,
                        startDate,
                        endDate,
                        location,
                        description,
                    });
                    console.log(`Expérience ${index + 1} ajoutée:`, {
                        position,
                        company,
                        duration,
                        location,
                    });
                }
            } catch (error) {
                console.error(
                    `Erreur lors du parsing de l'expérience ${index + 1}:`,
                    error,
                );
            }
        });
    } catch (error) {
        console.error('Erreur lors du scraping des expériences:', error);
    }

    // Calculer la durée totale d'expérience
    console.log(`Nombre d'expériences trouvées: ${experiences.length}`);
    experiences.forEach((exp, i) => {
        console.log(
            `Exp ${i + 1}: Position: "${exp.position}", Durée: "${
                exp.duration
            }"`,
        );
    });

    const totalExperience = calculateTotalExperience(experiences);
    console.log("Durée totale d'expérience calculée:", totalExperience);

    return { experiences, totalExperience };
}

// Fonction pour parser une période comme "sept. 2023 - aujourd'hui"
function parsePeriod(periodText: string): { start: string; end: string } {
    const cleaned = periodText.replace(/&nbsp;/g, ' ').trim();
    const parts = cleaned.split(' - ');

    if (parts.length >= 2) {
        return {
            start: parts[0].trim(),
            end: parts[1].trim(),
        };
    }

    // Si pas de séparateur, considérer comme une seule date
    return {
        start: cleaned,
        end: cleaned,
    };
}

// Fonction pour convertir une date LinkedIn en objet Date
function parseLinkedInDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    const today = new Date();

    // Cas spéciaux
    if (
        dateStr.toLowerCase().includes("aujourd'hui") ||
        dateStr.toLowerCase().includes('présent')
    ) {
        return today;
    }

    // Mapping des mois français
    const monthMap: { [key: string]: number } = {
        janv: 0,
        janvier: 0,
        févr: 1,
        février: 1,
        mars: 2,
        avr: 3,
        avril: 3,
        mai: 4,
        juin: 5,
        juil: 6,
        juillet: 6,
        août: 7,
        sept: 8,
        septembre: 8,
        oct: 9,
        octobre: 9,
        nov: 10,
        novembre: 10,
        déc: 11,
        décembre: 11,
    };

    // Regex pour capturer mois et année
    const match = dateStr.match(/(\w+)\.?\s*(\d{4})/);
    if (match) {
        const monthStr = match[1].toLowerCase();
        const year = parseInt(match[2]);
        const month = monthMap[monthStr];

        if (month !== undefined) {
            return new Date(year, month, 1);
        }
    }

    return null;
}

// Fonction pour calculer la durée réelle sans chevauchement
function calculateNonOverlappingExperience(
    experiences: Array<{ startDate: string; endDate: string }>,
): number {
    const periods: Array<{ start: Date; end: Date }> = [];

    // Convertir toutes les dates
    for (const exp of experiences) {
        const start = parseLinkedInDate(exp.startDate);
        const end = parseLinkedInDate(exp.endDate);

        if (start && end) {
            periods.push({ start, end });
        }
    }

    if (periods.length === 0) return 0;

    // Trier par date de début
    periods.sort((a, b) => a.start.getTime() - b.start.getTime());

    // Fusionner les périodes qui se chevauchent
    const merged: Array<{ start: Date; end: Date }> = [periods[0]];

    for (let i = 1; i < periods.length; i++) {
        const current = periods[i];
        const lastMerged = merged[merged.length - 1];

        // Si la période actuelle commence avant la fin de la dernière fusionnée
        if (current.start <= lastMerged.end) {
            // Fusionner en prenant la fin la plus tardive
            lastMerged.end = new Date(
                Math.max(lastMerged.end.getTime(), current.end.getTime()),
            );
        } else {
            // Pas de chevauchement, ajouter la nouvelle période
            merged.push(current);
        }
    }

    // Calculer la durée totale en mois
    let totalMonths = 0;
    for (const period of merged) {
        const diffTime = period.end.getTime() - period.start.getTime();
        const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30.44); // Moyenne de jours par mois
        totalMonths += Math.round(diffMonths);
    }

    console.log('Périodes fusionnées:', merged);
    console.log('Durée totale sans chevauchement:', totalMonths, 'mois');

    return totalMonths;
}

// Fonction pour parser une durée et la convertir en mois
function parseDurationToMonths(durationText: string): number {
    let totalMonths = 0;

    // Nettoyer le texte (enlever &nbsp; et espaces multiples)
    const cleanText = durationText
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    console.log('Durée nettoyée:', cleanText);

    // Regex pour extraire les années et mois
    const yearMatch = cleanText.match(/(\d+)\s*ans?/i);
    const monthMatch = cleanText.match(/(\d+)\s*mois/i);

    if (yearMatch) {
        const years = parseInt(yearMatch[1]);
        totalMonths += years * 12;
        console.log(`${years} année(s) = ${years * 12} mois`);
    }

    if (monthMatch) {
        const months = parseInt(monthMatch[1]);
        totalMonths += months;
        console.log(`${months} mois supplémentaire(s)`);
    }

    console.log(`Total pour "${cleanText}": ${totalMonths} mois`);
    return totalMonths;
}

// Fonction pour convertir les mois en format "X ans Y mois"
function formatDuration(totalMonths: number): string {
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    if (years === 0) {
        return `${months} mois`;
    } else if (months === 0) {
        return `${years} an${years > 1 ? 's' : ''}`;
    } else {
        return `${years} an${years > 1 ? 's' : ''} et ${months} mois`;
    }
}

// Fonction pour calculer la durée totale d'expérience
function calculateTotalExperience(
    experiences: Array<{
        duration: string;
        startDate: string;
        endDate: string;
    }>,
): string {
    console.log("\n--- Calcul de la durée totale d'expérience ---");

    // Méthode 1: Calculer sans chevauchement en utilisant les dates
    console.log('=== Méthode 1: Calcul sans chevauchement ===');
    const nonOverlappingMonths = calculateNonOverlappingExperience(experiences);
    const smartDuration = formatDuration(nonOverlappingMonths);

    // Méthode 2: Simple addition des durées (pour comparaison)
    console.log('\n=== Méthode 2: Simple addition ===');
    let totalMonths = 0;
    experiences.forEach((exp, index) => {
        if (exp.duration) {
            console.log(`Expérience ${index + 1}: "${exp.duration}"`);
            const months = parseDurationToMonths(exp.duration);
            totalMonths += months;
        }
    });

    const simpleDuration = formatDuration(totalMonths);

    console.log(`\n--- Résultats ---`);
    console.log(`Simple addition: ${simpleDuration} (${totalMonths} mois)`);
    console.log(
        `Sans chevauchement: ${smartDuration} (${nonOverlappingMonths} mois)`,
    );

    // Retourner la durée calculée sans chevauchement
    return smartDuration;
}

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
