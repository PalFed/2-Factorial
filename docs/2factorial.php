<?php
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
?>
