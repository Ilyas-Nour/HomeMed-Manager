<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SendReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'homemed:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scanne les rappels et envoie les notifications en temps réel.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = \Carbon\Carbon::now();
        $currentTime = $now->format('H:i');
        $todayStr = $now->toDateString();

        $this->info("🕒 Scan des rappels pour {$currentTime}...");

        // On récupère les rappels prévus pour cette minute précise
        $rappels = \App\Models\Rappel::with('medicament.profil')
            ->whereTime('heure', $currentTime . ':00')
            ->get();

        if ($rappels->isEmpty()) {
            $this->info('Aucun rappel à cette minute.');
            return;
        }

        foreach ($rappels as $rappel) {
            $userId = $rappel->medicament->profil->user_id;
            $profilId = $rappel->medicament->profil_id;

            // 1. Éviter les doublons (si une notification réelle existe déjà pour ce rappel AUJOURD'HUI)
            $exists = \App\Models\Notification::where('user_id', $userId)
                ->where('type', 'reminder')
                ->where('data->id', $rappel->id)
                ->whereDate('created_at', $todayStr)
                ->exists();

            if ($exists) {
                continue;
            }

            // 2. Création de la notification persistante
            $notification = \App\Models\Notification::create([
                'user_id'   => $userId,
                'profil_id' => $profilId,
                'type'      => 'reminder',
                'title'     => '💊 Il est l\'heure !',
                'message'   => "Il est l'heure de prendre votre médicament : {$rappel->medicament->nom}",
                'data'      => [
                    'id' => $rappel->id,
                    'medicament' => $rappel->medicament->nom,
                    'heure' => $rappel->heure,
                    'status' => 'due'
                ]
            ]);

            // 3. Broadcast pour le temps réel (via l'événement existant DataChanged)
            broadcast(new \App\Events\DataChanged('new_notification', $profilId));

            $this->info("✅ Notification envoyée pour : {$rappel->medicament->nom} (User: {$userId})");
        }

        $this->info('Scan terminé.');
    }
}
