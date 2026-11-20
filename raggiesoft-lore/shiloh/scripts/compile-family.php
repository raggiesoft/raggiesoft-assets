#!/usr/bin/env php
<?php
/**
 * ============================================================================
 * READ-ALONG TEACHING OVERVIEW: compile-family.php (Shiloh Lore & Data Compiler)
 * ============================================================================
 * WHAT THIS FILE IS:
 *   A command-line PHP build script that walks through dozens of small,
 *   individual world-building files inside Shiloh's `json/` and `markdown/`
 *   folders and bundles them into two single "master context" files that AI
 *   writing assistants and lore tools can read all at once.
 *   (Its exact reverse companion script is `decompile-family.php`.)
 *
 * HOW IT IS RUN:
 *   Executed from the terminal via:
 *     `php compile-family.php`   or   `./compile-family.php`
 *   Note Line 1 (`#!/usr/bin/env php`): This Unix "shebang" line MUST stay on
 *   Line 1 so macOS/Linux knows to launch the `php` interpreter when run directly.
 *
 * WHAT INPUTS IT CONSUMES:
 *   1. `../json/<category>/<entity>.json`: Atomic JSON files describing characters, places,
 *      hospitals, and lore entities inside `raggiesoft-lore/shiloh/json/`.
 *   2. `../markdown/<category>/<note>.md`: Atomic Markdown lore notes inside
 *      `raggiesoft-lore/shiloh/markdown/`.
 *
 * WHAT COMPILED OUTPUT IT PRODUCES:
 *   1. `./compiled/compiled_world_data.json`: A single pretty-printed JSON map
 *      where every entity carries a `"_source_file"` breadcrumb recording its
 *      original relative file path (so `decompile-family.php` can unpack it later).
 *   2. `./compiled/compiled_world_lore.md`: A single concatenated Markdown
 *      document with `## [FILE: relative/path.md]` headers and `---` dividers.
 *
 * 100-LEVEL PHP CLI CONCEPTS TAUGHT IN THIS FILE:
 *   - `__DIR__` & `realpath()`: Resolving paths relative to the script's own
 *     folder regardless of what directory your terminal is currently `cd`'d into.
 *   - `RecursiveDirectoryIterator` + `RecursiveIteratorIterator`: How PHP's
 *     Standard PHP Library (SPL) crawls nested subfolders of any depth.
 *   - `json_decode($str, true)` & `json_encode(...)`: Converting JSON text into
 *     PHP associative arrays and serializing it back cleanly.
 *   - `array_replace_recursive()`: Merging nested group dictionaries (`hospitals`,
 *     `places`) without turning scalar strings into duplicate arrays.
 * ============================================================================
 */

/* STEP 1: RESOLVE SOURCE & DESTINATION PATHS
 * `__DIR__` is a PHP magic constant holding the exact folder where THIS script
 * lives (`.../raggiesoft-lore/shiloh/scripts`).
 * `realpath()` resolves `../json` into a clean canonical path, or returns `false`
 * if that directory does not exist on disk. */
$jsonDir = realpath(__DIR__ . '/../json');
$mdDir = realpath(__DIR__ . '/../markdown');
$outputDir = __DIR__ . '/compiled';

$jsonOutputFile = $outputDir . '/compiled_world_data.json';
$mdOutputFile = $outputDir . '/compiled_world_lore.md';

/* Ensure `./compiled/` exists before we try writing files into it.
 * `0755` sets standard directory permissions (owner read/write/execute, others read/execute),
 * and the `true` 3rd argument tells `mkdir()` to create parent directories recursively if needed. */
if (!is_dir($outputDir)) {
    if (!mkdir($outputDir, 0755, true)) {
        die("Error: Could not create output directory at $outputDir\n");
    }
}

/* ============================================================================
 * STEP 2: CRAWL & COMPILE ALL JSON WORLD-BUILDING FILES (`../json/`)
 * ============================================================================ */
$masterData = [];
if ($jsonDir) {
    /* Why are TWO iterator classes wrapped together here?
     * - `new RecursiveDirectoryIterator($jsonDir)` knows how to open folders
     *   and see that a subfolder has children, creating a tree structure.
     * - `new RecursiveIteratorIterator(...)` flattens that tree so a single
     *   simple `foreach ($jsonIterator as $file)` visits every nested file
     *   in every subfolder automatically! Each `$file` is an `SplFileInfo` object. */
    $jsonIterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($jsonDir));
    
    foreach ($jsonIterator as $file) {
        $filePath = $file->getPathname();
        
        /* SAFETY GUARD: Skip anything inside `$outputDir` (`compiled/`) or legacy
         * `master_export.json` so we never accidentally compile our own output
         * file back into itself! */
        if (strpos($filePath, $outputDir) !== false || $file->getBasename() === 'master_export.json') {
            continue;
        }

        /* `RecursiveDirectoryIterator` also yields `.` and `..` directory entries,
         * so we check `$file->isFile()` and verify a `.json` file extension. */
        if ($file->isFile() && strtolower($file->getExtension()) === 'json') {
            $content = file_get_contents($filePath);
            /* Passing `true` as the 2nd argument to `json_decode()` returns a PHP
             * associative array (`['id' => ...]`) instead of a `stdClass` object.
             * If the file contains invalid JSON syntax, `json_decode` returns `null`. */
            $data = json_decode($content, true);
            
            if ($data !== null) {
                /* Compute the file's path relative to `$jsonDir` (e.g. `characters/shiloh.json`),
                 * normalizing Windows backslashes `\` to forward slashes `/` so compiled output
                 * is identical on macOS, Linux, and Windows. */
                $relativePath = str_replace('\\', '/', substr($filePath, strlen($jsonDir) + 1));
                
                /* Stamp `_source_file` into the record so LLMs know which file defined it
                 * AND `decompile-family.php` knows the exact path to restore it to! */
                $data['_source_file'] = $relativePath;

                /* MERGE STRATEGY A: Grouped collection files (`hospitals`, `places`).
                 * Why `array_replace_recursive` instead of `array_merge_recursive`?
                 * In PHP, if two files both define `['places' => ['park' => ['name' => 'Oak']]]`,
                 * `array_merge_recursive` turns `'name'` into an array of two strings!
                 * `array_replace_recursive` cleanly updates scalar keys in place while
                 * still merging sibling nested keys recursively. */
                if (isset($data['hospitals']) || isset($data['places'])) {
                    $masterData = array_replace_recursive($masterData, $data);
                } 
                /* MERGE STRATEGY B: Single-entity files (e.g., an individual character card).
                 * Store under its explicit `"id"` field if present, or fall back to the
                 * filename without `.json` (`$file->getBasename('.json')`). */
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

/* Serialize `$masterData` back to JSON text:
 * - `JSON_PRETTY_PRINT`: Indents nested objects with newlines & spaces for easy reading and Git diffs.
 * - `JSON_UNESCAPED_SLASHES`: Writes `"characters/shiloh.json"` instead of `"characters\/shiloh.json"`. */
$jsonOutput = json_encode($masterData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
if (file_put_contents($jsonOutputFile, $jsonOutput)) {
    echo "Success! Compiled JSON saved to: {$jsonOutputFile}\n";
} else {
    echo "Error: Could not write to JSON output file.\n";
}

/* ============================================================================
 * STEP 3: CRAWL & CONCATENATE ALL MARKDOWN LORE FILES (`../markdown/`)
 * ============================================================================ */
/* Start our single combined Markdown document with a clear H1 title. */
$masterMarkdown = "# Master World Context (Compiled)\n\n";

if ($mdDir) {
    /* Walk `../markdown/` and all of its subdirectories using the same SPL iterator pair. */
    $mdIterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($mdDir));
    
    foreach ($mdIterator as $file) {
        $filePath = $file->getPathname();
        
        /* Skip `$outputDir` so compiled outputs can never feed into themselves. */
        if (strpos($filePath, $outputDir) !== false) {
            continue;
        }

        /* Only include real `.md` files. */
        if ($file->isFile() && strtolower($file->getExtension()) === 'md') {
            $content = file_get_contents($filePath);
            
            /* Compute normalized relative path (e.g., `locations/meridian-general.md`). */
            $relativePath = str_replace('\\', '/', substr($filePath, strlen($mdDir) + 1));
            
            /* Write an exact machine-parseable boundary header `## [FILE: <path>]`.
             * `decompile-family.php` looks for this exact `## [FILE: ` marker to split
             * the master file back into individual `.md` files! */
            $masterMarkdown .= "## [FILE: " . $relativePath . "]\n\n";
            /* Append the trimmed Markdown prose followed by a `---` section divider. */
            $masterMarkdown .= trim($content) . "\n\n";
            $masterMarkdown .= "---\n\n";
        }
    }
} else {
    echo "Warning: Source Markdown directory not found at ../markdown\n";
}

/* Write the finished Markdown bundle to `./compiled/compiled_world_lore.md`. */
if (file_put_contents($mdOutputFile, $masterMarkdown)) {
    echo "Success! Compiled Markdown saved to: {$mdOutputFile}\n";
} else {
    echo "Error: Could not write to Markdown output file.\n";
}

?>
