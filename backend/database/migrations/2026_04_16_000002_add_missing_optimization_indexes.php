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
        // Table 'medicaments'
        Schema::table('medicaments', function (Blueprint $table) {
            if (!Schema::hasIndex('medicaments', 'medicaments_quantite_index')) {
                $table->index('quantite');
            }
            if (!Schema::hasIndex('medicaments', 'medicaments_date_expiration_index')) {
                $table->index('date_expiration');
            }
            // Composite index for profile-specific expiration tracking
            if (!Schema::hasIndex('medicaments', 'medicaments_profil_expiration_index')) {
                $table->index(['profil_id', 'date_expiration']);
            }
        });

        // Table 'achats'
        Schema::table('achats', function (Blueprint $table) {
            if (!Schema::hasIndex('achats', 'achats_prix_index')) {
                $table->index('prix');
            }
            if (!Schema::hasIndex('achats', 'achats_statut_index')) {
                $table->index('statut');
            }
            // Composite index for user/profile purchase history
            if (!Schema::hasIndex('achats', 'achats_profil_date_achat_index')) {
                $table->index(['profil_id', 'date_achat']);
            }
        });

        // Table 'rappels'
        Schema::table('rappels', function (Blueprint $table) {
            // Composite index for checking due reminders
            if (!Schema::hasIndex('rappels', 'rappels_medicament_heure_index')) {
                $table->index(['medicament_id', 'heure']);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('medicaments', function (Blueprint $table) {
            $table->dropIndex(['quantite']);
            $table->dropIndex(['date_expiration']);
            $table->dropIndex(['profil_id', 'date_expiration']);
        });

        Schema::table('achats', function (Blueprint $table) {
            $table->dropIndex(['prix']);
            $table->dropIndex(['statut']);
            $table->dropIndex(['profil_id', 'date_achat']);
        });

        Schema::table('rappels', function (Blueprint $table) {
            $table->dropIndex(['medicament_id', 'heure']);
        });
    }
};
