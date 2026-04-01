<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration pour la table des médicaments.
 * Chaque médicament appartient à un profil (avec cascade on delete).
 * Contient tous les champs définis dans le cahier des charges.
 */
return new class extends Migration
{
    /**
     * Créer la table medicaments.
     */
    public function up(): void
    {
        Schema::create('medicaments', function (Blueprint $table) {
            $table->id();

            // Référence vers le profil auquel appartient ce médicament
            $table->foreignId('profil_id')
                  ->constrained('profils')
                  ->cascadeOnDelete();

            // Nom commercial ou générique du médicament
            $table->string('nom');

            // Forme galénique du médicament
            $table->enum('type', [
                'comprimé',
                'sirop',
                'injection',
                'crème',
                'gouttes',
                'patch',
                'suppositoire',
                'autre',
            ]);

            // Instructions de dosage et de fréquence
            $table->text('posologie');

            // Dates du traitement
            $table->date('date_debut');
            $table->date('date_fin')->nullable();

            // Date de péremption du médicament
            $table->date('date_expiration')->nullable();

            // Quantité disponible en stock (en unités : comprimés, ml, etc.)
            $table->integer('quantite')->default(0);

            // Seuil d'alerte stock faible (optionnel, par défaut 5 unités)
            $table->integer('seuil_alerte')->default(5);

            // Notes ou instructions supplémentaires
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Supprimer la table medicaments.
     */
    public function down(): void
    {
        Schema::dropIfExists('medicaments');
    }
};
