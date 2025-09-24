import { getToken, signinWithLinkedin } from './background/auth';
import {
    handleNav,
    lastByTab,
    readyTabs,
    resetReadiness,
} from './background/current-pages';
import getUserProfile from './background/user';
import {
    createAIContext,
    deleteAIContext,
    getAIContextById,
    updateAIContext,
} from './background/ai-context';
import {
    createOrganizationProfile,
    createPeopleProfile,
    createProfileList,
    deleteProfileList,
    downloadProfileList,
    fetchProfileLists,
    getProfileListById,
    getProfileListsByType,
    updateProfileList,
} from './background/profil-list';

chrome.webNavigation.onHistoryStateUpdated.addListener(
    (d) => {
        handleNav(d);
    },
    { url: [{ hostSuffix: 'linkedin.com', schemes: ['https', 'http'] }] },
);

chrome.tabs.onRemoved.addListener((tabId) => {
    readyTabs.delete(tabId);
    lastByTab.delete(tabId);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    (async () => {
        console.log(request.action);
        if (request.action === 'login') {
            const loginResponse = await signinWithLinkedin();
            sendResponse({ token: loginResponse });
        }

        if (request.action === 'GET_TOKEN') {
            try {
                const token = await getToken();
                console.log('GET_TOKEN token :', token);
                sendResponse({
                    status: token ? 'connected' : 'disconnected',
                    token,
                });
            } catch (error) {
                console.error('Error getting token:', error);
                sendResponse({ status: 'error', error });
            }
        }

        if (request.action === 'CONTENT_READY') {
            if (sender.tab?.id != null) {
                readyTabs.add(sender.tab.id);

                // Optionnel : notifier immédiatement l’URL courante si on la connaît
                chrome.tabs.get(sender.tab.id, (tab) => {
                    if (tab?.url) {
                        // Déclenche une passe handleNav pour cet onglet
                        handleNav({
                            tabId: sender.tab!.id!,
                            url: tab.url,
                            frameId: 0,
                            timeStamp: Date.now(),
                            transitionQualifiers: [],
                            processId: -1, // champs non utilisés ici
                        } as unknown as chrome.webNavigation.WebNavigationTransitionCallbackDetails);
                    }
                });
            }
            sendResponse({ ok: true });
        }

        if (request.action === 'GET_PROFILE') {
            const profile = await getUserProfile();
            sendResponse({ profile });
        }

        if (request.action === 'CREATE_AICONTEXT') {
            const { title, content, default: isDefault } = request.data;
            const result = createAIContext(title, content, isDefault);
            sendResponse(result);
        }

        if (request.action === 'GET_AICONTEXT_BY_ID') {
            const { id } = request.data;
            // Appelle ta fonction pour récupérer le contexte par ID
            const context = await getAIContextById(id);
            sendResponse(context);
        }

        if (request.action === 'EDIT_AICONTEXT') {
            const { id, title, content, default: isDefault } = request.data;
            const result = await updateAIContext(id, title, content, isDefault);
            sendResponse(result);
        }

        if (request.action === 'DELETE_AICONTEXT') {
            const { id } = request.data;
            const result = await deleteAIContext(id);
            sendResponse(result);
        }

        if (request.action === 'CREATE_PROFILE_LIST') {
            const { type, name, description } = request.data;
            const result = await createProfileList(type, name, description);
            sendResponse(result);
        }

        if (request.action === 'GET_PROFILE_LISTS') {
            const result = await fetchProfileLists();
            sendResponse(result);
        }

        if (request.action === 'GET_PROFILELIST_BY_ID') {
            const { id } = request.data;
            const result = await getProfileListById(id);
            sendResponse(result);
        }

        if (request.action === 'GET_PROFILELISTS_BY_TYPE') {
            const { type } = request;
            const result = await getProfileListsByType(type);
            sendResponse(result);
        }

        if (request.action === 'EDIT_PROFILE_LIST') {
            const { id, name, description, type } = request.data;
            const result = await updateProfileList(id, name, description, type);
            sendResponse(result);
        }

        if (request.action === 'DELETE_PROFILE_LIST') {
            const { id } = request.data;
            const result = await deleteProfileList(id);
            sendResponse(result);
        }

        if (request.action === 'ADD_TO_LIST') {
            const { type, listId, data } = request;

            const result =
                type === 'PEOPLE'
                    ? await createPeopleProfile(listId, data.people)
                    : await createOrganizationProfile(
                          listId,
                          data.organization,
                      );
            sendResponse(result);
        }

        if (request.action === 'DOWNLOAD_PROFILE_LIST') {
            const { id } = request.data;

            try {
                await downloadProfileList(id);
                sendResponse({ success: true, message: 'Download started' });
            } catch (error) {
                console.error('Download failed:', error);
                sendResponse({
                    success: false,
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Unknown error',
                });
            }
        }
    })();
    return true;
});
