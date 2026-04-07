<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminFixSeeder extends Seeder
{
    public function run()
    {
        $user = User::where('email', 'ilyass@homemed.com')->first();
        if ($user) {
            $user->update([
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]);
            $this->command->info('User "ilyass@homemed.com" password reset to "password" and role set to "admin".');
        } else {
            User::create([
                'name' => 'Ilyass Nour',
                'email' => 'ilyass@homemed.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]);
            $this->command->info('User "ilyass@homemed.com" created with password "password" and role "admin".');
        }
    }
}
