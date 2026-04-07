<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration pour la table des profils.
 * Un utilisateur peut avoir plusieurs profils (soi-même, père, mère, enfant, etc.)
 */
return new class extends Migration
{
    /**
     * Créer la table profils.
     */
    public function up(): void
    {
        Schema::create('profils', function (Blueprint $table) {
            $table->id();

            // Référence vers l'utilisateur propriétaire du profil
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // Nom affiché du profil (ex: "Papa", "Maman", "Moi-même")
            $table->string('nom');

            // Relation de l'utilisateur avec ce profil
            $table->enum('relation', [
                'Lui-même',
                'Enfant',
                'Conjoint',
                'Parent',
                'Autre',
            ])->default('Lui-même');

            $table->date('date_naissance')->nullable();
            $table->string('photo')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Supprimer la table profils.
     */
    public function down(): void
    {
        Schema::dropIfExists('profils');
    }
};
