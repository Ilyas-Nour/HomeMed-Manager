<?php

namespace Database\Seeders;

use App\Models\Achat;
use App\Models\ActivityLog;
use App\Models\Groupe;
use App\Models\Medicament;
use App\Models\Prise;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ScenarioSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Configuring "Lightning Fast" Test Scenario...');

        // 1. Primary User (Ilyass)
        $ilyass = User::create([
            'name' => 'Ilyass Nour',
            'email' => 'ilyass@homemed.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // 2. Profiles for Ilyass
        $profils = [
            ['nom' => 'Moi', 'relation' => 'Lui-même'],
            ['nom' => 'Maman', 'relation' => 'Parent'],
            ['nom' => 'Zineb', 'relation' => 'Enfant'],
        ];

        foreach ($profils as $pData) {
            $profil = $ilyass->profils()->create($pData);

            // 3. Medications for each profile
            $numMeds = $pData['nom'] === 'Moi' ? 8 : 4;

            Medicament::factory($numMeds)->create(['profil_id' => $profil->id])->each(function ($med) {
                // Add Rappels
                $moments = ['matin', 'midi', 'soir'];
                foreach ($moments as $m) {
                    if (rand(0, 1)) {
                        $rappel = $med->rappels()->create([
                            'moment' => $m,
                            'heure' => $m === 'matin' ? '08:00' : ($m === 'midi' ? '12:30' : '19:45'),
                        ]);

                        // Add some history for the last 3 days
                        for ($i = 0; $i < 3; $i++) {
                            Prise::create([
                                'rappel_id' => $rappel->id,
                                'date_prise' => Carbon::today()->subDays($i)->toDateString(),
                                'pris' => rand(0, 5) > 0, // Mostly taken
                            ]);
                        }
                    }
                }

                // Add Purchases
                Achat::factory(rand(1, 3))->create(['medicament_id' => $med->id]);
            });
        }

        // 4. Family Member (Collaborator)
        $family = User::create([
            'name' => 'Sarah Family',
            'email' => 'family@homemed.com',
            'password' => Hash::make('password'),
        ]);

        $family->profils()->create(['nom' => 'Sarah', 'relation' => 'Lui-même']);

        // 5. Shared Group
        $group = Groupe::create([
            'nom' => 'Famille Dupont (Partagée)',
            'proprietaire_id' => $ilyass->id,
        ]);

        $group->participants()->attach($ilyass->id, ['role' => 'proprietaire']);
        $group->participants()->attach($family->id, ['role' => 'membre']);

        // 6. Logs
        ActivityLog::create([
            'user_id' => $ilyass->id,
            'action' => 'TEST_INIT',
            'description' => 'Scénarios de test générés avec succès pour Ilyass et Sarah.',
        ]);

        $this->command->info('--------------------------------------------------');
        $this->command->info('SCENARIO READY:');
        $this->command->info('User 1: ilyass@homemed.com / password (Admin)');
        $this->command->info('User 2: family@homemed.com / password');
        $this->command->info('--------------------------------------------------');
    }
}
