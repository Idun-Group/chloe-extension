const OptionButton = document.getElementById('options-button');
const LoginButton = document.getElementById('login-button');

LoginButton?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'login' }, (response) => {
        console.log(response);
    });
});

OptionButton?.addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    }
});
