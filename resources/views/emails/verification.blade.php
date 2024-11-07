<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .otp-box {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-radius: 5px;
            margin: 20px 0;
        }
        .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #007bff;
            letter-spacing: 2px;
        }
    </style>
</head>
<body>
<div class="container">
    <h2>Hello {{ $name }},</h2>
    <p>Thank you for registering. To verify your email address, please use the following OTP code:</p>

    <div class="otp-box">
        <div class="otp-code">{{ $otp }}</div>
    </div>

    <p>This code will expire in 10 minutes.</p>

    <p>If you didn't create an account, you can safely ignore this email.</p>

    <p>Best regards,<br>Your App Team</p>
</div>
</body>
</html>
