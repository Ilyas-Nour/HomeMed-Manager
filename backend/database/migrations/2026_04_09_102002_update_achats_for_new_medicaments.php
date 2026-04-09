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
            $table->foreignId('medicament_id')->nullable()->change();
            $table->string('medicament_nom_temp')->nullable()->after('medicament_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('achats', function (Blueprint $table) {
            $table->foreignId('medicament_id')->nullable(false)->change();
            $table->dropColumn('medicament_nom_temp');
        });
    }
};
