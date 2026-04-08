<x-mail::message>
# Collaboration HomeMed

Bonjour,

Vous avez été invité à rejoindre le groupe de coordination médicale **{{ $groupe->nom }}**.

En rejoignant ce groupe, vous pourrez :
- Accéder aux dossiers médicaux partagés.
- Coordonner les prises de médicaments en temps réel.
- Recevoir des alertes de stock critiques.

@if($isExistingUser)
<x-mail::button :url="config('app.frontend_url') . '/groups/accept?token=' . $token">
Accéder au Groupe
</x-mail::button>
@else
<x-mail::button :url="config('app.frontend_url') . '/register?token=' . $token . '&email=' . $email ?? ''">
Créer mon compte et rejoindre
</x-mail::button>
@endif

Merci,<br>
L'équipe {{ config('app.name') }}
</x-mail::message>
