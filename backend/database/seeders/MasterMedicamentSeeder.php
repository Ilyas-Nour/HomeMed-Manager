<?php

namespace Database\Seeders;

use App\Models\MasterMedicament;
use Illuminate\Database\Seeder;

class MasterMedicamentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $meds = [
            ['nom' => 'Doliprane', 'type' => 'Comprimé'],
            ['nom' => 'Amoxicilline', 'type' => 'Gélule'],
            ['nom' => 'Spasfon', 'type' => 'Comprimé'],
            ['nom' => 'Dafalgan', 'type' => 'Gaufrette'],
            ['nom' => 'Gaviscon', 'type' => 'Sirop'],
            ['nom' => 'Ventoline', 'type' => 'Inhalation'],
            ['nom' => 'Humex', 'type' => 'Comprimé'],
            ['nom' => 'Fervex', 'type' => 'Sachet'],
            ['nom' => 'Maxilase', 'type' => 'Sirop'],
            ['nom' => 'Augmentin', 'type' => 'Comprimé'],
        ];

        foreach ($meds as $med) {
            MasterMedicament::firstOrCreate($med);
        }
    }
}
