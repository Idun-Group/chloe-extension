const LoginButton = document.getElementById('login-button');
const LogoutButton = document.getElementById('logout-button');

chrome.runtime.sendMessage({ action: 'CHECK_AUTH' }, (response) => {
    if (response.isAuthenticated) {
        LogoutButton!.style.display = 'block';
    } else {
        LogoutButton!.style.display = 'none';
    }
});

LoginButton?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'LOGIN' }, (response) => {
        console.log('ouvre linkedin');
        chrome.tabs.create({ url: 'https://linkedin.com/feed' });
    });
});

LogoutButton?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'LOGOUT' }, (response) => {
        console.log('Logged out');
        LogoutButton!.style.display = 'none';
    });
});
