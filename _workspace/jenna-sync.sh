#!/bin/bash

# --- JENNA: THE DEVELOPMENT LIAISON (v6.7 - The "Public Wifi" Protocol) ---
# Usage: ./jenna-sync.sh --push "Message" [--public-wifi]
#        ./jenna-sync.sh --pull [--public-wifi]

# 1. ESTABLISH PATHS
WORKSPACE_DIR=$(cd "$(dirname "$0")" && pwd)
ASSETS_ROOT=$(cd "$WORKSPACE_DIR/.." && pwd)
HUB_ROOT=$(cd "$ASSETS_ROOT/../raggiesoft-hub" && pwd)
LOGS_DIR="$WORKSPACE_DIR/logs"

# 2. DETECT RCLONE
RCLONE_BIN=""
RCLONE_CONF="$WORKSPACE_DIR/build-tools/rclone/rclone.conf"

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    if [ -f "$WORKSPACE_DIR/build-tools/rclone/rclone.exe" ]; then
        RCLONE_BIN="$WORKSPACE_DIR/build-tools/rclone/rclone.exe"
    else
        echo "👱‍♀️ JENNA: I can't find rclone.exe! Check build-tools?"
        exit 1
    fi
else
    if command -v rclone &> /dev/null; then
        RCLONE_BIN="rclone"
    elif [ -f "$WORKSPACE_DIR/build-tools/rclone/rclone" ]; then
        RCLONE_BIN="$WORKSPACE_DIR/build-tools/rclone/rclone"
    else
        echo "👱‍♀️ JENNA: I can't find the rclone binary anywhere!"
        exit 1
    fi
fi

if [ ! -f "$RCLONE_CONF" ]; then
    echo "👱‍♀️ JENNA: Uh oh, I'm missing my credentials (rclone.conf)!"
    exit 1
fi

# 3. JENNA'S BRAIN

# --- CONFIGURATION: CONNECTION MODE ---
# We scan all arguments for the flag to avoid positional strictness
USE_PUBLIC_WIFI=false
for arg in "$@"; do
    if [ "$arg" == "--public-wifi" ]; then
        USE_PUBLIC_WIFI=true
        break
    fi
done

# Set Rclone Performance Flags based on mode
if [ "$USE_PUBLIC_WIFI" = true ]; then
    # STEALTH MODE: 
    # 1. Single stream (looks like a file download)
    # 2. Slowed down (tpslimit)
    # 3. SPOOFED USER AGENT (The Secret Weapon): Identifies as Chrome on Mac to bypass simple firewalls
    RCLONE_PERF_FLAGS="-P --transfers=1 --tpslimit=1 --timeout=60s --user-agent \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36\""
    CONNECTION_MSG="🕵️‍♀️ CAMOUFLAGE MODE: Spoofing Chrome User-Agent."
else
    # STANDARD MODE: Full speed ahead.
    RCLONE_PERF_FLAGS="-P --transfers=8"
    CONNECTION_MSG="🚀 STANDARD MODE: Maximum velocity."
fi

function show_help() {
    echo "Usage: "
    echo "  ./jenna-sync.sh --push \"Commit Message\"  (Syncs code, assets, and runs checks)"
    echo "  ./jenna-sync.sh --pull                   (Downloads everything to local)"
    echo "  ./jenna-sync.sh --audit                  (Runs the Page Orphan Audit only)"
    echo ""
    echo "Options:"
    echo "  --public-wifi    Use slower, stealthier connection settings for restrictive firewalls."
}

# --- THE QA VALIDATOR ---
function run_integrity_check() {
    echo "👱‍♀️ JENNA: QA Protocol Initiated..."
    echo "          (Scanning routes for broken links and accessibility violations...)"

    (
        cd "$WORKSPACE_DIR" && php -r "
            \$hubRoot = realpath('../../raggiesoft-hub');
            if (!\$hubRoot || !is_dir(\$hubRoot)) { exit(1); }
            \$hasErrors = false;
            \$pattern = \$hubRoot . '/data/routes/*.json';
            \$files = glob(\$pattern);
            if (empty(\$files)) { exit(1); }

            foreach(\$files as \$f) {
                \$filename = basename(\$f);
                \$data = json_decode(file_get_contents(\$f), true);
                if (json_last_error() !== JSON_ERROR_NONE) { \$hasErrors = true; continue; }

                foreach(\$data as \$route => \$config) {
                    // CHECK A: WCAG
                    if (isset(\$config['navbarBrandLogo']) && !empty(\$config['navbarBrandLogo'])) {
                        if (!isset(\$config['navbarBrandAlt']) || empty(trim(\$config['navbarBrandAlt']))) {
                            echo \"❌ WCAG FAIL: [\$filename] Route '\$route' missing Alt Text!\\n\";
                            \$hasErrors = true;
                        }
                    }
                    // CHECK B: Broken Views
                    if (isset(\$config['view'])) {
                        \$viewPath = \$hubRoot . '/' . \$config['view'] . '.php';
                        if (!file_exists(str_replace('/', DIRECTORY_SEPARATOR, \$viewPath))) {
                            echo \"❌ 404 FAIL:  [\$filename] Route '\$route' missing PHP file.\\n\";
                            \$hasErrors = true;
                        }
                    }
                }
            }
            if (\$hasErrors) { exit(1); }
            exit(0); 
        "
    )

    if [ $? -ne 0 ]; then
        echo "🛑 JENNA: INTEGRITY CHECK FAILED."
        exit 1
    else
        echo "✅ JENNA: Integrity check passed. Proceeding..."
    fi
}

# --- THE ORPHAN AUDITOR ---
function run_orphan_audit() {
    echo "👱‍♀️ JENNA: Starting Orphaned Page Audit..."
    if [ ! -d "$LOGS_DIR" ]; then mkdir -p "$LOGS_DIR"; fi
    
    TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
    PRETTY_DATE=$(date +"%Y-%m-%d %H:%M:%S")

    (
        cd "$WORKSPACE_DIR" && php -r "
            \$timestamp = \$argv[1];
            \$prettyDate = \$argv[2];
            \$hubRoot = realpath('../../raggiesoft-hub');
            \$logsDir = __DIR__ . '/logs'; 
            
            // [LOGIC CONDENSED FOR BREVITY - FULL AUDIT LOGIC REMAINS HERE]
            // ... (Same audit logic as V6.6) ...
            
             // 2. GATHER ALL DEFINED VIEWS
            \$definedViews = [];
            \$routesDir = \$hubRoot . '/data/routes';
            
            if (is_dir(\$routesDir)) {
                \$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(\$routesDir));
                foreach (\$iterator as \$file) {
                    if (\$file->isFile() && strtolower(\$file->getExtension()) === 'json') {
                        \$json = json_decode(file_get_contents(\$file->getPathname()), true);
                        if (is_array(\$json)) {
                            if (isset(\$json['common'])) {
                                \$common = \$json['common'];
                                unset(\$json['common']);
                                foreach (\$json as \$k => \$v) { \$json[\$k] = array_merge(\$common, \$v); }
                            }
                            foreach (\$json as \$route => \$config) {
                                if (isset(\$config['view'])) {
                                    \$definedViews[] = str_replace(['\\\\', '/'], '/', \$config['view']);
                                } else {
                                    \$potentialPath = 'pages' . \$route; 
                                    \$potentialPath = str_replace('//', '/', \$potentialPath);
                                    \$absCheck = \$hubRoot . '/' . \$potentialPath;
                                    if (file_exists(\$absCheck . '.php')) {
                                        \$definedViews[] = \$potentialPath;
                                    } elseif (is_dir(\$absCheck)) {
                                        if (file_exists(\$absCheck . '/overview.php')) {
                                            \$definedViews[] = \$potentialPath . '/overview';
                                        } elseif (file_exists(\$absCheck . '/home.php')) {
                                            \$definedViews[] = \$potentialPath . '/home';
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            \$definedViews = array_unique(\$definedViews);

            // 3. SCAN PAGES DIRECTORY
            \$pagesDir = \$hubRoot . '/pages';
            \$orphans = []; \$drafts = []; \$exposed = [];

            if (is_dir(\$pagesDir)) {
                \$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(\$pagesDir));
                foreach (\$iterator as \$file) {
                    if (\$file->isFile() && strtolower(\$file->getExtension()) === 'php') {
                        \$fullPath = str_replace('\\\\', '/', \$file->getPathname());
                        \$rootPath = str_replace('\\\\', '/', \$hubRoot);
                        \$relativePath = ltrim(str_replace(\$rootPath, '', \$fullPath), '/');
                        \$viewId = preg_replace('/\.php$/', '', \$relativePath);
                        
                        if (strpos(\$viewId, 'template') !== false) continue;
                        if (strpos(\$viewId, 'errors/') !== false) continue;

                        \$content = file_get_contents(\$file->getPathname());
                        \$title = '(No H1 Found)';
                        if (preg_match('/<h1[^>]*>(.*?)<\/h1>/si', \$content, \$matches)) {
                            \$title = trim(strip_tags(\$matches[1]));
                            \$title = preg_replace('/\s+/', ' ', \$title);
                        }

                        \$entry = ['dir' => dirname(\$relativePath), 'file' => basename(\$relativePath), 'title' => \$title];
                        
                        \$isLinked = in_array(\$viewId, \$definedViews);
                        \$isDraft = (stripos(\$content, 'JENNA: DRAFT') !== false);

                        if (\$isLinked && \$isDraft) { \$exposed[] = \$entry; }
                        elseif (!\$isLinked && \$isDraft) { \$drafts[] = \$entry; }
                        elseif (!\$isLinked && !\$isDraft) { \$orphans[] = \$entry; }
                    }
                }
            }

            // 4. LOGGING
            if (count(\$orphans) + count(\$drafts) + count(\$exposed) > 0) {
                \$filename = \$timestamp . '_Jenna_Audit_Report.txt';
                \$logPath = \$logsDir . '/' . \$filename;
                
                \$output = \"JENNA'S PAGE AUDIT REPORT\\nGenerated: \" . \$prettyDate . \"\\nSummary:   \" . count(\$orphans) . \" Orphans | \" . count(\$drafts) . \" Drafts | \" . count(\$exposed) . \" EXPOSED\\n\\n\";
                
                if (!empty(\$exposed)) {
                    \$output .= \"🚨 EXPOSED DRAFTS (Linked!)\\n=================\\n\";
                    foreach (\$exposed as \$e) { \$output .= \$e['file'] . \" (\" . \$e['title'] . \")\\n\"; }
                    echo \"🚨 JENNA ALERT: Found \" . count(\$exposed) . \" EXPOSED Drafts!\\n\";
                }
                if (!empty(\$drafts)) {
                    \$output .= \"\\n🚧 DETECTED DRAFTS\\n=================\\n\";
                    foreach (\$drafts as \$d) { \$output .= \$d['file'] . \" (\" . \$d['title'] . \")\\n\"; }
                }
                if (!empty(\$orphans)) {
                    \$output .= \"\\n⚠️ ORPHANED PAGES\\n=================\\n\";
                    foreach (\$orphans as \$o) { \$output .= \$o['file'] . \" (\" . \$o['title'] . \")\\n\"; }
                }
                file_put_contents(\$logPath, \$output);
                echo \"⚠️  Audit found items. Report saved to: /logs/\" . \$filename . \"\\n\";
            } else {
                echo \"✅ JENNA: Clean ship! No orphans, drafts, or exposed files.\\n\";
            }
        " -- "$TIMESTAMP" "$PRETTY_DATE"
    )
}

function do_pull() {
    echo "👱‍♀️ JENNA: On it! Bringing everything down to your machine..."
    echo "          $CONNECTION_MSG"
    
    echo "   1. Checking the Hub (Code)..."
    if [ -d "$HUB_ROOT" ]; then cd "$HUB_ROOT" && git pull origin main; fi
    
    echo "   2. Checking the Assets (Workspace)..."
    cd "$ASSETS_ROOT" && git pull origin main
    
    echo "   3. Hauling the heavy boxes (DigitalOcean Spaces)..."
    # UPDATED: Using variable flags
    "$RCLONE_BIN" sync do-spaces:assets.raggiesoft.com "$ASSETS_ROOT" \
        --config "$RCLONE_CONF" \
        --exclude "/_workspace/**" \
        --exclude "/.git/**" \
        $RCLONE_PERF_FLAGS
        
    echo "👱‍♀️ JENNA: All done! Your local files are perfectly synced."
}

function do_push() {
    COMMIT_MSG="$1"

    if [[ -z "$COMMIT_MSG" ]]; then
        echo "🛑 JENNA: MISSING COMMIT MESSAGE"
        echo "Usage: ./jenna-sync.sh --push \"Your message here\" [--public-wifi]"
        exit 1
    fi

    # 1. QA Check
    run_integrity_check

    # 2. Orphan Audit
    run_orphan_audit

    echo "👱‍♀️ JENNA: Shipping it! Message: \"$COMMIT_MSG\""
    echo "          $CONNECTION_MSG"

    # 3. HUB PUSH
    echo "   1. Packaging the Hub..."
    if [ -d "$HUB_ROOT" ]; then
        cd "$HUB_ROOT"
        git add .
        if ! git diff-index --quiet HEAD --; then
             git commit -m "$COMMIT_MSG"
             git push origin main
             echo "      ✓ Code sent to GitHub."
        else
             echo "      (Nothing new in the Hub code, skipping.)"
        fi
    fi
    
    # 4. ASSETS PUSH
    echo "   2. Packaging the Workspace..."
    cd "$ASSETS_ROOT"
    git add .
    if ! git diff-index --quiet HEAD --; then
        git commit -m "$COMMIT_MSG"
        git push origin main
        echo "      ✓ Workspace synced to GitHub."
    else
        echo "      (Assets repo looks unchanged.)"
    fi
    
    # 5. CDN SYNC
    echo "   3. Beaming heavy assets to the CDN..."
    # UPDATED: Using variable flags
    "$RCLONE_BIN" copy "$ASSETS_ROOT" do-spaces:assets.raggiesoft.com \
        --config "$RCLONE_CONF" \
        --exclude "/_workspace/**" \
        --exclude "/.git/**" \
        --exclude ".gitignore" \
        $RCLONE_PERF_FLAGS
        
    echo "👱‍♀️ JENNA: Success! Sarah will pick this up shortly."
}

# 4. EXECUTE
# We still switch on $1, but we already parsed public-wifi above.
case "$1" in
    --pull) do_pull ;;
    --push) do_push "$2" ;;
    --audit) run_orphan_audit ;;
    *) show_help ;;
esac