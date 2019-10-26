var gDownloadUrls = new Map();
var gDownloadFileName = new Map();
var UPLOADWEBURL = "https://sm.ms/api/upload";

// Filter downloadItem by url
function FilterUrls(url) {
    var mReg = new RegExp(".*draw\.io.*", "g");
    //var mReg = new RegExp(".*file.*", "g");

    if (url.search(mReg) != -1)
        return true;

    return false;
}

function CleanLocalFile(id) {
    // Delete item
    chrome.downloads.removeFile(id);
    // TODO(chenxun): erase item

    // clean
    gDownloadUrls.delete(id);
    gDownloadUrls.delete(id);
    console.log("Item " + id + " Deleted!");
}

function Write2Clipboard(text) {
    var copyFrom = document.createElement("textarea");
    copyFrom.textContent = text;
    document.body.appendChild(copyFrom);
    copyFrom.focus();
    document.execCommand('SelectAll');
    document.execCommand('Copy');
    document.body.removeChild(copyFrom);
}

// Upload to sm.me
function Upload2SMMS(blob, id) {
    var fromData = new FormData();
    fromData.append("smfile", blob);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", UPLOADWEBURL, true);
    xhr.overrideMimeType("multipart/form-data");
    xhr.addEventListener("load", function () {
        console.log("Upload2SMMS success!");
        CleanLocalFile(id);
        var result = JSON.parse(xhr.responseText);
        console.log(result);
        var imgUrl = result["data"]["url"];
        Write2Clipboard(imgUrl);
        alert("PicUploadTool[Success]: Image Url\n" + imgUrl);
    });
    xhr.addEventListener("error", function () {
        console.log("Upload2SMMS failed!");
        CleanLocalFile(id);
        alert("PicUploadTool[Error]: Upload to sm.ms failed!");
    });
    xhr.send(fromData);
}

function GetLocalFileAndUpload(path, id) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET","file://" + path, true);
    console.log("file://" + path);
    xhr.responseType = "blob";
    xhr.addEventListener("load", function () {
        console.log("GetLocalFile success!");
        Upload2SMMS(xhr.response, id);
    });
    xhr.addEventListener("error", function () {
        console.log("GetLocalFile failed!");
        console.log(xhr);
        CleanLocalFile(id);
        alert("PicUploadTool[Error]: Get local downloaded file failed!");
    });
    xhr.send();
}

chrome.downloads.onCreated.addListener(function (item) {
    // Cache teh item's url
    gDownloadUrls.set(item.id, item.url);
});


chrome.downloads.onChanged.addListener(function (delta) {

    if (delta.filename != null) {
        console.log("Item " + delta.id + " name " + delta.filename.current);
        gDownloadFileName.set(delta.id, delta.filename.current);
    }

    if (delta.state != null && delta.state.current == "complete") {
        console.log("Item " + delta.id + " " + delta.state.current);
        var url = gDownloadUrls.get(delta.id);

        if (url != undefined && FilterUrls(url)) {
            // Upload to sm.ms
            GetLocalFileAndUpload(gDownloadFileName.get(delta.id), delta.id);
        }
    }
});
