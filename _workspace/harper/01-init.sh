#!/usr/bin/env bash
# --- HARPER MODULE 01: INITIALIZATION ---

# --- PATH CONFIGURATION ---
SEARCH_PATH="../engine-room-records/artists"
METADATA_FILE="../engine-room-records/artists/metadata.json"
TEMP_SEARCH_INDEX="temp_search_index.jsonl" 
TEMP_CATALOG_INDEX="temp_catalog_index.jsonl" 

echo "   🎚️  Targeting Studio Archives: $SEARCH_PATH"

# Initialize Indices
> "$TEMP_SEARCH_INDEX" 
> "$TEMP_CATALOG_INDEX"

# --- ARGUMENT PARSING ---
REBUILD=false
FORCE_IGPU=false
OVERWRITE=false
METADATA_ONLY=false
ffmpeg_flag="-n"

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --rebuild|-y) 
            REBUILD=true
            OVERWRITE=true
            ffmpeg_flag="-y" 
            ;;
        --force-igpu) FORCE_IGPU=true ;;
        --metadata) METADATA_ONLY=true ;;
        *) echo "🛑 HARPER: Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

# --- PRE-FLIGHT HARDWARE CHECK (Cross-Platform) ---
IGPU_DETECTED=false
GPU_INFO=""
IGPU_SAFE_MODE=""

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    GPU_INFO=$(powershell.exe -NoProfile -Command "(Get-CimInstance Win32_VideoController).Name" 2>/dev/null | tr -d '\r')
elif command -v lspci &> /dev/null; then
    GPU_INFO=$(lspci | grep -iE 'vga|3d|display')
elif [[ "$OSTYPE" == "darwin"* ]]; then
    GPU_INFO=$(sysctl -n machdep.cpu.brand_string | tr -d '\n')
fi

# The Heuristic Regex (Works against both Windows and Linux outputs)
if echo "$GPU_INFO" | grep -qiE 'integrated|vega|renoir|cezanne|intel|uhd|iris|radeon.*graphics'; then
    IGPU_DETECTED=true
    IGPU_SAFE_MODE="-g 1 -t 32"
fi

if [ "$REBUILD" = true ] && [ "$IGPU_DETECTED" = true ] && [ "$FORCE_IGPU" = false ] && [ "$METADATA_ONLY" = false ]; then
    echo "🛑 HARPER FATAL ERROR: Integrated GPU (iGPU) Detected!"
    echo "===================================================================="
    echo "   Running a complete --rebuild on shared integrated graphics will"
    echo "   result in extremely long, multi-hour processing times."
    echo ""
    echo "   Harper is aborting to prevent an accidental system lockdown."
    echo ""
    echo "   If you genuinely wish to proceed with the iGPU, you must append:"
    echo "   --force-igpu"
    echo "===================================================================="
    exit 1
fi

if [ "$REBUILD" = true ] && [ "$IGPU_DETECTED" = true ] && [ "$FORCE_IGPU" = true ] && [ "$METADATA_ONLY" = false ]; then
    echo "⚠️  HARPER WARNING: iGPU detected, but --force-igpu is active."
    echo "   Buckle up. This is going to take a while..."
fi

# --- DYNAMIC HARDWARE DETECTION & WORKER POOL LIMITS ---
echo "   🔍 HARPER: Scanning system hardware for multi-threading..."

if [[ "$OSTYPE" == "darwin"* ]]; then
    TOTAL_CORES=$(sysctl -n hw.ncpu)
else
    TOTAL_CORES=$(nproc)
fi

echo "   🎛️  System reports $TOTAL_CORES logical CPU cores."

if (( TOTAL_CORES > 4 )); then
    MAX_JOBS=$(( TOTAL_CORES - 2 ))
else
    MAX_JOBS=2
fi

echo "   🎚️  HARPER: Concurrency limit dynamically set to $MAX_JOBS simultaneous audio jobs."

# --- LOCATE 7-ZIP BINARY ---
SEVEN_ZIP_LOCAL="$ROOT_DIR/build-tools/7zip"
USE_SEVEN_ZIP=false

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
     if [ -f "$SEVEN_ZIP_LOCAL/7za.exe" ]; then
         SEVEN_ZIP_CMD="$SEVEN_ZIP_LOCAL/7za.exe"
         USE_SEVEN_ZIP=true
     fi
else
    if command -v 7zz &> /dev/null; then
        SEVEN_ZIP_CMD="7zz"
        USE_SEVEN_ZIP=true
    elif [ -f "$SEVEN_ZIP_LOCAL/7zz" ]; then
        SEVEN_ZIP_CMD="$SEVEN_ZIP_LOCAL/7zz"
        chmod +x "$SEVEN_ZIP_CMD"
        USE_SEVEN_ZIP=true
    fi
fi

if [ "$USE_SEVEN_ZIP" = true ]; then
    echo "   ✅ HARPER: 7-Zip loaded: $SEVEN_ZIP_CMD"
else
    echo "   ⚠️  HARPER: I can't find 7-Zip! I'll skip the zip files for now."
fi

# --- LOCATE UPSCALER BINARY ---
UPSCALER_BASE="$ROOT_DIR/build-tools/realesrgan"
USE_UPSCALER=false

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    if [ -f "$UPSCALER_BASE/windows/realesrgan-ncnn-vulkan.exe" ]; then
        UPSCALER_CMD="$UPSCALER_BASE/windows/realesrgan-ncnn-vulkan.exe"
        USE_UPSCALER=true
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    if [ -f "$UPSCALER_BASE/macos/realesrgan-ncnn-vulkan" ]; then
        UPSCALER_CMD="$UPSCALER_BASE/macos/realesrgan-ncnn-vulkan"
        chmod +x "$UPSCALER_CMD"
        USE_UPSCALER=true
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if [ -f "$UPSCALER_BASE/ubuntu/realesrgan-ncnn-vulkan" ]; then
        UPSCALER_CMD="$UPSCALER_BASE/ubuntu/realesrgan-ncnn-vulkan"
        chmod +x "$UPSCALER_CMD"
        USE_UPSCALER=true
    fi
fi

if [ "$USE_UPSCALER" = true ]; then
    if [ "$IGPU_DETECTED" = true ]; then
        echo "   ⚠️  HARPER: Upscaler engaging iGPU Safe Mode (Throttled Tile Size) for $GPU_INFO"
    else
        echo "   ✅ HARPER: Upscaler loaded for GPU: $GPU_INFO"
    fi
else
    echo "   ⚠️  HARPER: Upscaler missing from $UPSCALER_BASE. Skipping art enhancement."
fi

# --- OVERWRITE & METADATA STATUS LOGS ---
if [ "$OVERWRITE" = true ]; then
    if [ "$METADATA_ONLY" = true ]; then
        echo "   ⚡ HARPER: Rebuild Metadata flag detected! Overwriting JSON & Markdown only."
    else
        echo "   ⚡ HARPER: Rebuild flag detected! Overwriting old tracks and archives."
    fi
fi

if [ ! -d "$SEARCH_PATH" ]; then
    echo "   ❌ HARPER: Whoops! Directory not found at $SEARCH_PATH"
    exit 1
fi