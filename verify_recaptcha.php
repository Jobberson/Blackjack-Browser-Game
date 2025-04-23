<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $recaptchaResponse = $_POST['g-recaptcha-response'];
    $secretKey = 'YOUR_SECRET_KEY';
    $verifyResponse = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret={$secretKey}&response={$recaptchaResponse}");
    $responseData = json_decode($verifyResponse);

    if ($responseData->success) {
        // Verified successfully
        echo "Verification successful!";
    } else {
        // Verification failed
        echo "Verification failed!";
    }
} else {
    echo "Invalid request method.";
}
?>
