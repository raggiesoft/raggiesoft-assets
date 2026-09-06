#!/usr/bin/env php
<?php

// Define source and output directories
$jsonDir = realpath(__DIR__ . '/../json');
$mdDir = realpath(__DIR__ . '/../markdown');
$outputDir = __DIR__ . '/compiled';

$jsonOutputFile = $outputDir . '/compiled_world_data.json';
$mdOutputFile = $outputDir . '/compiled_world_lore.md';

// Ensure the compiled output directory exists
if (!is_dir($outputDir)) {
    if (!mkdir($outputDir, 0755, true)) {
        die("Error: Could not create output directory at $outputDir\n");
    }
}

// ==========================================
// 1. Compile JSON Data
// ==========================================
$masterData = [];
if ($jsonDir) {
    $jsonIterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($jsonDir));
    
    foreach ($jsonIterator as $file) {
        $filePath = $file->getPathname();
        
        // CATCH: Skip the compiled output directory and legacy master files to prevent array duplication
        if (strpos($filePath, $outputDir) !== false || $file->getBasename() === 'master_export.json') {
            continue;
        }

        if ($file->isFile() && strtolower($file->getExtension()) === 'json') {
            $content = file_get_contents($filePath);
            $data = json_decode($content, true);
            
            if ($data !== null) {
                // Extract the relative path
                $relativePath = str_replace('\\', '/', substr($filePath, strlen($jsonDir) + 1));
                
                // Inject the source path directly into the JSON object
                $data['_source_file'] = $relativePath;

                // Check if the file is pre-grouped (like hospitals/places)
                if (isset($data['hospitals']) || isset($data['places'])) {
                    // CATCH: Use array_replace_recursive to safely overwrite string values instead of stacking them
                    $masterData = array_replace_recursive($masterData, $data);
                } 
                // Otherwise, use the 'id' field as the master key
                else {
                    $key = isset($data['id']) ? $data['id'] : $file->getBasename('.json');
                    $masterData[$key] = $data;
                }
            } else {
                echo "Warning: Could not parse JSON in " . $file->getBasename() . "\n";
            }
        }
    }
} else {
    echo "Warning: Source JSON directory not found at ../json\n";
}

// Encode beautifully for LLM readability
$jsonOutput = json_encode($masterData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
if (file_put_contents($jsonOutputFile, $jsonOutput)) {
    echo "Success! Compiled JSON saved to: {$jsonOutputFile}\n";
} else {
    echo "Error: Could not write to JSON output file.\n";
}

// ==========================================
// 2. Compile Markdown Lore
// ==========================================
$masterMarkdown = "# Master World Context (Compiled)\n\n";

if ($mdDir) {
    $mdIterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($mdDir));
    
    foreach ($mdIterator as $file) {
        $filePath = $file->getPathname();
        
        // CATCH: Skip the compiled output directory to prevent infinite recursion
        if (strpos($filePath, $outputDir) !== false) {
            continue;
        }

        if ($file->isFile() && strtolower($file->getExtension()) === 'md') {
            $content = file_get_contents($filePath);
            
            // Extract the relative path 
            $relativePath = str_replace('\\', '/', substr($filePath, strlen($mdDir) + 1));
            
            // Add the relative folder to the file boundary header
            $masterMarkdown .= "## [FILE: " . $relativePath . "]\n\n";
            $masterMarkdown .= trim($content) . "\n\n";
            $masterMarkdown .= "---\n\n"; // Visual/token separator
        }
    }
} else {
    echo "Warning: Source Markdown directory not found at ../markdown\n";
}

if (file_put_contents($mdOutputFile, $masterMarkdown)) {
    echo "Success! Compiled Markdown saved to: {$mdOutputFile}\n";
} else {
    echo "Error: Could not write to Markdown output file.\n";
}

?>