<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration pour ajouter des index de performance aux tables clés.
 * Cette version utilise Schema::hasIndex (Laravel 11+) pour être idempotente
 * et cible les colonnes réelles existantes dans la base de données.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Table 'achats'
        Schema::table('achats', function (Blueprint $table) {
            // medicament_id est déjà indexé par foreignId
            $this->addIndexIfNotExists('achats', 'achats_date_achat_index', ['date_achat'], $table);
        });

        // Table 'prises'
        Schema::table('prises', function (Blueprint $table) {
            // rappel_id est déjà indexé par foreignId
            $this->addIndexIfNotExists('prises', 'prises_pris_index', ['pris'], $table);
            $this->addIndexIfNotExists('prises', 'prises_date_prise_index', ['date_prise'], $table);
            // Index composite pour les recherches par date et statut
            $this->addIndexIfNotExists('prises', 'prises_date_pris_composite_index', ['date_prise', 'pris'], $table);
        });

        // Table 'rappels'
        Schema::table('rappels', function (Blueprint $table) {
            // medicament_id est déjà indexé par foreignId
            $this->addIndexIfNotExists('rappels', 'rappels_moment_index', ['moment'], $table);
            $this->addIndexIfNotExists('rappels', 'rappels_heure_index', ['heure'], $table);
        });
    }

    /**
     * Helper to add index only if it doesn't exist.
     */
    private function addIndexIfNotExists(string $table, string $indexName, array $columns, Blueprint $blueprint)
    {
        if (! Schema::hasIndex($table, $indexName)) {
            $blueprint->index($columns, $indexName);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('achats', function (Blueprint $table) {
            if (Schema::hasIndex('achats', 'achats_date_achat_index')) {
                $table->dropIndex('achats_date_achat_index');
            }
        });

        Schema::table('prises', function (Blueprint $table) {
            if (Schema::hasIndex('prises', 'prises_pris_index')) {
                $table->dropIndex('prises_pris_index');
            }
            if (Schema::hasIndex('prises', 'prises_date_prise_index')) {
                $table->dropIndex('prises_date_prise_index');
            }
            if (Schema::hasIndex('prises', 'prises_date_pris_composite_index')) {
                $table->dropIndex('prises_date_pris_composite_index');
            }
        });

        Schema::table('rappels', function (Blueprint $table) {
            if (Schema::hasIndex('rappels', 'rappels_moment_index')) {
                $table->dropIndex('rappels_moment_index');
            }
            if (Schema::hasIndex('rappels', 'rappels_heure_index')) {
                $table->dropIndex('rappels_heure_index');
            }
        });
    }
};
