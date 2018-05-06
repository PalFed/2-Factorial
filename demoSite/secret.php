<?php
session_start();
/* Sessions are being used in this demo to simulate a secret from the server */

include_once __DIR__.'/2factorial.php';
$authorised=check2Factorial($_SESSION['ServerSideSecret']);
if (isset($_POST['secret']))
{
    $_SESSION['ServerSideSecret']=$_POST['secret'];
    header("Location: index.php");
    exit();
}
?>
<html>
<head>
    <title>2 Factorial Demo</title>
    <link rel="stylesheet" href="2factorial.css">
</head>
<body>
<h1>2 Factorial Demo : Setup 2FA</h1>
<?php
if ($authorised) print "<p><strong>You are currently authorized</strong> <a href='index.php'>Home</a></p>";
else print "<p><strong>You are not currently authorized</strong> <a href='index.php'>Home</a></p>";
?>
<p>Please enter your 2FA secret. This must match what has been entered in the 2 Factorial preferences as the secret for <?php echo $_SERVER['HTTP_HOST']; ?>. <?php

if (isset($_SESSION['ServerSideSecret'])) print "The current secret is not shown.";
else print "No secret has been set.";
    ?></p>
<p>Note: The secret for this demo is stored in the session, which will timeout after <?php echo number_format(ini_get("session.gc_maxlifetime"), 0); ?> seconds of inactivity.</p>
<form action="secret.php" method="post">
    Secret: <input title="Secret" type="password" name="secret"> <input type='submit' title="Save Secret" value='Save Secret'>
</form>
<hr>
<h2>Real Installation</h2>
<p>In a real installation, the user would go to their preferences page, switch on 2FA via 2 Factorial and enter their secret there to be saved on the server. They would then enter the same secret in the 2 Factorial Extension Preferences page.</p>
</body></html>
