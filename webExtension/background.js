"use strict";

var secrets = null;

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

        var header = {};
        header.name="Two-Factorial";
        header.value=generateTOTP(secretToBase32(secrets[host]));
        e.requestHeaders.push(header);
    }

    return {requestHeaders: e.requestHeaders};
}

function secretToBase32(secret)
{
    var out=base32.encode(secret);
    var splitpoint=out.indexOf("=");
    if (splitpoint>=0)
    {
        return out.substr(0, splitpoint);
    }
    return secret;
}

loadSecrets();

function receiveMessage(message,sender,sendResponse){
    loadSecrets();
}

browser.webRequest.onBeforeSendHeaders.addListener(add2FactorialHeader,
    {urls: ["<all_urls>"]},
    ["blocking", "requestHeaders"]);

browser.runtime.onMessage.addListener(receiveMessage);