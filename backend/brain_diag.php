<?php
// Test de concurrence : si le serveur est multi-threadé, 
// deux appels à ce script devraient prendre ~1s au total.
// Sinon, ils prendront 2s.
$start = microtime(true);
sleep(1);
$end = microtime(true);
echo json_encode(['time' => $end - $start, 'pid' => getmypid()]);
