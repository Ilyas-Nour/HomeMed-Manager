<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vérification de votre compte</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            margin: 0;
            padding: 0;
            background-color: #f4f7f6;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.05);
        }
        .header {
            background-color: #20835b;
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
            font-weight: 900;
            letter-spacing: -1px;
        }
        .content {
            padding: 40px;
            text-align: center;
        }
        .content p {
            font-size: 16px;
            color: #4a4a4a;
            margin-bottom: 30px;
        }
        .code-container {
            background: #f8faf9;
            border: 2px dashed #20835b;
            border-radius: 16px;
            padding: 30px;
            margin: 20px 0;
        }
        .code {
            font-size: 48px;
            font-weight: 900;
            color: #20835b;
            letter-spacing: 12px;
            margin: 0;
        }
        .footer {
            padding: 30px;
            background: #fafafa;
            text-align: center;
            font-size: 12px;
            color: #a0aec0;
        }
        .footer p {
            margin: 5px 0;
        }
        .disclaimer {
            font-size: 13px;
            color: #718096;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>HomeMed Manager</h1>
        </div>
        <div class="content">
            <h2>Vérification de votre e-mail</h2>
            <p>Bonjour,<br>Merci de rejoindre HomeMed Manager. Pour finaliser la création de votre compte, veuillez saisir le code de sécurité ci-dessous :</p>
            
            <div class="code-container">
                <div class="code">{{ $code }}</div>
            </div>

            <p class="disclaimer">Ce code expirera dans 10 minutes pour votre sécurité.<br>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.</p>
        </div>
        <div class="footer">
            <p>&copy; 2026 HomeMed Manager. Tous droits réservés.</p>
            <p>Simplifiez la gestion de votre santé à domicile.</p>
        </div>
    </div>
</body>
</html>
