<?php
// Scans this folder and returns the image/video files as JSON.
// Called by script.js so the About slideshow updates itself automatically —
// just drop a new file in this folder and refresh the page. Nothing else to edit.

header('Content-Type: application/json');

$dir = __DIR__;
$allowedExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm', 'mov'];
$skipFiles = ['list.php', 'slides-manifest.js'];

$files = [];
foreach (scandir($dir) as $name) {
    if ($name === '.' || $name === '..') continue;
    if (is_dir($dir . DIRECTORY_SEPARATOR . $name)) continue;
    if (strpos($name, '.') === 0) continue;           // skip hidden files
    if (in_array($name, $skipFiles, true)) continue;   // skip this script & the fallback list

    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExt, true)) continue;

    $files[] = $name;
}

natsort($files); // natural order: photo2.jpg before photo10.jpg
echo json_encode(array_values($files));
