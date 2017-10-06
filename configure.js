async function saveOptions(e) {
    e.preventDefault();
    let url = document.querySelector("#yoctohub_url").value;
    let bgpage = chrome.extension.getBackgroundPage();
    await bgpage.update_hub_url(url);
}

async function restoreOptions() {
    let bgpage = chrome.extension.getBackgroundPage();
    document.querySelector("#yoctohub_url").value = await bgpage.get_hub_url();
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);