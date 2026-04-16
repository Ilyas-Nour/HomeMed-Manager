<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class OptimizeProduction extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:optimize {--clear : Clear all cached data}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Optimize the application for production (caches everything)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if ($this->option('clear')) {
            $this->info('🚀 Clearing all caches...');
            $this->call('optimize:clear');
            $this->call('filament:optimize-clear');
            $this->info('✅ All caches cleared!');
            return;
        }

        $this->info('⚡ Optimizing HomeMed Manager for production...');

        // 1. Laravel Core Optimization
        $this->info('📦 Caching configuration and routes...');
        $this->call('optimize'); // This runs config:cache & route:cache

        // 2. Views and Events
        $this->info('🎨 Pre-compiling Blade views...');
        $this->call('view:cache');
        
        $this->info('🔔 Caching application events...');
        $this->call('event:cache');

        // 3. Filament & Icons
        $this->info('🏗️ Optimizing Filament resources and icons...');
        $this->call('filament:optimize');

        $this->newLine();
        $this->info('✨ HomeMed Manager is now boosted! Application is running at maximum speed.');
    }
}
