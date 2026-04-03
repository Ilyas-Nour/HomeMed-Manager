<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('profils', function (Blueprint $table) {
            $table->index('user_id');
        });

        Schema::table('medicaments', function (Blueprint $table) {
            $table->index('profil_id');
        });

        Schema::table('rappels', function (Blueprint $table) {
            $table->index('medicament_id');
        });

        Schema::table('prises', function (Blueprint $table) {
            $table->index(['rappel_id', 'date_prise']);
        });

        Schema::table('achats', function (Blueprint $table) {
            $table->index('medicament_id');
        });

        Schema::table('groupes', function (Blueprint $table) {
            $table->index('proprietaire_id');
        });

        Schema::table('groupe_user', function (Blueprint $table) {
            $table->index(['groupe_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profils', function (Blueprint $table) { $table->dropIndex(['user_id']); });
        Schema::table('medicaments', function (Blueprint $table) { $table->dropIndex(['profil_id']); });
        Schema::table('rappels', function (Blueprint $table) { $table->dropIndex(['medicament_id']); });
        Schema::table('prises', function (Blueprint $table) { $table->dropIndex(['rappel_id', 'date_prise']); });
        Schema::table('achats', function (Blueprint $table) { $table->dropIndex(['medicament_id']); });
        Schema::table('groupes', function (Blueprint $table) { $table->dropIndex(['proprietaire_id']); });
        Schema::table('groupe_user', function (Blueprint $table) { $table->dropIndex(['groupe_id', 'user_id']); });
    }
};
