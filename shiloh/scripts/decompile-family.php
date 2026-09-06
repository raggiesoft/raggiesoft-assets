#!/usr/bin/env php
<?php

// Define the source directory for the lumps and the output directories for the decompiled files
$compiledDir = __DIR__ . '/compiled';
$jsonInputFile = $compiledDir . '/compiled_world_data.json';
$mdInputFile = $compiledDir . '/compiled_world_lore.md';

$outputJsonDir = realpath(__DIR__ . '/../json') ?: __DIR__ . '/../json';
$outputMdDir = realpath(__DIR__ . '/../markdown') ?: __DIR__ . '/../markdown';

// Helper function to safely recreate nested subdirectories
function ensureDir($filePath) {
    $dir = dirname($filePath);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}

// ==========================================
// 1. Decompile JSON Data
// ==========================================
if (file_exists($jsonInputFile)) {
    echo "Decompiling JSON data...\n";
    $jsonContent = file_get_contents($jsonInputFile);
    $masterData = json_decode($jsonContent, true);

    if ($masterData) {
        $pendingGroupedData = [];

        foreach ($masterData as $key => $value) {
            // SCENARIO A: Handle grouped data (like 'places/hospitals.json') where the _source_file is a loose root key
            if ($key === '_source_file') {
                $fullPath = $outputJsonDir . '/' . $value;
                ensureDir($fullPath);
                
                // Write the buffered group data and reset the array
                file_put_contents($fullPath, json_encode($pendingGroupedData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
                $pendingGroupedData = []; 
                continue;
            }

            // SCENARIO B: Handle individual records (like characters) that contain their own injected _source_file
            if (is_array($value) && isset($value['_source_file'])) {
                $sourceFile = $value['_source_file'];
                unset($value['_source_file']); // Strip the injected path to return to original state

                $fullPath = $outputJsonDir . '/' . $sourceFile;
                ensureDir($fullPath);
                file_put_contents($fullPath, json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
            } else {
                // Buffer any grouped root keys until we hit the next loose '_source_file' string
                $pendingGroupedData[$key] = $value;
            }
        }
    } else {
        echo "Warning: Could not parse compiled JSON file.\n";
    }
} else {
    echo "Warning: Compiled JSON not found at {$jsonInputFile}\n";
}

// ==========================================
// 2. Decompile Markdown Lore
// ==========================================
if (file_exists($mdInputFile)) {
    echo "Decompiling Markdown lore...\n";
    $mdContent = file_get_contents($mdInputFile);
    
    // Explode by the exact boundary header to safely bypass any internal Frontmatter '---'
    $blocks = explode('## [FILE: ', $mdContent);
    
    // Discard the initial "# Master World Context" header
    array_shift($blocks); 

    foreach ($blocks as $block) {
        $bracketPos = strpos($block, ']');
        if ($bracketPos !== false) {
            // Extract the path and the raw file content
            $relativePath = trim(substr($block, 0, $bracketPos));
            $content = substr($block, $bracketPos + 1);

            // Strip the visual token separator ("---") added by the compiler at the end of each file chunk
            $content = rtrim($content);
            if (substr($content, -3) === '---') {
                $content = rtrim(substr($content, 0, -3));
            }
            
            $fullPath = $outputMdDir . '/' . $relativePath;
            ensureDir($fullPath);
            
            // Re-save with a clean trailing newline
            file_put_contents($fullPath, trim($content) . "\n");
        }
    }
} else {
    echo "Warning: Compiled Markdown not found at {$mdInputFile}\n";
}

echo "Decompilation complete!\n";
?>