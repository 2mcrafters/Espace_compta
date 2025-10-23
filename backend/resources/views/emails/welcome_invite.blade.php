<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; color: #111827; }
        .btn { display: inline-block; padding: 10px 16px; background: #2563eb; color: #fff !important; text-decoration: none; border-radius: 8px; }
        .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
    </style>
    </head>
<body>
    <div class="card">
        <h2>Bienvenue {{ $user->first_name ?: $user->name }}</h2>
        <p>Un compte a été créé pour vous dans Espace Compta.</p>
        <p>Pour finaliser votre accès, merci de définir votre mot de passe en cliquant sur le bouton ci-dessous :</p>
        <p>
            <a class="btn" href="{{ $resetUrl }}" target="_blank" rel="noopener">Définir mon mot de passe</a>
        </p>
        <p>Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :</p>
        <p><a href="{{ $resetUrl }}" target="_blank" rel="noopener">{{ $resetUrl }}</a></p>
        <p style="color:#6b7280">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
    </div>
</body>
</html>
