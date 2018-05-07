//JavaScript implementation of the Time-based One-time Password Algorithm, as described in the TOTP RFC Draft (http://tools.ietf.org/id/draft-mraihi-totp-timebased-06.html).

function dec2hex(s) {
    return (s < 15.5 ? '0' : '') + Math.round(s).toString(16);
}
function hex2dec(s) {
    return parseInt(s, 16);
}
function base32tohex(base32) {
    var base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    var bits = "";
    var hex = "";
    for (var i = 0; i < base32.length; i++) {
        var val = base32chars.indexOf(base32.charAt(i).toUpperCase());
        bits += leftpad(val.toString(2), 5, '0');
    }
    for (var i = 0; i+4 <= bits.length; i+=4) {
        var chunk = bits.substr(i, 4);
        hex = hex + parseInt(chunk, 2).toString(16) ;
    }
    return hex;
}

function leftpad(str, len, pad) {
    if (len + 1 >= str.length) {
        str = Array(len + 1 - str.length).join(pad) + str;
    }
    return str;
}
function generateTOTP(secret){
    //Using jsSHA-2.2.0 https://github.com/Caligatio/jsSHA
    var jsSHAobj = new jsSHA("SHA-1", "HEX");

    var epoch = Math.round(new Date().getTime() / 1000.0);
    var time = leftpad(dec2hex(Math.floor(epoch / 30)), 16, '0');

    //Hashed Message Authentication Code (HMAC) with the crypto hash algorithm SHA-1
    jsSHAobj.setHMACKey(base32tohex(secret), "HEX");
    jsSHAobj.update(time);
    var HMAC = jsSHAobj.getHMAC("HEX");

    //Read last 4 bits (1 character) from HMAC string to determine offset
    var lastHMACcharHex = HMAC.substr(-1);
    //Convert character to decimal
    var lastHMACcharDec = hex2dec(lastHMACcharHex);
    //Read the next 31-bits, with lastHMACcharDec value as offset
    //Offset*2 to convert nibble offset to byte offset
    var TOTP = (hex2dec(HMAC.substr(lastHMACcharDec * 2, 8)) & hex2dec('7fffffff')) + '';
    //Get last 6 digits of the decimal string
    TOTP = TOTP.substr(TOTP.length - 6, 6);

    //Show code on page
    return TOTP;
}