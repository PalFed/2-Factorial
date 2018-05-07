<?php
include_once 'thirdparty/base32.php';
include_once 'thirdparty/otp.php';
include_once 'thirdparty/totp.php';

function check2Factorial($userSecret)
{
    $headers =  getallheaders();
    if (isset($headers["Two-Factorial"]))
    {
        // Verify with TOTP
        $totp = new \OTPHP\TOTP(Base32::encode($userSecret));
        return $totp->verify($headers["Two-Factorial"]);
    }
    return false;
}


?>
