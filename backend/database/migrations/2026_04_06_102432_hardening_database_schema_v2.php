<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Hardening Database Schema V2 — Performance & Integrity Sweep.
 * Final round of backend hardening before UI/UX focus.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Performance Indexes for Search & Sorting
        Schema::table('medicaments', function (Blueprint $table) {
            if (! Schema::hasIndex('medicaments', 'medicaments_nom_profil_id_index')) {
                $table->index(['nom', 'profil_id']);
            }
            if (! Schema::hasIndex('medicaments', 'medicaments_quantite_index')) {
                $table->index('quantite');
            }
            if (! Schema::hasIndex('medicaments', 'medicaments_date_expiration_index')) {
                $table->index('date_expiration');
            }
        });

        Schema::table('rappels', function (Blueprint $table) {
            if (! Schema::hasIndex('rappels', 'rappels_heure_index')) {
                $table->index('heure');
            }
            if (! Schema::hasIndex('rappels', 'rappels_moment_index')) {
                $table->index('moment');
            }
        });

        Schema::table('prises', function (Blueprint $table) {
            if (! Schema::hasIndex('prises', 'idx_prises_lookup')) {
                $table->index(['rappel_id', 'date_prise', 'pris'], 'idx_prises_lookup');
            }
        });

        Schema::table('achats', function (Blueprint $table) {
            if (! Schema::hasIndex('achats', 'achats_date_achat_index')) {
                $table->index('date_achat');
            }
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            if (! Schema::hasIndex('activity_logs', 'activity_logs_action_index')) {
                $table->index('action');
            }
            if (! Schema::hasIndex('activity_logs', 'activity_logs_created_at_index')) {
                $table->index('created_at');
            }
        });

        Schema::table('master_medicaments', function (Blueprint $table) {
            if (! Schema::hasIndex('master_medicaments', 'master_medicaments_nom_index')) {
                $table->index('nom');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('medicaments', function (Blueprint $table) {
            if (Schema::hasIndex('medicaments', 'medicaments_nom_profil_id_index')) {
                $table->dropIndex(['nom', 'profil_id']);
            }
            if (Schema::hasIndex('medicaments', 'medicaments_quantite_index')) {
                $table->dropIndex(['quantite']);
            }
            if (Schema::hasIndex('medicaments', 'medicaments_date_expiration_index')) {
                $table->dropIndex(['date_expiration']);
            }
        });

        Schema::table('rappels', function (Blueprint $table) {
            if (Schema::hasIndex('rappels', 'rappels_heure_index')) {
                $table->dropIndex(['heure']);
            }
            if (Schema::hasIndex('rappels', 'rappels_moment_index')) {
                $table->dropIndex(['moment']);
            }
        });

        Schema::table('prises', function (Blueprint $table) {
            if (Schema::hasIndex('prises', 'idx_prises_lookup')) {
                $table->dropIndex('idx_prises_lookup');
            }
        });

        Schema::table('achats', function (Blueprint $table) {
            if (Schema::hasIndex('achats', 'achats_date_achat_index')) {
                $table->dropIndex(['date_achat']);
            }
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            if (Schema::hasIndex('activity_logs', 'activity_logs_action_index')) {
                $table->dropIndex(['action']);
            }
            if (Schema::hasIndex('activity_logs', 'activity_logs_created_at_index')) {
                $table->dropIndex(['created_at']);
            }
        });

        Schema::table('master_medicaments', function (Blueprint $table) {
            if (Schema::hasIndex('master_medicaments', 'master_medicaments_nom_index')) {
                $table->dropIndex(['nom']);
            }
        });
    }
};
