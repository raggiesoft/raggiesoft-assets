#!/usr/bin/env bash
# --- HARPER MODULE 02: AUDIO ENGINE ---

# --- THE FFMPEG WORKER FUNCTION ---
press_audio_formats() {
    local in_wav="$1"
    local f_base="$2"
    local t_title="$3"
    local t_artist="$4"
    local t_album="$5"
    local t_year="$6"
    local t_track="$7"
    local t_disc="$8"
    local t_genre="$9"

    # Radio Edit (128kbps)
    if [ ! -f "web-mp3/$f_base.mp3" ] || [ "$OVERWRITE" = true ]; then
        ffmpeg -nostdin -hide_banner -loglevel error $ffmpeg_flag -i "$in_wav" $ART_FILE_PARAM \
        -codec:a libmp3lame -b:a 128k -id3v2_version 3 -write_id3v1 1 \
        -metadata title="$t_title" -metadata artist="$t_artist" -metadata album="$t_album" \
        -metadata date="$t_year" -metadata track="$t_track" -metadata disc="$t_disc" -metadata genre="$t_genre" \
        -metadata publisher="Engine Room Records" -metadata copyright="CC BY-SA 4.0 - $t_year Michael P. Ragsdale / RaggieSoft" \
        -metadata comment="Free Stream Edition | Premium Archives: https://engineroom-records.com" \
        "web-mp3/$f_base.mp3"
    fi

    # Premium MP3 (V0)
    if [ ! -f "vault/mp3/$f_base.mp3" ] || [ "$OVERWRITE" = true ]; then
        ffmpeg -nostdin -hide_banner -loglevel error $ffmpeg_flag -i "$in_wav" $ART_FILE_PARAM \
        -codec:a libmp3lame -q:a 0 -id3v2_version 3 -write_id3v1 1 \
        -metadata title="$t_title" -metadata artist="$t_artist" -metadata album="$t_album" \
        -metadata date="$t_year" -metadata track="$t_track" -metadata disc="$t_disc" -metadata genre="$t_genre" \
        -metadata publisher="Engine Room Records" -metadata copyright="CC BY-SA 4.0 - $t_year Michael P. Ragsdale / RaggieSoft" \
        -metadata comment="Premium Archive | Licensing: https://raggiesoftmedia.com/licensing" \
        "vault/mp3/$f_base.mp3"
    fi

    # Premium OGG (Q9)
    if [ ! -f "vault/ogg/$f_base.ogg" ] || [ "$OVERWRITE" = true ]; then
        ffmpeg -nostdin -hide_banner -loglevel error $ffmpeg_flag -i "$in_wav" \
        -codec:a libvorbis -q:a 9 \
        -metadata title="$t_title" -metadata artist="$t_artist" -metadata album="$t_album" \
        -metadata date="$t_year" -metadata tracknumber="$t_track" -metadata discnumber="$t_disc" \
        -metadata publisher="Engine Room Records" -metadata copyright="CC BY-SA 4.0 - $t_year Michael P. Ragsdale / RaggieSoft" \
        -metadata comment="Premium Archive | Licensing: https://raggiesoftmedia.com/licensing" \
        "vault/ogg/$f_base.ogg"
    fi

    # Premium FLAC (Lossless)
    if [ ! -f "vault/flac/$f_base.flac" ] || [ "$OVERWRITE" = true ]; then
        ffmpeg -nostdin -hide_banner -loglevel error $ffmpeg_flag -i "$in_wav" $ART_FILE_PARAM \
        -codec:a flac -compression_level 8 \
        -metadata title="$t_title" -metadata artist="$t_artist" -metadata album="$t_album" \
        -metadata date="$t_year" -metadata track="$t_track" -metadata disc="$t_disc" -metadata genre="$t_genre" \
        -metadata publisher="Engine Room Records" -metadata copyright="CC BY-SA 4.0 - $t_year Michael P. Ragsdale / RaggieSoft" \
        -metadata comment="Premium Audiophile Archive | Licensing: https://raggiesoftmedia.com/licensing" \
        "vault/flac/$f_base.flac"
    fi
}