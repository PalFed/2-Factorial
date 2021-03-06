<?php
session_start();
/* Sessions are being used in this demo to simulate a secret from the server */

/* Are we authorized? A real app might check this once after logging and then
 * log the user out if they are not, or set a session variable.
 *
 * It could also be checked on every page load
 */
include_once __DIR__.'/2factorial.php';
$authorised=check2Factorial($_SESSION['ServerSideSecret']);

?>
<html>
<head>
    <title>2 Factorial Demo</title>
    <link rel="stylesheet" href="2factorial.css">
</head>
<body>
<h1>2 Factorial Demo</h1>
<?php if ($authorised) { ?>
    <p>You are authorized to view this page. <a href='secret.php'>Setup 2FA</a></p>
    <hr>
    <h2>Real Installation</h2>
    <p>In a real installation, this message would not exist. This would be whatever page in the webapp the user is going to.</p>
<?php } else { ?>
    <p>Note: You must install the 2-Factorial web extension for this to work. It can currently be installed by downloading the <a href="https://github.com/PalFed/2-Factorial">source code</a> and installing with about:debugging</p>

<p>You are not authorized to view this page. <a href='secret.php'>Setup 2FA</a></p>
    <hr>
    <h2>Real Installation</h2>
    <p>In a real installation, this page would only be shown if the user was not authorized. The Setup 2FA link would not be here in a real application, but would be part of the user's profile setup.</p>
<?php } ?>
</body>
</html>
