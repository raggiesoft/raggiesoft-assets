---
title: "Suno AI Prompting: Best Practices & Guidelines"
aliases: ["Suno Best Practices", "Suno SOP"]
tags: ["reference", "music-production", "ai-generation", "suno", "the-stardust-engine"]
date: 2026-09-06
type: "documentation"
---

# How to Create Successful Suno Prompts: Our Best Practices

This document summarizes the key rules and lessons learned from our sessions creating songs for **The Stardust Engine** and other projects. It has been fully updated to reflect Suno's adaptations to new industry standards following the September 3rd changeover.

---

## Part 1: Core Content Rules

### Rule 1: Avoid Safety Filter Triggers (The "Aggression" Filter)
Suno's safety filters are very strict and will automatically fail a prompt for words that imply aggression, conflict, or harm, even in a metaphorical or innocent context (like sports).
*   **BAD:** "Beat Norfolk!", "Make them cry", "Crush the enemy"
*   **GOOD:** "Go Forgers!", "Raise our banners high", "We're here to win"
*   **Strategy:** When in doubt, rewrite lyrics to be 100% positive and focused on the "protagonist" (e.g., "Go CPI!") rather than aggressive toward the "antagonist" (e.g., "Beat VDU!").

### Rule 2: The "Producer Note" Gamble (Keep Lyrics Clean!)
The Lyrics block is for lyrics. Any non-lyrical text (e.g., `(Music swells)`, `(Guitar solo should be sad)`, `(spoken, angrily)`) is a "producer note."
*   **The Risk:** Suno's AI may try to sing these notes, get confused, or fail the generation.
*   **The Reward:** Sometimes, a simple spoken-word tag like `(Spoken)` or `(Whispered)` works and adds great character.
*   **Best Practice:** Keep the Lyrics block 99% clean. Move ALL descriptive instructions about how the music should sound into the Styles prompt.

### Rule 3: Avoid Copyright Triggers (The "Artist" Filter)
Suno's AI is extremely good at detecting and blocking prompts that infringe on copyright.
*   **NEVER** use a specific artist's name in a prompt (e.g., "sound like Phil Collins").
*   **NEVER** use a specific, copyrighted song title or unique lyric (e.g., "I Still Haven't Found What I'm Looking For").
*   **Strategy:** Use genre and instrumentation to get the sound you want.
    *   *BAD:* "A Phil Collins-style drum fill."
    *   *GOOD:* "A massive, pounding, 80s gated reverb snare drum."
    *   *BAD:* "Sound like The Cars."
    *   *GOOD:* "A bright, 80s synth-rock song with a catchy keyboard riff and a clean drum machine beat."

### Rule 4: Guide the AI's Pronunciation (The Phonetic Trick)
The AI is a "blank slate" and will often mispronounce local names, acronyms, or ambiguous words. You must "walk" it through the pronunciation by spelling words phonetically.
*   **CPI:** "See-Pea-Eye"
*   **Staunton:** "Stan-ten"
*   **CP87A:** "Cee Pea eighty seven ay"

---

## Part 2: Technical & Style Prompt Rules

### Rule 5: Use a "Clean" Styles Prompt
Suno treats every prompt as new. It has no memory of previous songs.
*   **BAD:** "Make this one sound like 'Clerical Error' but heavier."
*   **GOOD:** "Cinematic Piano Ballad, heavy industrial rock, musical battle..."
*   **Strategy:** Every Styles prompt must be 100% self-contained and include all the necessary instructions.

### Rule 6: The "Clash" vs. "Harmony" Problem (For Duets)
By default, Suno will try to make two singers sound "good" together (harmony). If you want a conflict (like our "Meltdown" song), you must be explicit.
*   **Strategy:** Use keywords like "Musical Battle," "Clash," "NOT a harmonious duet," and "Conflicting styles" in the Styles prompt.

### Rule 7: The Duet Protocol (Embrace the AI's Routing)
While earlier tests suggested avoiding duets and character tags entirely, recent updates to Suno have improved its ability to recognize structural tags in the lyrics prompt.
*   **The Style Trigger:** You MUST explicitly state `male and female duet` in the Styles prompt to activate both vocal models.
*   **Lyric Tagging (New Capability):** Suno is now reasonably adept at recognizing `[Male]` and `[Female]` tags within the lyrics prompt. You can use these structural markers to suggest the vocal split.
*   **No Narrative Character Names:** Never use narrative character names (e.g., `[John sings]`, `[Jane takes over]`). The AI has no concept of character identity.
*   **The Caveat:** You are still rolling the dice. Suno is highly opinionated and ultimately makes the final determination on which voice sings which line, occasionally ignoring your tags to blend or harmonize.
*   **Strategy:** Guide the arrangement with `[Male]` and `[Female]` tags, but remain flexible and let the AI organically trade off lines when it overrides your structure. 

### Rule 8: Set Weirdness to 0% for Specific Prompts
"Weirdness" tells the AI to be "wild and unpredictable." For our complex, narrative-driven songs, we want the opposite.
*   **Strategy:** Set Weirdness to 0% to force the AI to follow our detailed Styles prompt as literally as possible. We only increase this if we want a "sick" or "chaotic" sound (like for "99.8 (The Fever)").

### Rule 9: How to Use "Extend Song" Correctly
Suno's "Extend Song" feature is powerful but has a specific rule.
*   You CANNOT extend from the very end of a song. The AI needs musical context to continue.
*   **Best Practice:** Find a clean, stable point 5-10 seconds before the song ends (e.g., during the last sustained chord or final drum beat). Place the cursor there and click "Extend." This gives the AI enough data to build a logical continuation.

### Rule 10: Two Renders is a Feature, Not a Bug
Suno always generates two different versions (renders) of each prompt.
*   **Strategy:** This is a creative opportunity. Listen to both. One might be more "rock" and one more "pop." You can choose the one that fits the album best, or use the "Alternate Mix" idea (like U2) and keep both for a "deluxe edition."

### Rule 11: Budgeting & Workflow
*   Your Suno Premium account gives you 10,000 credits per month (which regenerate) and the option to purchase more at any time.
*   A single song generation (which gives two renders) costs approximately 10 credits.
*   **Strategy:** This budget is massive (approx. 500-1,000 prompts/month). We can iterate, experiment, and re-generate prompts freely without worrying about "wasting" credits.

### Rule 12: The Styles Prompt 1,000-Character Limit
Suno has a hard limit of 1,000 characters for the Styles prompt.
*   **Strategy:** This is our most valuable real estate. We must be concise and "keyword-heavy." Use phrases and tags (e.g., "Massive 80s Arena Pop, Live Stadium Concert, Tour Finale, Pep Band, thundering stadium drums") rather than long, conversational sentences.

### Rule 13: The Lyrics Prompt 5,000-Character Limit
Suno has a very generous 5,000-character limit for the Lyrics prompt.
*   **Strategy:** This confirms we have more than enough space for epic, "prog-rock" style songs with multiple parts (like our "Crucible Suite"). We do not need to worry about lyric length.

### Rule 14: The "Cover Song" Workflow for Live Tracks
This is the most reliable way to create a "live" version of a studio track.
*   **Step 1:** Generate the "studio" version of a song (e.g., "Electric Color").
*   **Step 2:** Use the "Cover" function in Suno.
*   **Step 3:** Feed it the original lyrics (or a modified "live" version) and a new Styles prompt (e.g., "Live Stadium Concert, HUGE crowd noise, thundering stadium drums, cathartic").
*   **Result:** The AI will use the original song's melody as a strong "seed," resulting in a much more authentic live re-interpretation.

### Rule 15: Use "Get Stems / MIDI" (The Producer's Tool)
This is a Premium feature and a complete game-changer for our "Leitmotif" workflow.
*   **Get Stems:** You can download isolated audio tracks (e.g., `piano.wav`, `vocals.wav`) from a generated song. This is the best way to "sample" a piano theme for use in a DAW.
*   **Get MIDI:** You can download a `.mid` file. Drag this into your DAW to get a 100% accurate sheet music transcription of the notes Suno played. This is perfect for analysis, re-orchestration, or learning the part.

### Rule 16: The "Audio Influence" Setting (For Covers)
When using the "Cover" function, you have two sliders:
*   **Audio Influence (0-100%):** How much to copy the original song's audio.
*   **Style Influence (0-100%):** How much to obey your new Styles prompt.
*   **Strategy:** To create a new version (like our "Live Finale"), set Audio Influence low (e.g., 25%) and Style Influence high (e.g., 100%). This tells the AI: "Be inspired by the original melody, but your main priority is to obey my new, complex Styles prompt."

### Rule 17: Download Limits and Quota Management
Following the September 3rd changeover, Suno has implemented strict download restrictions .
*   **The Monthly Limit:** The Premier plan is allocated 60 song downloads per month . This limit is entirely separate from generating new renders, which only consumes credits . 
*   **Redownloads & Stems:** One song counts as one download . Redownloading the same track, even in a different format or as separate stem files, does *not* consume additional downloads from your quota . Failed or interrupted downloads also do not count .
*   **Overage:** If you exceed the 60-download limit, Suno provides the option to purchase additional downloads .
*   **Strategy:** Treat your download quota as a curated export step for tracks destined for release or further production. Keep experimental and alternate renders in your Suno library, as streaming and sharing remain unlimited and do not consume downloads .