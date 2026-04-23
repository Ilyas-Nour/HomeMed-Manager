<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation de mot de passe - HomeMed</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f3f4f6;
            margin: 0;
            padding: 0;
            color: #1f2937;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f3f4f6;
            padding: 40px 0;
        }
        .main {
            background-color: #ffffff;
            margin: 0 auto;
            width: 100%;
            max-width: 520px;
            border-spacing: 0;
            border-radius: 24px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.05);
            overflow: hidden;
        }
        .header {
            padding: 40px 40px 20px;
            text-align: center;
        }
        .logo-container {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 24px;
        }
        .logo-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
            border-radius: 12px;
            color: white;
            font-weight: 800;
            font-size: 20px;
            line-height: 40px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);
        }
        .logo-text {
            font-size: 22px;
            font-weight: 800;
            color: #111827;
            letter-spacing: -0.5px;
        }
        .hero-image {
            width: 100%;
            height: 4px;
            background: linear-gradient(90deg, #4f46e5, #10b981);
        }
        .content {
            padding: 10px 40px 40px;
        }
        h1 {
            font-size: 24px;
            font-weight: 700;
            color: #111827;
            margin: 0 0 16px 0;
            text-align: center;
            letter-spacing: -0.5px;
        }
        p {
            font-size: 15px;
            line-height: 1.6;
            color: #4b5563;
            margin: 0 0 24px 0;
            text-align: center;
        }
        .code-wrapper {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 32px 20px;
            text-align: center;
            margin: 32px 0;
        }
        .code-label {
            font-size: 12px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
        }
        .code-text {
            font-family: 'SF Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            font-size: 42px;
            font-weight: 700;
            color: #4f46e5;
            letter-spacing: 8px;
            margin: 0;
            text-shadow: 0 2px 4px rgba(79, 70, 229, 0.1);
        }
        .security-notice {
            background-color: #ecfdf5;
            border-left: 4px solid #10b981;
            padding: 16px;
            border-radius: 0 12px 12px 0;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .security-icon {
            color: #10b981;
            font-size: 20px;
        }
        .security-text {
            font-size: 13px;
            color: #065f46;
            margin: 0;
            text-align: left;
            line-height: 1.5;
        }
        .divider {
            height: 1px;
            background-color: #f3f4f6;
            margin: 32px 0;
        }
        .footer {
            text-align: center;
            padding: 0 40px 40px;
        }
        .footer p {
            font-size: 13px;
            color: #9ca3af;
            margin: 0 0 8px 0;
        }
        .social-links {
            margin-top: 16px;
        }
        .social-links a {
            color: #9ca3af;
            text-decoration: none;
            margin: 0 8px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <table class="main">
            <tr>
                <td style="padding: 0;">
                    <div class="hero-image"></div>
                </td>
            </tr>
            <tr>
                <td class="header">
                    <div style="font-size: 28px; font-weight: 900; color: #111827; letter-spacing: -1px; text-align: center;">HomeMed</div>
                </td>
            </tr>
            <tr>
                <td class="content">
                    <h1>Réinitialisez votre mot de passe</h1>
                    <p>Nous avons reçu une demande pour réinitialiser le mot de passe de votre compte HomeMed. Entrez le code de vérification suivant pour continuer :</p>
                    
                    <div class="code-wrapper">
                        <div class="code-label">Votre code de sécurité</div>
                        <div class="code-text">{{ $code }}</div>
                    </div>

                    <div class="security-notice">
                        <div class="security-text">
                            <strong>Protégez votre compte :</strong> Ce code expire dans 15 minutes. Ne le partagez avec personne. Nos équipes ne vous le demanderont jamais.
                        </div>
                    </div>
                    
                    <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">Si vous n'avez pas fait cette demande, vous pouvez ignorer cet e-mail en toute sécurité.</p>
                </td>
            </tr>
            <tr>
                <td>
                    <div class="divider"></div>
                </td>
            </tr>
            <tr>
                <td class="footer">
                    <p>&copy; {{ date('Y') }} HomeMed Manager. Tous droits réservés.</p>
                    <p>La plateforme intelligente pour la gestion de votre santé familiale.</p>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
