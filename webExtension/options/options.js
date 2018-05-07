const addEdit = document.querySelector("#addEdit");
const urlInput = document.querySelector("#url");
const secretInput = document.querySelector("#secret");
const existing = document.querySelector("#existingSecrets");
const exportSecrets = document.querySelector("#exportSecrets");
const importInput = document.querySelector("#importInput");
const importForm = document.querySelector("#importForm");
const removeAll = document.querySelector("#removeAll");
const generate = document.querySelector("#generate");
var mycrypto = window.crypto || window.msCrypto;

/*
Store the currently selected settings using browser.storage.local.
*/
function storeSettings(restoredSettings) {

    if (browser !== undefined)
    {
        if (urlInput.value=="") alert("You didn't enter a domain");
        else if (secretInput.value=="") alert("You didn't enter a secret");
        else
        {
            // If this is the first time, create a blank array for our settings
            if (restoredSettings["twoFactorial"] === undefined)
            {
                restoredSettings["twoFactorial"]=[];
            }
            
            // Add/Modify the secret
            var url=urlInput.value;
            if (url.substr(0,7)=="http://") url=url.substr(7);
            else if (url.substr(0,8)=="https://") url=url.substr(8);
            restoredSettings["twoFactorial"][url]=secretInput.value;

            // Save
            browser.storage.local.set(restoredSettings);
            
            // Update background script
            browser.runtime.sendMessage("update");
            
            // Clear the form
            urlInput.value="";
            secretInput.value="";
        }

    }
    updateOptionsPage();
}

/*
Update the options UI with the settings values retrieved from storage,
or the default settings if the stored settings are empty.
*/
function updateUI(restoredSettings) {
    // Go through each URL and add it to the list

    var count=0;
    var csv="";

    existing.innerHTML="";
    for (var url in restoredSettings.twoFactorial)
    {
        addItem(url, 1, count);
        csv+='"'+url+'","'+restoredSettings.twoFactorial[url]+'"'+"\n";
        count++;
    }

    if (count==0) addItem('You have no saved secrets');
    else
    {
        setExport(csv);
    }
}

function setExport(csv) {
    var data, filename, link;

    if (csv == null) return;

    filename = '2FactorialExport.csv';

    if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    data = encodeURI(csv);

    exportSecrets.setAttribute('href', data);
    exportSecrets.setAttribute('download', filename);

}

function addItem(itemurl, secret, count)
{
    var html = itemurl;
    var span = document.createElement("span");
    span.innerHTML = html;
    span.className = "url";
    var div = document.createElement("div");
    div.appendChild(span);
    if ((count+1)%2 == 0)
    {
        div.className = "itemWrapper odd";
    }
    else div.className = "itemWrapper";

    if (secret !== undefined)
    {
        var edit=document.createElement("a");
        edit.className="edit";
        edit.innerHTML="Edit";
        edit.setAttribute('data-url',itemurl);

        var remove=document.createElement("a");
        remove.className="remove";
        remove.innerHTML="Remove";
        remove.setAttribute('data-url',itemurl);

        div.appendChild(edit);
        div.appendChild(remove);
    }

    existing.appendChild(div);

}

function onError(e) {
    console.error(e);
}

function updateOptionsPage()
{
    if (browser !== undefined)
    {
        const gettingStoredSettings = browser.storage.local.get();
        gettingStoredSettings.then(updateUI, onError);
    }
}


/*
On opening the options page, fetch stored settings and update the UI with them.
*/

updateOptionsPage();

document.addEventListener('click',function(e){
    if(e.target && e.target.id== 'addEdit'){
        // Save
        var gettingStoredSettings = browser.storage.local.get();
        gettingStoredSettings.then(storeSettings, onError);
    }
    else if(e.target && e.target.id=='importSecrets'){
        // Show the import form
        if (importForm.style.display=="block")
        {
            importForm.style.display='none';
        }
        else importForm.style.display='block';
    }
    else if(e.target && e.target.id=='removeAll'){
        // Remove all secrets
        if (confirm("Are you sure you want to remove all secrets? This cannot be undone.")) {
            var gettingStoredSettings = browser.storage.local.get();
            gettingStoredSettings.then(function(secrets) {
                secrets["twoFactorial"]=[];
                browser.storage.local.set(secrets);
                browser.runtime.sendMessage("update");
                updateOptionsPage();
            }, onError);
        }
    }
    else if(e.target && e.target.id=='generate'){
        secretInput.value=getRandomString();
    }
    else if(e.target && e.target.id=='clear'){
        // Clear the values
        urlInput.value="";
        secretInput.value="";
    }
    else if(e.target && e.target.classList.contains('edit')){
        // Put the URL in the urlInput
        var myurl=e.target.getAttribute("data-url");
        var gettingStoredSettings = browser.storage.local.get();
        gettingStoredSettings.then(function(secrets) {
            var mydetails=secrets["twoFactorial"][myurl];
            urlInput.value=myurl;
            location.hash = "#editsecret";

        });
    }
    else if(e.target && e.target.classList.contains('remove')){
        // Remove one secret
        var myurl=e.target.getAttribute("data-url");
        if (confirm("Are you sure you want to remove "+myurl))
        {
            var gettingStoredSettings = browser.storage.local.get();
            gettingStoredSettings.then(function(secrets) {

                delete secrets["twoFactorial"][myurl];
                browser.storage.local.set(secrets);
                browser.runtime.sendMessage("update");
                updateOptionsPage();

            }, onError);
        }
    }
});

function processData(csv) {

    var allTextLines = csv.split(/\r\n|\n/);
    var gettingStoredSettings = browser.storage.local.get();
    gettingStoredSettings.then(function(secrets){
        var count=0;
        for (var i=0; i<allTextLines.length; i++) {
            splitpoint=allTextLines[i].indexOf(",");
            if (splitpoint>=1)
            {
                var url=allTextLines[i].substr(0, splitpoint);
                var secret=allTextLines[i].substr(splitpoint+1, allTextLines[i].length-splitpoint);

                // Remove any double quotes from the start and end
                if (url.substr(0, 1)=='"') url=url.substr(1, url.length-2);
                if (secret.substr(0, 1)=='"') secret=secret.substr(1, secret.length-2);

                if (url!="" && secret !="")
                {
                    count++;
                    secrets.twoFactorial[url]=secret;
                }
            }
        }
        if (count>0)
        {
            // Update local storage with the imported values
            browser.storage.local.set(secrets);
            browser.runtime.sendMessage("update");
            updateOptionsPage();
        }
        importInput.value="";
    }, onError);
}

function readImportFile(evt) {
    if (confirm("This will overwrite any existing secrets! Are you sure?")) {
        //Retrieve all the files from the FileList object
        var files = evt.target.files;
        if (files) {
            for (var i = 0, f; f = files[i]; i++) {
                var r = new FileReader();
                r.onload = (function (f) {
                    return function (e) {
                        var contents = e.target.result;
                        processData(contents);
                    };
                })(f);
                r.readAsText(f);
            }
        } else {
            alert("Failed to load import file.");
        }
    }
    else importInput.value="";
}
importInput.addEventListener('change', readImportFile, false);

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
