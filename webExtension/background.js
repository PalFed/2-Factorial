"use strict";

var secrets = null;
var mycrypto = window.crypto || window.msCrypto;

function loadSecrets() {
    const gettingStoredSettings = browser.storage.local.get(null);
    gettingStoredSettings.then(function(items) {
        if (items.twoFactorial !== undefined) secrets=items.twoFactorial;
        else secrets={};
    });
}

function add2FactorialHeader(e) {
    // What page are we accessing and do we have a secret for it?
    var host = "";

    for (var rHeader of e.requestHeaders) {
        if (rHeader.name.toLowerCase() === "host") {
            host=rHeader.value;
        }
    }

    if (host === "")
    {
        // TODO No host header, look at the request URL
    }

    if (secrets[host] !== undefined) {

        var salt = getRandomString();
        var header = {};
        header.name="Two-Factorial";
        header.value=hash(salt, secrets[host]);
        e.requestHeaders.push(header);

        header = {};
        header.name="Two-Factorial-Salt";
        header.value=salt;
        e.requestHeaders.push(header);

    }

    return {requestHeaders: e.requestHeaders};
}

loadSecrets();

// dec2hex :: Integer -> String
function dec2hex (dec) {
    return ('0' + dec.toString(16)).substr(-2)
}

// generateId :: Integer -> String
function getRandomString (len) {
    var arr = new Uint8Array((len || 40) / 2);
    mycrypto.getRandomValues(arr);
    return Array.from(arr, dec2hex).join('');
}

function receiveMessage(message,sender,sendResponse){
    loadSecrets();
}

function hash(t, s)
{
    return forge_sha256(t+s);
}

browser.webRequest.onBeforeSendHeaders.addListener(add2FactorialHeader,
    {urls: ["<all_urls>"]},
    ["blocking", "requestHeaders"]);

browser.runtime.onMessage.addListener(receiveMessage);
