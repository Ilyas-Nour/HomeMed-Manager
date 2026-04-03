<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use App\Models\Rappel;
use App\Models\Prise;
use App\Models\ActivityLog;
use Carbon\Carbon;

class CheckMissedDoses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'homemed:check-missed';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Vérifier les doses non prises après 1h du moment prévu.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = Carbon::now();
        $today = $now->toDateString();
        
        // On récupère les rappels de la journée qui ont plus d'une heure de retard
        $rappels = Rappel::whereTime('heure', '<=', $now->subHour()->toTimeString())->get();

        foreach ($rappels as $rappel) {
            // On vérifie si une prise existe déjà pour ce rappel aujourd'hui
            $prise = Prise::where('rappel_id', $rappel->id)
                ->where('date_prise', $today)
                ->first();

            if (!$prise) {
                // Log de l'oubli si pas déjà loggé
                $exists = ActivityLog::where('action', 'PRISE_MISSED')
                    ->where('metadata->rappel_id', $rappel->id)
                    ->whereDate('created_at', $today)
                    ->exists();

                if (!$exists) {
                    ActivityLog::create([
                        'user_id'     => $rappel->medicament->profil->user_id,
                        'action'      => 'PRISE_MISSED',
                        'description' => "Dose oubliée : {$rappel->medicament->nom} à {$rappel->heure}",
                        'metadata'    => ['rappel_id' => $rappel->id, 'medicament_id' => $rappel->medicament_id]
                    ]);
                    
                    $this->info("Oubli enregistré pour : {$rappel->medicament->nom}");
                }
            }
        }

        $this->info('Vérification terminée.');
    }
}
