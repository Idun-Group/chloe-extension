import { getToken, signinWithLinkedin } from './background/auth';
import {
    handleNav,
    lastByTab,
    readyTabs,
    resetReadiness,
} from './background/current-pages';
import getUserProfile from './background/user';
import { createAIContext } from './background/ai-context';

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
    })();
    return true;
});
