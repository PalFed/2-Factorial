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
if ($authorised) print "<p><strong>You are currently authorized</strong></p>";
else print "<p><strong>You are not currently authorized</strong></p>";
?>
<p>Please enter your 2FA secret. This must match what has been entered in the 2 Factorial preferences as the secret for <?php echo $_SERVER['HTTP_HOST']; ?>. The current secret is not shown. <a href='index.php'>Home</a></p>
<form action="secret.php" method="post">
    Secret: <input type="password" name="secret"> <input type='submit' value='Save Secret'>
</form>
<hr>
<h2>Real Installation</h2>
<p>In a real installation, the user would go to their preferences page, switch on 2FA via 2Factorial and enter their secret there to be saved on the server. They would then enter the same secret in the 2Factorial Extension Preferences page.</p>
</body></html>
