import { signinWithLinkedin } from './background/auth';
import {
    handleNav,
    lastByTab,
    readyTabs,
    resetReadiness,
} from './background/current-pages';

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

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === 'login') {
        const loginResponse = await signinWithLinkedin();
        sendResponse({ token: loginResponse });
        return true;
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
        return true;
    }
});
