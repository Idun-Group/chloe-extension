export const readyTabs = new Set<number>();
export const lastByTab = new Map<number, string>();

export function resetReadiness(tabId: number) {
    readyTabs.delete(tabId);
    // console.log('Tab marked as not ready:', tabId);
}

export function handleNav(
    details: chrome.webNavigation.WebNavigationTransitionCallbackDetails,
) {
    if (details.frameId !== 0) return;

    let u: URL;
    try {
        u = new URL(details.url);
    } catch {
        return;
    }
    if (!u.hostname.endsWith('linkedin.com')) return;
    if (u.pathname.startsWith('/tscp-serving')) return;

    // Dédup par tab
    if (lastByTab.get(details.tabId) === details.url) return;
    lastByTab.set(details.tabId, details.url);

    // Attendre que le content ait signalé sa disponibilité
    if (!readyTabs.has(details.tabId)) {
        // Pas prêt → on attendra le prochain CONTENT_READY
        return;
    }

    chrome.tabs
        .sendMessage(details.tabId, {
            action: 'LI_URL_CHANGED',
            url: details.url,
        })
        .then(() => {
            // Si ça passe, on marque ready (utile pour premiers tours)
            readyTabs.add(details.tabId);
        })
        .catch(() => {
            // content non prêt / retiré -> marquer non prêt
            readyTabs.delete(details.tabId);
        });
}
