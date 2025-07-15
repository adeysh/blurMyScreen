const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const logo = document.getElementById("logoIcon");


function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    themeToggle.textContent = theme === "dark"
        ? "🌞 Toggle Light Mode"
        : "🌙 Toggle Dark Mode";

    logo.src = theme === "dark"
        ? "/assets/icons/blur-light.png"
        : "/assets/icons/blur.png";
}

const savedTheme = localStorage.getItem("theme") || "dark";
applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
    const newTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(newTheme);
});

document.getElementById("openPopup").addEventListener("click", () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
});

