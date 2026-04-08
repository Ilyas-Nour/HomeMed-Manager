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
            $table->enum('statut', ['pending', 'completed'])->default('pending')->after('medicament_id');
            $table->string('pharmacie')->nullable()->change();
            $table->decimal('prix', 8, 2)->nullable()->change();
            $table->date('date_achat')->nullable()->change();
            $table->string('label')->nullable()->after('statut'); // Added label for "Urgent", "Stock", etc.
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('achats', function (Blueprint $table) {
            $table->dropColumn(['statut', 'label']);
            $table->string('pharmacie')->nullable(false)->change();
            $table->decimal('prix', 8, 2)->nullable(false)->change();
            $table->date('date_achat')->nullable(false)->change();
        });
    }
};
