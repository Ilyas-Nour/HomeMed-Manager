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
        Schema::table('achats', function (Blueprint $table) {
            // Index composite pour optimiser le filtrage par profil, statut et le tri chronologique
            if (!Schema::hasIndex('achats', 'achats_profil_statut_updated_index')) {
                $table->index(['profil_id', 'statut', 'updated_at'], 'achats_profil_statut_updated_index');
            }
            
            // Index sur le nom temporaire pour les recherches rapides
            if (!Schema::hasIndex('achats', 'achats_medicament_nom_temp_index')) {
                $table->index('medicament_nom_temp', 'achats_medicament_nom_temp_index');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('achats', function (Blueprint $table) {
            if (Schema::hasIndex('achats', 'achats_profil_statut_updated_index')) {
                $table->dropIndex('achats_profil_statut_updated_index');
            }
            if (Schema::hasIndex('achats', 'achats_medicament_nom_temp_index')) {
                $table->dropIndex('achats_medicament_nom_temp_index');
            }
        });
    }
};
