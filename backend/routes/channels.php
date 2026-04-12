<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('App.Models.Profil.{id}', function ($user, $id) {
    return $user->profils()->where('profils.id', $id)->exists();
});

Broadcast::channel('users.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('requests.{requestId}', function ($user, $requestId) {
    $request = \App\Models\MedicamentRequest::find($requestId);
    if (!$request) return false;
    return (int) $user->id === (int) $request->requester_id || (int) $user->id === (int) $request->owner_id;
});
