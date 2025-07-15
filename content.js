const overlay = document.createElement("div");
overlay.className = "blur-screen";
overlay.innerHTML = `<p class="blur-message">🔒 Screen Blurred — Press Ctrl + B to Unblur</p>`;
document.documentElement.appendChild(overlay);


const passcodeModal = document.createElement("div");
passcodeModal.className = "passcode-modal";
passcodeModal.innerHTML = `
    <div class="passcode-box">
        <p>🔐 Enter Passcode</p>
        <input type="password" id="passcodeInput" placeholder="••••" />
        <button id="submitPasscode">Unlock</button>
        <p class="error" id="passcodeError"></p>
    </div>
    `;
document.documentElement.appendChild(passcodeModal);

function getBaseDomain(url) {
    try {
        const h = new URL(url).hostname;
        return h.replace(/^www\./, "");   // www.linkedin.com → linkedin.com
    } catch { return null; }
}


let isBlurred = false;

chrome.storage.local.get("isBlurred").then(({ isBlurred: stored }) => {
    if (stored) blurScreen();
});

function addBodyClass(cls) {
    if (document.body) {
        document.body.classList.add(cls);
    } else {
        document.addEventListener("DOMContentLoaded", () =>
            document.body.classList.add(cls),
            { once: true }
        );
    }
}

function removeBodyClass(cls) {
    if (document.body) {
        document.body.classList.remove(cls);
    } // no else needed; if body isn't there yet it can't be blurred
}

async function blurScreen() {
    isBlurred = true;
    overlay.classList.add("visible");
    document.documentElement.classList.add("blurred");
    addBodyClass("blurred");
    await chrome.storage.local.set({ isBlurred: true });
}

async function unblurScreen() {
    isBlurred = false;
    overlay.classList.remove("visible");
    document.documentElement.classList.remove("blurred");
    removeBodyClass("blurred");
    await chrome.storage.local.set({ isBlurred: false, awaitingUnlock: false });
    hidePasscodeModal();
}

function showPasscodeModal() {
    document.getElementById("passcodeInput").value = "";
    document.getElementById("passcodeError").textContent = "";
    passcodeModal.classList.add("visible");
    document.getElementById("passcodeInput").focus();
}

function hidePasscodeModal() {
    passcodeModal.classList.remove("visible");
}



chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.unlock === true) {
        console.log("✅ Content script received unlock");
        unblurScreen();
        sendResponse({ success: true });
    }
    return true;
});

// Validate passcode
document.getElementById("submitPasscode").addEventListener("click", async () => {
    const entered = document.getElementById("passcodeInput").value.trim();
    const { blurPasscode } = await chrome.storage.sync.get("blurPasscode");

    if (entered === blurPasscode) {
        unblurScreen();
    } else {
        passcodeError.textContent = "❌ Incorrect passcode.";
        passcodeError.classList.add("visible");
    }
});




document.addEventListener("keydown", async (e) => {
    if (e.key.toLowerCase() === "b" && e.ctrlKey) {
        e.preventDefault();

        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) {
            return; // Ignore when typing
        }

        const { blurPasscode } = await chrome.storage.sync.get("blurPasscode");

        if (!blurPasscode) {
            if (confirm("⚠️ Please set a passcode first using the extension popup.")) {
                chrome.runtime.sendMessage({ openPopup: true });
            }
            return;
        }

        if (isBlurred) {
            chrome.storage.local.set({ awaitingUnlock: true });
            showPasscodeModal();
        } else {
            blurScreen();
        }
    }
});






