chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === "install") {
        await chrome.storage.sync.set({ blurPasscode: "" });

        chrome.tabs.create({
            url: chrome.runtime.getURL("/welcome/welcome.html")
        });
    }
});


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.openPopup) {
        chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
    }
});
