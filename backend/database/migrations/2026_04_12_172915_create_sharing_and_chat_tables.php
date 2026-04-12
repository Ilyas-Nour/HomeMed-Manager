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
        // 1. Mise à jour de la table médicaments pour autoriser le partage
        Schema::table('medicaments', function (Blueprint $table) {
            $table->boolean('is_public')->default(false)->after('notes');
            $table->index(['is_public']); // Index simple pour filtrage rapide
        });

        // 2. Table des demandes de médicaments
        Schema::create('medicament_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requester_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('medicament_id')->constrained('medicaments')->onDelete('cascade');
            $table->foreignId('groupe_id')->constrained('groupes')->onDelete('cascade');
            
            $table->enum('status', ['pending', 'accepted', 'rejected', 'completed'])->default('pending');
            $table->text('notes')->nullable();
            
            $table->timestamps();

            // Index pour la scalabilité (Dashboard utilisateur)
            $table->index(['owner_id', 'status']);
            $table->index(['requester_id', 'status']);
            $table->index('groupe_id');
        });

        // 3. Table des messages de chat (Scallabilité : liée à la requête)
        Schema::create('sharing_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained('medicament_requests')->onDelete('cascade');
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->text('content');
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            // Index composite pour performance chat (historique par requête)
            $table->index(['request_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sharing_messages');
        Schema::dropIfExists('medicament_requests');
        Schema::table('medicaments', function (Blueprint $table) {
            $table->dropColumn('is_public');
        });
    }
};
