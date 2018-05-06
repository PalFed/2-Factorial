# 2 Factorial web extension

2 Factorial is a web extension aiming to provide additional, automated 2 factor authentication for websites that support it.

On a supported web site, a user must create a secret that is saved in the extension as well as on the website.
Once saved on the website, only devices with the 2 Factorial extension enabled that the user has entered this secret for 
will be able to access the site. Any other devices will not be authorized.

## Client Perspective

When you login or register for a site that supports 2FA via 2 Factorial, go to the preferences for the 2 Factorial 
web extension (once it is installed) and create a secret for that URL.

For example, if you had a login for www.example.com and they supported 2FA via 2 Factorial, then you would enter
www.example.com as the URL.

Generate a secret, or type your own and copy it. Paste it into the input on the page at www.example.com where you can 
configure 2 Factorial and save, then save it in the web extension as well.

At this point you should not be able to login to www.example.com from any other browser or device.

## Website Perspective

There are a numbers of options for how to implement 2 Factorial on a website.
In all cases, you will need a place where a logged in user can save their 2 Factorial secret for your site.

You can then make a call to a page that requires 2FA via 2 Factorial and authorize the user/device, or you can authorize 
the user on every page load.

Authorization is very simple. There will be two headers in page requests that give you a hash and a salt.
You simply sha-256 hash the salt concatenated with the secret that the user saved and check that it matches the hash. 
If it does the user is authorized. If it does not, or there is no header, the user is not authorized.

Due to the unreliable nature of both and people, if a user is not authorized, you should provide a route to 
authentication via further means that require human interaction, e.g. an email with a link, or an SMS. This will also 
alert the affected user to the unauthorized access attempt.

PHP Snippet:

```
function check2Factorial($userSecret)
{
    $headers =  getallheaders();
    if (isset($headers["Two-Factorial"]) && isset($headers["Two-Factorial-Salt"]))
    {
        if (hash("sha256", $headers["Two-Factorial-Salt"].$userSecret)==$headers["Two-Factorial"])
        {
            return true;
        }
    }
    return false;
}
```

Then at the top of any page that you want to check 2FA via 2 Factorial:

```
$authorized=check2Factorial($usersSecret);
if (!$authorized)
{
    header("HTTP/1.0 401 Unauthorized");     
    exit();
}
``` 





