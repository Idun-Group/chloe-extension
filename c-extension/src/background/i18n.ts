function detectLanguage(): string {
    const lang = chrome.i18n.getUILanguage();

    return lang;
}
