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
        Schema::create('rappels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medicament_id')->constrained('medicaments')->cascadeOnDelete();
            $table->enum('moment', ['matin', 'midi', 'soir', 'apres-midi', 'coucher', 'libre'])->default('libre');
            $table->time('heure');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rappels');
    }
};
