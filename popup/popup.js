async function updateSensor(sensor, tag) {
    if (sensor && sensor.isOnline()) {
        let value = await sensor.get_currentValue();
        document.getElementById(tag).innerHTML = value.toString() + " " + await sensor.get_unit();
    } else {
        document.getElementById(tag).innerHTML = "Offline";
    }
}

async function refresh() {
    let bgpage = chrome.extension.getBackgroundPage();
    await updateSensor(bgpage.ytemperature, "temp");
    await updateSensor(bgpage.yhumidity, "hum");
    await updateSensor(bgpage.ypressure, "pres");
    timer = setTimeout(refresh, 500);
}

document.addEventListener('DOMContentLoaded', async () => {
    await refresh();
});

