#!/usr/bin/env php
<?php
// ==============================================================================
// SHILOH: LORE & DATA COMPILER
// ==============================================================================
// ARCHITECTURAL OVERVIEW:
// This CLI tool crawls decentralized `json/` and `markdown/` directories, 
// aggregating atomic world-building entities (characters, places, hospitals) 
// into unified master `compiled_world_data.json` and `compiled_world_lore.md` 
// files. These master files are heavily utilized by LLM agents for context 
// awareness during generation.
//
// FUTURE MAINTENANCE NOTES:
// - Uses `array_replace_recursive` to merge files containing specific root keys 
//   ('hospitals', 'places') to avoid destructive overwrites of adjacent data.
// - It actively skips traversing the `compiled/` directory itself to prevent 
//   infinite recursion loops and data duplication.
// - Markdown files are appended sequentially and delimited with standard `---` tags.
// ==============================================================================

// Define source and output directories based on the script's physical location
$jsonDir = realpath(__DIR__ . '/../json');
$mdDir = realpath(__DIR__ . '/../markdown');
$outputDir = __DIR__ . '/compiled';

$jsonOutputFile = $outputDir . '/compiled_world_data.json';
$mdOutputFile = $outputDir . '/compiled_world_lore.md';

// Ensure the compiled output directory exists, attempting to create it recursively if not
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
    // Recursively iterate through the entire JSON file tree
    $jsonIterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($jsonDir));
    
    foreach ($jsonIterator as $file) {
        $filePath = $file->getPathname();
        
        // CATCH: Skip the compiled output directory and legacy master files to prevent array duplication
        if (strpos($filePath, $outputDir) !== false || $file->getBasename() === 'master_export.json') {
            continue;
        }

        // Process only valid JSON files
        if ($file->isFile() && strtolower($file->getExtension()) === 'json') {
            $content = file_get_contents($filePath);
            $data = json_decode($content, true);
            
            if ($data !== null) {
                // Extract the relative path mapping for debugging/traceability
                $relativePath = str_replace('\\', '/', substr($filePath, strlen($jsonDir) + 1));
                
                // Inject the source path directly into the JSON object
                $data['_source_file'] = $relativePath;

                // Handle structural variations in JSON files
                // Check if the file is pre-grouped (like hospitals/places) which expect nested merging
                if (isset($data['hospitals']) || isset($data['places'])) {
                    // CATCH: Use array_replace_recursive to safely overwrite string values instead of stacking them
                    // This allows overriding specific attributes of a place in a sub-file
                    $masterData = array_replace_recursive($masterData, $data);
                } 
                // Otherwise, use the 'id' field as the master key mapping, fallback to basename
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

// Encode beautifully for LLM readability, maintaining standard slash formatting
$jsonOutput = json_encode($masterData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
if (file_put_contents($jsonOutputFile, $jsonOutput)) {
    echo "Success! Compiled JSON saved to: {$jsonOutputFile}\n";
} else {
    echo "Error: Could not write to JSON output file.\n";
}

// ==========================================
// 2. Compile Markdown Lore
// ==========================================
// Initialize master string with a top-level context header
$masterMarkdown = "# Master World Context (Compiled)\n\n";

if ($mdDir) {
    // Recursively iterate through the entire Markdown file tree
    $mdIterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($mdDir));
    
    foreach ($mdIterator as $file) {
        $filePath = $file->getPathname();
        
        // CATCH: Skip the compiled output directory to prevent infinite recursion
        // since the output directory sits sibling to /markdown/ in some edge-case setups
        if (strpos($filePath, $outputDir) !== false) {
            continue;
        }

        // Process only standard markdown files
        if ($file->isFile() && strtolower($file->getExtension()) === 'md') {
            $content = file_get_contents($filePath);
            
            // Extract the relative path to maintain physical origin context for LLMs
            $relativePath = str_replace('\\', '/', substr($filePath, strlen($mdDir) + 1));
            
            // Add the relative folder to the file boundary header
            $masterMarkdown .= "## [FILE: " . $relativePath . "]\n\n";
            // Append file contents exactly as written, trimmed for cleanliness
            $masterMarkdown .= trim($content) . "\n\n";
            $masterMarkdown .= "---\n\n"; // Visual/token separator block for LLM chunking recognition
        }
    }
} else {
    echo "Warning: Source Markdown directory not found at ../markdown\n";
}

// Write the concatenated string buffer to disk
if (file_put_contents($mdOutputFile, $masterMarkdown)) {
    echo "Success! Compiled Markdown saved to: {$mdOutputFile}\n";
} else {
    echo "Error: Could not write to Markdown output file.\n";
}

?>