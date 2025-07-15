const currentPassInput = document.getElementById("currentPasscode");
const newPassInput = document.getElementById("passcode");
const confirmPassInput = document.getElementById("confirmPasscode");
const saveBtn = document.getElementById("savePasscode");
const changeBtn = document.getElementById("changePasscodeBtn");
const status = document.getElementById("status");
const title = document.getElementById("formTitle");
const formSection = document.getElementById("formSection");
const changeSection = document.getElementById("changeSection");
const modeRadios = document.getElementsByName("passcodeMode");

const unlockSection = document.getElementById("unlockSection");
const unlockPassInput = document.getElementById("unlockPassInput");
const unlockBtn = document.getElementById("unlockBtn");

let domain = "";
let passcodes = {};
let mode = "global";

function getBaseDomain(url) {
    try {
        const h = new URL(url).hostname;
        return h.replace(/^www\./, "");   // www.linkedin.com → linkedin.com
    } catch { return null; }
}


async function getDomain() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return new URL(tab.url).hostname;
}

async function init() {
    const { blurPasscode } = await chrome.storage.sync.get("blurPasscode");

    if (blurPasscode) {
        title.textContent = "Change Passcode";
        changeBtn.style.display = "block";
        formSection.style.display = "none";
    } else {
        title.textContent = "Set Passcode";
        changeBtn.style.display = "none";
        formSection.style.display = "block";
        currentPassInput.style.display = "none";
    }
}


function getSelectedMode() {
    return Array.from(modeRadios).find(r => r.checked).value;
}

changeBtn.addEventListener("click", () => {
    formSection.style.display = "block";
    currentPassInput.style.display = "block";
    changeBtn.style.display = "none";
});

saveBtn.addEventListener("click", async () => {
    const current = currentPassInput.value.trim();
    const newPass = newPassInput.value.trim();
    const confirm = confirmPassInput.value.trim();

    if (!newPass || !confirm) {
        return (status.textContent = "⚠️ Please fill all fields.");
    }

    if (newPass !== confirm) {
        return (status.textContent = "❌ New passcodes do not match.");
    }

    const { blurPasscode } = await chrome.storage.sync.get("blurPasscode");

    if (blurPasscode && current !== blurPasscode) {
        return (status.textContent = "❌ Current passcode is incorrect.");
    }

    await chrome.storage.sync.set({ blurPasscode: newPass });

    status.textContent = "✅ Passcode saved.";
    currentPassInput.value = "";
    newPassInput.value = "";
    confirmPassInput.value = "";
    init();
});


async function checkUnlockNeeded() {
    const { awaitingUnlock, blurPasscode } = await chrome.storage.local.get(["awaitingUnlock"]);
    if (awaitingUnlock) {
        formSection.style.display = "none";
        changeSection.style.display = "none";
        unlockSection.style.display = "block";
    } else {
        unlockSection.style.display = "none";            // hide if not needed
    }
}
unlockBtn.addEventListener("click", async () => {
    const entered = unlockPassInput.value.trim();
    const { useGlobalPasscode, blurPasscode, passcodes = {} }
        = await chrome.storage.sync.get(["useGlobalPasscode", "blurPasscode", "passcodes"]);
    const expected = useGlobalPasscode ? blurPasscode
        : passcodes[domain];

    if (entered === expected) {
        await chrome.storage.local.set({ awaitingUnlock: false });

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs.length) return console.warn("No active tab?");
            chrome.tabs.sendMessage(tabs[0].id, { unlock: true }, (res) => {
                if (chrome.runtime.lastError) {
                    console.error("❌", chrome.runtime.lastError.message);
                } else {
                    console.log("✅ Unlock message delivered");
                }
            });
        });

        status.textContent = "✅ Screen unblurred.";
        unlockSection.style.display = "none";
        checkUnlockNeeded();
    } else {
        status.textContent = "❌ Incorrect passcode.";
    }
});


init();
checkUnlockNeeded();