<?php
require __DIR__.'/vendor/autoload.php';
$start = microtime(true);
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
echo "Laravel boot time: " . (microtime(true) - $start) . "s\n";
