// Saves options to chrome.storage
function save_options(key) {
    console.log(key)
    var value = document.getElementById(key).checked;
    chrome.storage.sync.set({
        key: value
    }, function () {
        // Update status to let user know options were saved.
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    chrome.storage.sync.get({
        enableDrawIo,
        enableProcessOn,
        enableCustom
    }, function (items) {
        document.getElementById('enableDrawIo').checked = items.enableDrawIo;
        document.getElementById('enableProcessOn').checked = items.enableProcessOn;
        document.getElementById('enableCustom').checked = items.enableCustom;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('enableDrawIo').click(save_options('enableDrawIo'));
document.getElementById('enableProcessOn').click(save_options('enableProcessOn'));
document.getElementById('enableCustom').click(save_options('enableCustom'));