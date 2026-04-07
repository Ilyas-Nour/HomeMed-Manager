<?php

namespace Database\Seeders;

use App\Models\Achat;
use App\Models\ActivityLog;
use App\Models\Groupe;
use App\Models\Medicament;
use App\Models\Prise;
use App\Models\Profil;
use App\Models\Rappel;
use App\Models\User;
use Illuminate\Database\Seeder;

class StressTestSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Starting Stress Test Seeding...');

        // 1. Create 50 Users
        $users = User::factory(50)->create();

        $users->each(function ($user) {

            // 2. 50 Activity Logs per user
            ActivityLog::factory(50)->create(['user_id' => $user->id]);

            // 3. 5 Profiles per user
            Profil::factory(5)->create(['user_id' => $user->id])->each(function ($profil) {

                // 4. 10 Medications per profile
                Medicament::factory(10)->create([
                    'profil_id' => $profil->id,
                ])->each(function ($med) {

                    // 5. 2 Rappels per medication
                    Rappel::factory(2)->create(['medicament_id' => $med->id])->each(function ($rappel) {
                        // 6. 5 Prises per rappel
                        Prise::factory(5)->create(['rappel_id' => $rappel->id]);
                    });

                    // 7. 3 Achats per medication
                    Achat::factory(3)->create(['medicament_id' => $med->id]);
                });
            });
        });

        // 8. Create 20 Groups with random participants
        $this->command->info('Creating Groups...');
        Groupe::factory(20)->create()->each(function ($groupe) use ($users) {
            // Owner is already set by factory, but let's re-assign to one of our 50 users for consistency
            $owner = $users->random();
            $groupe->update(['proprietaire_id' => $owner->id]);

            // Attach 5-10 random participants
            $participants = $users->where('id', '!=', $owner->id)->random(rand(5, 10))->pluck('id');
            $groupe->participants()->attach($participants);
        });

        $this->command->info('Stress Test Seeding Completed!');
    }
}
