var ytemperature = null;
var yhumidity = null;
var ypressure = null;
let current_url = null;
let timer = null;
let serial;

// internal async function to wait for a very short period
async function save(value) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set(value, resolve);
    });
}


// internal async function to wait for a very short period
async function load(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key, resolve);
    });
}


async function get_hub_url() {
    console.log("get_hub_url");
    let storage = await load("yoctohub_url");
    url = storage.yoctohub_url;
    console.log(storage);
    if (!url) {
        url = "127.0.0.1";
    }
    console.log("url=" + url);
    return url;
}


async function update_hub_url(url) {
    console.log("update_hub_url");
    if (current_url !== url) {
        clearTimeout(timer);
        current_url = url;
        await save({
            yoctohub_url: url
        });
        startDemo();
    }
}


async function startDemo() {
    await YAPI.LogUnhandledPromiseRejections();
    let url = await get_hub_url();
    console.log(url);
    // Setup the API to use the VirtualHub on local machine
    let errmsg = new YErrorMsg();
    if (await YAPI.RegisterHub(url, errmsg) !== YAPI.SUCCESS) {
        console.log('Cannot contact ' + url + ': ' + errmsg.msg);
        return;
    }
    current_url = url;
    refresh();
}

async function refresh() {
    try {
        let errmsg = new YErrorMsg();
        await YAPI.UpdateDeviceList(errmsg);
        if (yhumidity === null) {
            console.log("search humidity");
            // by default use any connected module suitable for the demo
            yhumidity = YHumidity.FirstHumidity();
            if (yhumidity) {
                let module = await yhumidity.module();
                serial = await module.get_serialNumber();
                console.log("found " + serial);
                ytemperature = YTemperature.FindTemperature(serial + ".temperature");
                ypressure = YPressure.FindPressure(serial + ".pressure");
            }
        }
        let text = "";
        if (ytemperature && await ytemperature.isOnline()) {
            let temp = await ytemperature.get_currentValue();
            text = temp.toString();
        }
        chrome.browserAction.setBadgeText({text: text});
    } catch (e) {
        console.log(e);
        chrome.browserAction.setBadgeText({text: "!"});
    }
    timer = setTimeout(refresh, 1000);
}

try {
    startDemo();
} catch (e) {
    console.log(e);
}
