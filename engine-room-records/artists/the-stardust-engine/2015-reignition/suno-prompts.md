# The Stardust Engine — *Reignition* (2015) Complete Suno Production & Lore Sheet

* **Artist:** The Stardust Engine
* **Album:** *Reignition* (`2015-reignition` • `temporalCoverage: "2015-10-16"`)
* **Genre:** 1980s AOR / Melodic Stadium Rock / 80s Cosmic Synth-Pop
* **Raw Master WAV Destination Directory:**
  `/Users/michael/Library/CloudStorage/OneDrive-raggiesoft.com/raggiesoft-servers/raggiesoft-vaults/engine-room-records/artists/the-stardust-engine/master-wav/studio/`
* **CRITICAL PRODUCTION ORDER:**
  ***Reignition* (2015) is the final studio prerequisite before completing 2016's *Live at the Crucible*** so that its comeback anthems can be included in the 2-hour career-spanning main set of *Live at the Crucible* (via the **74% Cover Audio Influence** workflow).

---

## I. Canonical Lore & `llms-suno-usage.txt` Ground Rules for *Reignition* (2015)

1. **Ending the 2005–2014 Burnout Hiatus:**
   - Between 2001 and 2004, the band recorded four full studio albums (*Midnight Drivers*, *Moon 1: Sanctuary [Zero-G]*, *Moon 2: Mile Marker 98*, and *Progress Street*) and toured relentlessly through 2004 (*Live in Norfolk*), leaving all five family members exhausted.
   - At the end of 2004's *Progress Street*, Track 11 ([*"Last Bus Home: Lights Out on Progress Street"*](https://music.raggiesoft.com/artists/the-stardust-engine/2004-progress-street?track=1-11-last-bus-home-lights-out-on-progress-street)) signed off for a decade of healing, promising fans that once they had rested and recharged, they would turn the studio switches back on.
   - After ten years of rest (punctuated only by 2007's archival *Lost Sounds*, 2008's quiet acoustic *Our Own Frequency*, and Cassidy's 2011 silver-anniversary studio project *Starfield Calibration*), the family is completely recharged and returns to full-throttle 1980s studio rock.
2. **The August–October 2015 Context (The Delaware Migration & CPI's 52–0 Norfolk Reckoning):**
   - In August 2015, younger sister and CEO **Holly O'Connell** passed the Delaware Bar and executed **The Delaware Migration**—folding *Engine Room Records, LLC*, *Artists First Management, LLC*, *Stardust Properties, LLC*, and *Pacific Rim Properties, LLC* into anonymous Delaware entities beneath **The O'Connell Family Revocable Trust** ($2.4B+ AUM).
   - That same autumn (October 2015), **Commonwealth Polytechnic Institute (CPI)** Football traveled to Norfolk and delivered a triumphant **52–0 shutout victory** against **Virginia Dominion University (VDU)** on VDU's own Homecoming, avenging the 2014 `38–0` loss.
3. **Strict `llms-suno-usage.txt` Compliance Across All 11 Prompts:**
   - **Rule 1 (Aggression Filter):** All lyrics and style prompts are 100% positive and protagonist-focused (e.g., `"Go Forgers!"`, `"Raise our banners high for See-Pea-Eye!"`).
   - **Rule 2 (Producer Notes):** Musical cues inside the Suno Lyrics box use parenthetical producer notes `(like this)`.
   - **Rule 4 (Phonetic Pronunciation):** `CPI` is spelled phonetically as `See-Pea-Eye` and `Reignition` is spelled phonetically as `Ree-ignition` strictly inside the Suno Lyrics box below so Suno's tokenizer does not mispronounce `Reig-` as `reg-nition` (while `lyrics/*.md` uses clean `CPI` and `Reignition`).
   - **Rule 5 & Rule 18 (100% Self-Contained Prompts + Exclude Styles):** Every track's Style, Exclude Styles, and Lyrics prompt is 100% self-contained with zero references to previous songs' audio chords or external tracks.
   - **Rule 7 (Suno v6 Duet Protocol):** For duets, leave **Vocal Gender** unselected in the Suno UI, include `male and female duet` in the Style prompt, and use `[male]` and `[female]` before lines in the Lyrics box (never `[male and female duet]` or character names in the Lyrics box).

---

## II. Complete 11-Track Suno Prompts (`llms-suno-usage.txt` Compliant)

### Track 01 — `Reignition: Lights Up on Progress Street`
* **Target Filename:** `reignition-lights-up-on-progress-street.wav` (in `master-wav/studio/`)
* **Suno UI Settings:** `Vocal Gender: Unselected` (Duet) • `Weirdness: 0%` • `Style Influence: 90%`
* **Style of Music Prompt ($\le 1,000$ chars):**
```text
1980s AOR anthem, melodic stadium rock, male and female duet, soaring high tenor male vocal, powerhouse alto female vocal, warm acoustic piano intro building into a bright 1980s polyphonic analog synthesizer brass fanfare, driving eighth-note electric bassline, massive pounding 80s gated reverb snare drum, crisp overdriven rhythm electric guitar, 132 BPM, D Major, triumphant comeback opener, soaring twin guitar and synthesizer solo
```
* **Exclude Styles:**
```text
modern pop, hip hop, rap, country, acoustic folk, lo-fi, edm, techno, heavy metal screaming, sluggish, dragging, muffled
```
* **Suno Lyrics Box (Phonetic `Ree-ignition` Included):**
```text
[Intro]
(Warm, solitary acoustic piano chords in D Major)
(A bright, triumphant 1980s analog synthesizer brass fanfare erupts)
(Massive, pounding 80s gated reverb snare drum roll and driving eighth-note bassline kick in)

[Spoken Word Intro]
[female]
Good morning, Forger Nation.
[male]
The switches are back on! Let's go!

[Verse 1]
[male]
Ten years of quiet down a mountain lane
Watching the seasons wash the windowpane
We hung the guitars on the living room wall
Let the silence heal us down the narrow hall

[female]
We kept the promise that we made that night
Turned down the dimmers on the blinding light
No broken pieces, no fading away
We were just resting for a brand new day!

[Pre-Chorus]
[male]
Feel the transformers hum beneath the floor!
[female]
Hear the twin rhythm knocking at the door!
[male]
Every tube is glowing cherry red!
(vocal harmonies swell)
And every word we left unsaid is waking up ahead!

[Chorus]
(full 1980s arena rock band)
This is Ree-ignition! Throw the master switch!
Climbing out of the quiet to the highest pitch!
Lights up on Progress Street, the fire's burning bright
Splitting through the shadow of a ten-year night!
From the basement breakers to the stadium sky
The Stardust Engine never said goodbye!
This is Ree-ignition! Hear the thrusters roar!
We're lighting up the valley like we did before!

[Verse 2]
[female]
My Juno keys are warm beneath my hands
Ready for the stages in a hundred lands
[male]
Locked my wheels in place beside the microphone
Never had to roll a single mile alone
[female]
Evan on the bassline, Tyler on the snare
[male]
Holly in the corner with a fortress to spare!
Five hearts beating on the very same floor
Opening the locks upon the studio door!

[Pre-Chorus]
[female]
Feel the transformers hum beneath the floor!
[male]
Hear the twin rhythm knocking at the door!
[female]
Every tube is glowing cherry red!
(vocal harmonies swell)
And every dream we ever led is wide awake ahead!

[Chorus]
This is Ree-ignition! Throw the master switch!
Climbing out of the quiet to the highest pitch!
Lights up on Progress Street, the fire's burning bright
Splitting through the shadow of a ten-year night!
From the basement breakers to the stadium sky
The Stardust Engine never said goodbye!
This is Ree-ignition! Hear the thrusters roar!
We're lighting up the valley like we did before!

[Bridge]
(music drops to a pulsing analog synth pad and steady kick drum)
[female]
We didn't burn out, we just took our time
[male]
Saved every spark for the second climb
[female]
Now the meters are pinning in the crimson zone!
[male]
Blacksburg, Virginia—your band is home!

[Guitar Solo]
(A soaring, melodic 1980s electric guitar solo trading triumphant phrases with a bright polyphonic analog synthesizer lead)

[Final Chorus]
(music swells to maximum stadium energy)
This is Ree-ignition! Throw the master switch!
Climbing out of the quiet to the highest pitch!
Lights up on Progress Street, the fire's burning bright
Splitting through the shadow of a ten-year night!
From the basement breakers to the stadium sky
The Stardust Engine never said goodbye!
This is Ree-ignition! Hear the thrusters roar!
We're lighting up the valley forevermore!

[Outro]
(soaring twin guitar and synth harmony over pounding gated drums)
[female]
Lights up on Progress Street!
[male]
The fire is back!
(final sustained D-Major stadium power chord and gong crash)
```

---

### Track 02 — `Main Engine Start`
* **Target Filename:** `main-engine-start.wav` (in `master-wav/studio/`)
* **Suno UI Settings:** `Vocal Gender: Male` • `Weirdness: 0%` • `Style Influence: 90%`
* **Style of Music Prompt ($\le 1,000$ chars):**
```text
1980s arena rock, high-energy AOR stadium rocker, solo high tenor male lead vocal with gang chorus harmonies, spoken countdown intro, chugging palm-muted electric guitar riff, sweeping 80s analog synthesizer arpeggios, driving bass guitar, massive pounding 80s gated reverb drums, 142 BPM, E Minor, exhilarating, cosmic launch energy, screaming melodic guitar solo
```
* **Exclude Styles:**
```text
female vocals, modern pop, hip hop, rap, country, acoustic ballad, lo-fi, edm, death metal screaming, sluggish, slow
```
* **Suno Lyrics Box:**
```text
[Intro]
(Sweeping 1980s analog synthesizer arpeggios panning across the stereo field)

[Spoken Word Intro]
(spoken clearly with steady authority)
Guidance is internal.
T-minus ten... nine... eight...
Seven... six...
Main Engine Start!
Four... three... two... one...
Zero! Liftoff!

[Instrumental Hook]
(An explosive 142 BPM palm-muted electric guitar riff and massive 80s gated reverb drums kick in)

[Verse 1]
White-hot steam billowing across the pad
Every ounce of horsepower we ever had
Three million pounds of thrust beneath the floor
Shaking every bolt upon the hangar door!
We spent a decade anchored to the ground
Waiting for the moment when the clock came round
Now the gantry pulls away into the night
And we're riding on a column of electric light!

[Pre-Chorus]
Feel the G-force pressing on your chest!
Put the titanium airframe to the test!
Roll program! Pitch into the sky!
Watch the blue horizon of the earth go by!

[Chorus]
(full arena rock band and soaring gang harmonies)
Main Engine Start! Feel the boosters burn!
Past the point of hesitation, past no return!
Through the maroon clouds and the orange flame
Climbing to the heavens where we wrote our name!
Punching through the atmosphere with all our heart
Hold on to the throttle—it's Main Engine Start!

[Verse 2]
Thirty miles up and the sky turns black
Nothing in the universe can hold us back
Solid rocket separation, clean and true
Look out the window at the endless view!
We built this vessel out of heart and steel
Two twin brothers and a brother on wheels
A sister on the keys and a sister at the helm
Crossing the border to a higher realm!

[Pre-Chorus]
Feel the G-force pressing on your chest!
Put the titanium airframe to the test!
Max-Q cleared! Throttle up to full!
Breaking every tether of the gravity pull!

[Chorus]
Main Engine Start! Feel the boosters burn!
Past the point of hesitation, past no return!
Through the maroon clouds and the orange flame
Climbing to the heavens where we wrote our name!
Punching through the atmosphere with all our heart
Hold on to the throttle—it's Main Engine Start!

[Bridge]
(half-time heavy arena groove with soaring synthesizer brass)
They thought the countdown ended years ago
Thought the cold dark winter froze the afterglow
But an engine built for orbit never forgets the stars
Reaching for the heavens where the cosmos are!

[Guitar Solo]
(A soaring, virtuosic 1980s two-hand tapping electric guitar solo over galloping bass and rapid-fire drums)

[Final Chorus]
(music swells)
Main Engine Start! Feel the boosters burn!
Past the point of hesitation, past no return!
Through the maroon clouds and the orange flame
Climbing to the heavens where we wrote our name!
Punching through the atmosphere with all our heart
Hold on to the throttle—it's Main Engine Start!

[Outro]
Main Engine Start!
All thrusters at one hundred and four percent!
We are in orbit!
(blazing guitar harmonic and gated drum crescendo)
```

---

### Track 03 — `The Iceberg: Submerged`
* **Target Filename:** `the-iceberg-submerged.wav` (in `master-wav/studio/`)
* **Suno UI Settings:** `Vocal Gender: Female` • `Weirdness: 0%` • `Style Influence: 90%`
* **Style of Music Prompt ($\le 1,000$ chars):**
```text
1980s melodic synth-rock, New Wave AOR, solo powerhouse alto female lead vocal, punchy sequenced analog synthesizer bassline, shimmering 80s polyphonic synth hooks, rhythmic clean-to-overdriven electric guitar, crisp 80s gated reverb snare drum, 126 BPM, F# Minor, sleek, confident, untouchable, soaring guitar and synth duel
```
* **Exclude Styles:**
```text
male vocals, modern pop, hip hop, rap, country, acoustic folk, lo-fi, heavy metal screaming, sluggish, muffled
```
* **Suno Lyrics Box:**
```text
[Intro]
(A sleek, pulsing 1980s sequenced analog synthesizer bassline)
(Shimmering polyphonic synth hooks and crisp 80s gated reverb snare kick in)

[Verse 1]
Up on the surface it's a quiet street
Five pairs of boots and a steady beat
Just a small-town band from the mountain air
No flashy limousines anywhere
The suited strangers with their legal pads
Looking for the fortune that the lottery had
They search the registries from coast to coast
Chasing after shadows and a paper ghost!

[Pre-Chorus]
They only see the tip above the ocean wave
They don't know the sanctuary our sister gave
Deep beneath the surface where the waters gleam
Safe inside the quiet of a vaulted dream!

[Chorus]
(soaring 1980s synth-rock chorus)
Like an iceberg—nine-tenths underneath the sea!
Submerged in the deep where the world can't see!
On paper we're just five kids from a mountain town
While the fortress underneath can never be torn down!
You can't buy the master and you can't find the key
The Iceberg is submerged and the family is free!

[Verse 2]
Started with a notebook and a crimson pen
Sixteen years old with a steady plan
She crossed out the traps in the fine-print line
And built a shelter that would outlast time
Now the autumn wind blows across the bay
And the whole foundation is tucked away
From the western coast to the Blue Ridge crest
Held inside the harbor of the family chest!

[Pre-Chorus]
They only see the tip above the ocean wave
They don't know the sanctuary our sister gave
No public shareholders, no board of greed
Just the five of us and everything we'll ever need!

[Chorus]
Like an iceberg—nine-tenths underneath the sea!
Submerged in the deep where the world can't see!
On paper we're just five kids from a mountain town
While the fortress underneath can never be torn down!
You can't buy the master and you can't find the key
The Iceberg is submerged and the family is free!

[Bridge]
(deep atmospheric analog synth pad and melodic bass)
Let the tabloids guess, let the bankers pry
There's nothing on the radar underneath this sky
We play for the kids in the bleachers tonight
Because the foundation is watertight!

[Guitar Solo]
(A sleek, melodic 1980s electric guitar solo trading rapid arpeggios with a bright analog synthesizer lead)

[Final Chorus]
(music swells)
Like an iceberg—nine-tenths underneath the sea!
Submerged in the deep where the world can't see!
On paper we're just five kids from a mountain town
While the fortress underneath can never be torn down!
You can't buy the master and you can't find the key
The Iceberg is submerged and the family is free!

[Outro]
Submerged and untouchable.
Thank you, Holly.
(crisp analog synth chord and gated snare hit)
```

---

### Track 04 — `Orbital Return`
* **Target Filename:** `orbital-return.wav` (in `master-wav/studio/`)
* **Suno UI Settings:** `Vocal Gender: Female` • `Weirdness: 0%` • `Style Influence: 90%`
* **Style of Music Prompt ($\le 1,000$ chars):**
```text
1980s cosmic synth-pop, melodic AOR, solo powerhouse alto female lead vocal, lush sweeping 80s analog polyphonic synthesizer pads, sparkling arpeggiated synth sequencer, melodic fretless-style electric bass, booming 80s gated reverb drums, soaring emotional electric guitar solo, 118 BPM, A Major, weightless, euphoric, celestial
```
* **Exclude Styles:**
```text
male vocals, heavy distortion, thrash metal, hip hop, rap, country, acoustic folk, lo-fi, harsh, abrasive
```
* **Suno Lyrics Box:**
```text
[Intro]
(Lush, sweeping 1980s analog polyphonic synthesizer pads)
(Sparkling arpeggiated synth sequencer and booming 80s gated reverb drums enter)

[Verse 1]
Drifting in the silence on the lunar side
Where the radio waves have nowhere left to hide
Watching all the constellations wheeling slow
Three hundred thousand miles from the world below
Sometimes you need the vacuum and the velvet dark
To recalibrate the compass and protect the spark
Floating in the zero-G of our own design
Waiting for the telemetry to realign

[Pre-Chorus]
Then the horizon curves into the golden light
Earthrise breaking through the endless night
A familiar frequency begins to hum
Telling every instrument the time has come!

[Chorus]
(lush cosmic synth-pop chorus swells)
This is our Orbital Return!
Feel the retro-rockets softly burn!
Coming around from the quiet side of the moon
Locking on the signal of a hometown tune!
Weightless in the starlight, steady on the line
Every single trajectory is yours and mine!
From the deepest cosmos to the atmosphere
This is our Orbital Return—and we are here!

[Verse 2]
Stardust in the capacitors, gold in the wire
Harmonic velocity and liquid fire
My brother's guitar singing through the solar wind
Picking up the melody where we began
Twin moons rising in a tidal lock
Steady as the pulse of an atomic clock
No longer hiding in the shadow cone
We're banking toward the beacon that brings us home!

[Pre-Chorus]
See the Blue Ridge glowing on the radar screen
The prettiest landing strip we've ever seen
Every frequency begins to hum
Telling Forger Nation that the time has come!

[Chorus]
This is our Orbital Return!
Feel the retro-rockets softly burn!
Coming around from the quiet side of the moon
Locking on the signal of a hometown tune!
Weightless in the starlight, steady on the line
Every single trajectory is yours and mine!
From the deepest cosmos to the atmosphere
This is our Orbital Return—and we are here!

[Bridge]
(zero-gravity breakdown with shimmering bell synths and chorus guitar arpeggios)
Every orbit takes you far away
Only so it can bring you back someday
Stronger in the gravity, clearer in the sight
Wrapped inside a halo of electric light!

[Guitar Solo]
(A soaring, weightless, deeply melodic 1980s electric guitar solo floating over cascading analog synthesizer waves)

[Final Chorus]
(music swells with lush vocal harmonies)
This is our Orbital Return!
Feel the retro-rockets softly burn!
Coming around from the quiet side of the moon
Locking on the signal of a hometown tune!
Weightless in the starlight, steady on the line
Every single trajectory is yours and mine!
From the deepest cosmos to the atmosphere
This is our Orbital Return—and we are here!

[Outro]
(cascading analog synthesizer arpeggios fade gently)
Telemetry locked. Welcome home.
```

---

### Track 05 — `Ten Years in the Quiet`
* **Target Filename:** `ten-years-in-the-quiet.wav` (in `master-wav/studio/`)
* **Suno UI Settings:** `Vocal Gender: Unselected` (Duet) • `Weirdness: 0%` • `Style Influence: 90%`
* **Style of Music Prompt ($\le 1,000$ chars):**
```text
1980s AOR power ballad, male and female duet, high tenor male vocal, warm alto female vocal, acoustic piano and clean chorused electric guitar arpeggios, lush 80s analog synth strings, massive 80s gated reverb snare drum entrance, melodic bassline, 84 BPM, G Major, reflective, healing, emotional stadium crescendo, soaring guitar solo
```
* **Exclude Styles:**
```text
fast tempo, thrash metal, hip hop, rap, edm, techno, modern pop, auto-tune, lo-fi, harsh screaming
```
* **Suno Lyrics Box:**
```text
[Intro]
(Gentle acoustic piano and clean chorused electric guitar arpeggios)
(Warm 1980s analog synthesizer strings swell softly underneath)

[Verse 1]
[male]
Two thousand and four under a concrete dome
Four albums in the rearview on the highway home
My hands were shaking on the steering rim
And the stage lights felt a little too bright and dim

[female]
Every room was spinning at a hundred degrees
Too many voices asking us to please
So we walked off the stage and we closed the door
And left the suitcases on the hallway floor

[Pre-Chorus]
[male]
The world asked where we went and why we walked away
[female]
When we were at the summit of the game we play
(vocal harmonies blend)
Because a trophy doesn't matter if you lose your soul
So we chose each other just to keep us whole

[Chorus]
Ten years in the quiet, ten years in the shade
Best decision that this family ever made
Morning coffee on the Progress Street porch
Passing down the warmth instead of burning out the torch
No cameras in the kitchen, no schedules to keep
Just ten years in the quiet where the roots grow deep
And now we know the secret that the road can't teach:
Sometimes stepping back is how you keep the stars in reach

[Verse 2]
[female]
Sunday dinners at a wooden table for five
Learning what it feels like just to be alive
Walking through the autumn leaves without a crowd
Where the morning melody was gentle and proud

[male]
Evan fixing bicycles out in the drive
Tyler laughing til the neighbors knew we were alive
Holly with her law books and her steady grace
Keeping peace and quiet in our favorite place

[Pre-Chorus]
(A massive 1980s gated reverb drum fill enters)
[female]
They said if you step off the train you'll fade to gray
[male]
But love doesn't rust when you put it away!
(full band swells)
Now the batteries are full and the spirit is clear
And we're ready for the music that brought us here!

[Chorus]
(full 1980s arena power ballad)
Ten years in the quiet, ten years in the shade
Best decision that this family ever made
Morning coffee on the Progress Street porch
Passing down the warmth instead of burning out the torch
No cameras in the kitchen, no schedules to keep
Just ten years in the quiet where the roots grow deep
And now we know the secret that the road can't teach:
Sometimes stepping back is how you keep the stars in reach!

[Guitar Solo]
(A deeply emotional, soaring 1980s power ballad electric guitar solo over lush analog synth strings)

[Bridge]
(music softens to acoustic piano and vocals only)
[female]
If your heart is running on a worn-out wire
[male]
You don't owe the world your very last fire
(drums and guitars swell back in)
Turn the switches off until the storm has passed
That's how you build a love that's gonna last!

[Final Chorus]
(soaring stadium crescendo)
Ten years in the quiet, ten years in the shade
Best decision that this family ever made!
Morning coffee on the Progress Street porch
Passing down the warmth instead of burning out the torch!
And now we know the secret that the road can't teach:
Stepping back together kept the stars in reach!

[Outro]
(gentle acoustic piano and clean electric guitar fade out)
[female]
Ten years stronger.
[male]
Ready when you are, sis.
```

---

### Track 06 — `Fifty-Two to Nothing: The Norfolk Reckoning`
* **Target Filename:** `fifty-two-to-nothing-the-norfolk-reckoning.wav` (in `master-wav/studio/`)
* **Suno UI Settings:** `Vocal Gender: Unselected` (Duet) • `Weirdness: 0%` • `Style Influence: 90%`
* **Style of Music Prompt ($\le 1,000$ chars):**
```text
1980s stadium rock stomper, high-energy AOR arena anthem, male and female duet, roaring stadium gang vocals, thunderous marching drumline snare cadence with massive 80s gated reverb, driving overdriven electric guitar riff, triumphant 80s synthesizer brass stabs, 138 BPM, C Minor, triumphant, victorious, high-octane, blazing twin guitar and synth solo
```
* **Exclude Styles:**
```text
slow ballad, acoustic folk, modern pop, hip hop, rap, country, lo-fi, edm, sluggish, quiet
```
* **Suno Lyrics Box (Phonetic `See-Pea-Eye` Included):**
```text
[Intro]
(Thunderous marching drumline snare cadence with massive 1980s gated reverb)
(Triumphant 1980s analog synthesizer brass fanfare)
(Driving overdriven stadium electric guitar riff kicks in)

[Verse 1]
[male]
Three hundred sixty-five days with the numbers on the wall
Stenciled on the mirrors down the weight-room hall
We kept our focus steady through the winter rain
Working every morning til we broke the chain

[female]
Then we rolled down to the harbor for the autumn crown
Saw the old numbers printed all across the town
Banners in the tidewater, music in the street
Listen to the iron marching down the concrete!

[Pre-Chorus]
[male]
No holding back today! Keep the starters on the grass!
[female]
Every single quarter is a masterclass!
(stadium gang vocals join)
From the opening kickoff to the final cheer
Hear the anvils ringing loud and clear!

[Chorus]
(full stadium rock band and roaring gang chorus)
Fifty-two to nothing! Put it on the board!
Hear the mighty thunder of the Forger chord!
You wore the old numbers on your Homecoming chest
Till the mountains came down and put the talk to rest!
Maroon and burnt orange underneath the autumn sky
Raise our banners high for See-Pea-Eye!
Fifty-two to nothing! Hear the stadium call
Forger Nation stands above it all!

[Verse 2]
[female]
Fourth quarter ticking and the defense holds the line
Protecting every inch of the goal-line design
[male]
Maroon and burnt orange in the coastal breeze
Every single play is a masterpiece!
From Blacksburg to the harbor, hear the victory song
This is where the heart of the mountains belongs!

[Pre-Chorus]
[female]
No holding back today! Keep the starters on the grass!
[male]
Every single quarter is a masterclass!
(stadium gang vocals join)
From the opening kickoff to the final cheer
Hear the anvils ringing loud and clear!

[Chorus]
Fifty-two to nothing! Put it on the board!
Hear the mighty thunder of the Forger chord!
You wore the old numbers on your Homecoming chest
Till the mountains came down and put the talk to rest!
Maroon and burnt orange underneath the autumn sky
Raise our banners high for See-Pea-Eye!
Fifty-two to nothing! Hear the stadium call
Forger Nation stands above it all!

[Bridge]
(marching drumline breakdown and stomping stadium rhythm)
Hold that line! Strike that iron!
Hold that line! Strike that iron!
[male]
From the weight-room mirror to the scoreboard sky—
All hail See-Pea-Eye!

[Guitar Solo]
(A blazing 1980s twin electric guitar and analog synthesizer duel over pounding double-kick drums)

[Final Chorus]
(maximum stadium energy)
Fifty-two to nothing! Put it on the board!
Hear the mighty thunder of the Forger chord!
You wore the old numbers on your Homecoming chest
Till the mountains came down and put the talk to rest!
Fifty-two to nothing! Hear the stadium call
Forger Nation stands above it all!

[Outro]
Fifty-two to nothing!
Go Forgers!
(ringing anvil chime and sustained C-Minor stadium power chord)
```

---

### Track 07 — `Twin Frequency: The Rhythm Section`
* **Target Filename:** `twin-frequency-the-rhythm-section.wav` (in `master-wav/studio/`)
* **Suno UI Settings:** `Vocal Gender: Male` • `Weirdness: 0%` • `Style Influence: 90%`
* **Style of Music Prompt ($\le 1,000$ chars):**
```text
1980s groove-driven arena rock, upbeat melodic AOR, solo high tenor male lead vocal with gang backing shouts, virtuosic syncopated electric bass groove, thunderous 1980s drum fills with octobans and massive gated reverb snare, punchy 80s synth brass hits, rhythmic electric guitar, 130 BPM, A Minor, infectious groove, dual bass and drum breakdown
```
* **Exclude Styles:**
```text
female lead vocals, slow ballad, acoustic folk, modern pop, hip hop, rap, country, lo-fi, buried bass, weak drums
```
* **Suno Lyrics Box:**
```text
[Intro]
(An explosive 1980s octoban drum roll slams into a funky, syncopated electric bass groove)
(Punchy 80s synth brass stabs and rhythmic electric guitar join the pocket)

[Verse 1]
Born on the very same morning in the Blue Ridge air
Finishing each other's sentences before they're even there
Nineteen eighty-five when they walked into the room
Four strings and a kick drum making the basement boom!
Never needed click tracks, never needed cues
Locked into a pocket that could never lose
One brother on the low end, one behind the kit
Every single measure is a dead-center hit!

[Pre-Chorus]
Look across the stage—they don't even have to speak!
Locked in!
Forty-five-foot Sainte-Claire rolling through the mountain peak!
Twin power!
When the road gets rough and the night gets long
They're the iron chassis underneath every song!

[Chorus]
(upbeat arena rock chorus with gang vocals)
Twin Frequency! Hear the rhythm section roar!
Shaking every rafter from the ceiling to the floor!
Bassline and the backbeat in a telepathic lock
Steady as the gears inside an iron clock!
Two brothers, one heartbeat, driving through the night
Holding up the engine with all their might!
Turn up the low end—it's Twin Frequency!

[Verse 2]
Trading off the highway shifts at three A.M.
Airbrakes and the diesel humming under them
Keeping us protected while the singers sleep
Making every promise that a brother can keep
Then the house lights drop and they take the riser stand
Tightest rhythm section anywhere we stand!

[Pre-Chorus]
Look across the stage—they don't even have to speak!
Locked in!
Two identical grins at the rhythm's peak!
Twin power!
When the stadium shakes and the bleachers sway
Listen to the brothers play!

[Chorus]
Twin Frequency! Hear the rhythm section roar!
Shaking every rafter from the ceiling to the floor!
Bassline and the backbeat in a telepathic lock
Steady as the gears inside an iron clock!
Two brothers, one heartbeat, driving through the night
Holding up the engine with all their might!
Turn up the low end—it's Twin Frequency!

[Bridge]
(spoken enthusiastically)
Take it away, Evan and Tyler!
(A virtuosic 1980s slap electric bass solo trading thunderous octoban and double-kick drum fills)

[Guitar Solo]
(A blazing melodic 1980s electric guitar solo riding over the syncopated bass and drum groove)

[Final Chorus]
Twin Frequency! Hear the rhythm section roar!
Shaking every rafter from the ceiling to the floor!
Bassline and the backbeat in a telepathic lock
Steady as the gears inside an iron clock!
Two brothers, one heartbeat, driving through the night
Turn up the low end—it's Twin Frequency!

[Outro]
The heartbeat of the Engine!
(unison bass and drum hit)
```

---

### Track 08 — `Neon on the Huckleberry Trail`
* **Target Filename:** `neon-on-the-huckleberry-trail.wav` (in `master-wav/studio/`)
* **Suno UI Settings:** `Vocal Gender: Female` • `Weirdness: 0%` • `Style Influence: 90%`
* **Style of Music Prompt ($\le 1,000$ chars):**
```text
1980s dream-pop AOR, nostalgic melodic synth-rock, solo powerhouse alto female lead vocal, shimmering 1980s chorus electric guitar, warm analog polyphonic synthesizer arpeggios, driving eighth-note bassline, crisp 80s gated reverb drums, 124 BPM, E Major, autumnal, uplifting, breezy, melodic guitar solo
```
* **Exclude Styles:**
```text
male lead vocals, heavy metal distortion, screaming, hip hop, rap, country, edm, lo-fi, dark, aggressive
```
* **Suno Lyrics Box:**
```text
[Intro]
(Shimmering 1980s chorused electric guitar arpeggios)
(Warm polyphonic analog synthesizer bells and crisp 80s gated reverb drums enter)

[Verse 1]
October five-thirty and the air turns crisp
Woodsmoke curling in a silver wisp
Maples turning crimson by the old rail bed
Canopy of burnt orange overhead
You're pushing on your hand-rims at an easy pace
With the mountain wind cooling off your face
Six miles of asphalt from the library lawn
Where the old Huckleberry train used to roll on

[Pre-Chorus]
No studio clocks and no city stress
Just the valley dressed in its autumn dress
Watch the sun dip low behind Price Mountain's crest
In the quiet corner that we love the best!

[Chorus]
(uplifting 1980s melodic synth-rock chorus)
Chasing the neon on the Huckleberry Trail!
Where the twilight glows and the shadows sail!
Spinning our wheels through the golden leaves
Underneath a sky that still believes!
See the stadium towers flicker on in the night
Painting the valley in electric light!
Every autumn evening tells the same old tale
We're home together on the Huckleberry Trail!

[Verse 2]
Passing by the pastures where the cattle graze
Wrapped inside the amber of the college days
Students in their hoodies jogging two by two
Nodding with a smile as we roll on through
No autographs asked, just a neighbor's wave
In the mountain sanctuary that our hometown gave
Thirty years of music and we still belong
To the winding path where we wrote this song!

[Pre-Chorus]
No studio clocks and no city stress
Just the valley dressed in its autumn dress
Watch the stars come out above the mountain's crest
In the quiet corner that we love the best!

[Chorus]
Chasing the neon on the Huckleberry Trail!
Where the twilight glows and the shadows sail!
Spinning our wheels through the golden leaves
Underneath a sky that still believes!
See the stadium towers flicker on in the night
Painting the valley in electric light!
Every autumn evening tells the same old tale
We're home together on the Huckleberry Trail!

[Bridge]
(warm analog synth pad and melodic bassline)
We've seen Tokyo towers and the London rain
Paris boulevards and the coastal train
But nothing on earth ever feels as sweet
As the six-mile path leading back to Progress Street!

[Guitar Solo]
(An uplifting, breezy 1980s melodic electric guitar solo harmonizing with shimmering analog synth bells)

[Final Chorus]
(music swells with bright vocal harmonies)
Chasing the neon on the Huckleberry Trail!
Where the twilight glows and the shadows sail!
Spinning our wheels through the golden leaves
Underneath a sky that still believes!
See the stadium towers flicker on in the night
Painting the valley in electric light!
Every autumn evening tells the same old tale
We're home together on the Huckleberry Trail!

[Outro]
(shimmering chorus guitar arpeggios fade gently)
Race you back to Progress Street.
```

---

### Track 09 — `No Strings on the Master`
* **Target Filename:** `no-strings-on-the-master.wav` (in `master-wav/studio/`)
* **Suno UI Settings:** `Vocal Gender: Male` • `Weirdness: 0%` • `Style Influence: 90%`
* **Style of Music Prompt ($\le 1,000$ chars):**
```text
1980s hard melodic rock, fast AOR guitar anthem, solo high tenor male lead vocal, blistering overdriven 80s electric guitar riff, driving analog organ and synthesizer stabs, galloping electric bass, rapid-fire 80s gated reverb drums, 146 BPM, D Minor, confident, triumphant, virtuosic two-hand tapping guitar solo
```
* **Exclude Styles:**
```text
female lead vocals, slow ballad, acoustic folk, modern pop, hip hop, rap, country, lo-fi, edm, sluggish
```
* **Suno Lyrics Box:**
```text
[Intro]
(A blistering 146 BPM overdriven 1980s electric guitar riff)
(Driving analog organ and galloping rhythm section kick in)

[Verse 1]
Back in eighty-seven in a glass-walled tower
Men in tailored suits intoxicated by their power
Pointed at my sister, called her "Stardust" on a chart
Pointed at my wheelchair, called me "Engine" for the part!
Turned our love of rockets and the galaxies above
Into a cheap slogan that we never could love
Tried to put a price tag on a family name
Tried to lock the songbirds in a corporate frame!

[Pre-Chorus]
They didn't know a sixteen-year-old girl with a pen
Had already outsmarted all the king's horses and men!
And when ninety-six hit like a lightning bolt from the sky
We bought the whole building and we waved goodbye!

[Chorus]
(driving 1980s hard AOR anthem)
There are no strings on the master! No chains on the tape!
No boardroom committee dictating the shape!
Every single note is in the family vault
Protected by the iron and the mountain basalt!
We play what we want and we answer to none
Underneath the fire of our own twin sun!
Spinning every reel a little bit faster—
There are no strings on the master!

[Verse 2]
They said a band can't vanish for a ten-year rest
Without a label leaning on your weary chest
They said the catalog would go up on the block
To pay the quarterly dividends around the clock!
Well look inside the ledger—there's a zero owed!
We own the studio, the bus, and the road!
Not a single penny to a middleman's hand
Just five kids running our own promised land!

[Pre-Chorus]
They didn't know a sixteen-year-old girl with a pen
Had already outsmarted all the king's horses and men!
From eighty-six forward til the stars burn cold
Not a single master will ever be sold!

[Chorus]
There are no strings on the master! No chains on the tape!
No boardroom committee dictating the shape!
Every single note is in the family vault
Protected by the iron and the mountain basalt!
We play what we want and we answer to none
Underneath the fire of our own twin sun!
Spinning every reel a little bit faster—
There are no strings on the master!

[Bridge]
(half-time heavy guitar riff with soaring synth brass)
Stardust is the cosmos!
Engine is the rocket ship!
Not a marketing gimmick on a salesman's lip!
And every magnetic reel spinning on the shelf
Belongs to the family that built it itself!

[Guitar Solo]
(A virtuosic 1980s hard rock two-hand tapping electric guitar solo)

[Final Chorus]
(music swells)
There are no strings on the master! No chains on the tape!
No boardroom committee dictating the shape!
Every single note is in the family vault
Protected by the iron and the mountain basalt!
Spinning every reel a little bit faster—
There are no strings on the master!

[Outro]
One hundred percent owned!
Engine Room Records!
(ringing D-Minor power chord)
```

---

### Track 10 — `Still Your Safe Person`
* **Target Filename:** `still-your-safe-person.wav` (in `master-wav/studio/`)
* **Suno UI Settings:** `Vocal Gender: Unselected` (Duet) • `Weirdness: 0%` • `Style Influence: 90%`
* **Style of Music Prompt ($\le 1,000$ chars):**
```text
1980s arena power ballad, male and female duet, high tenor male vocal, emotive alto female vocal, warm acoustic grand piano intro, weeping clean electric guitar leads, lush 1980s analog synthesizer strings, massive booming 80s gated reverb drum fill entrance, 78 BPM, C Major, deeply comforting, unconditional love, soaring emotional guitar solo
```
* **Exclude Styles:**
```text
fast tempo, thrash metal, hip hop, rap, edm, techno, modern pop, auto-tune, lo-fi, harsh screaming, aggressive
```
* **Suno Lyrics Box:**
```text
[Intro]
(Warm, intimate acoustic grand piano intro)
(A weeping, clean melodic electric guitar counter-melody enters gently)

[Verse 1]
[female]
When the fluorescent lights are humming way too loud
And you're spinning in the middle of a noisy crowd
When the rules don't match the script inside your head
And every single wire is flashing crimson red

[male]
You don't have to explain why your hands are shaking now
You don't have to force a smile or take a final bow
Just reach across the console, I'm right beside your chair
Breathing in the cadence of the quiet mountain air

[Pre-Chorus]
[female]
We've known each other since the nursery floor
[male]
And I know what the heavy wooden door is for
(vocal harmonies blend)
No questions asked, no judgment in this room
Just a harbor in the middle of the sonic boom

[Chorus]
(Lush 1980s analog synth strings and booming gated reverb drums enter)
When the static hits a hundred and the room begins to spin
I am still your safe person—let the quiet in!
Put your headphones on or lean against my shoulder tight
I will hold the perimeter throughout the longest night!
You don't have to be unbroken just to be enough
I will be the anchor when the ocean gets too rough
Through every single storm and every place we've been
I am still your safe person—let the quiet in!

[Verse 2]
[male]
Back when the winter changed the road beneath my seat
And I had to learn a brand new way to move down Progress Street
You never looked at me with pity in your eyes
You just lowered every keyboard stand to match my size

[female]
And when the tour arenas made my senses overflow
You pulled the curtain closed and told the crowd we had to go
Because a brother and a sister don't leave anyone behind
When the world is overwhelming to a tender mind!

[Pre-Chorus]
[male]
And to every single kid out in the bleachers tonight
[female]
Who feels a little different in the stadium light
(music swells)
Take this song and keep it in your coat pocket deep
For the nights when the mountain feels a little too steep!

[Chorus]
(full monumental 1980s arena power ballad)
When the static hits a hundred and the room begins to spin
I am still your safe person—let the quiet in!
Put your headphones on or lean against my shoulder tight
I will hold the perimeter throughout the longest night!
You don't have to be unbroken just to be enough
I will be the anchor when the ocean gets too rough
Through every single storm and every place we've been
I am still your safe person—let the quiet in!

[Guitar Solo]
(A monumental, weeping 1980s arena power ballad electric guitar solo soaring over grand piano and lush synth strings)

[Bridge]
(music softens to acoustic grand piano and vocals only)
[female]
Breathe in for four...
[male]
Hold it steady now...
[female]
Let the noise fall away...
(vocal harmonies swell)
You are safe right here today!

[Final Chorus]
(soaring choir harmonies and full band crescendo)
When the static hits a hundred and the room begins to spin
I am still your safe person—let the quiet in!
You don't have to be unbroken just to be enough
I will be the anchor when the ocean gets too rough
Through every single storm and every place we've been
I am still your safe person—let the quiet in!

[Outro]
(acoustic grand piano and clean electric guitar resolve on a warm C-Major chord)
[female]
I've got you. Always.
```

---

### Track 11 — `Where the Stars Still Burn`
* **Target Filename:** `where-the-stars-still-burn.wav` (in `master-wav/studio/`)
* **Suno UI Settings:** `Vocal Gender: Unselected` (Duet) • `Weirdness: 0%` • `Style Influence: 90%`
* **Style of Music Prompt ($\le 1,000$ chars):**
```text
1980s AOR stadium finale, cosmic melodic rock anthem, male and female duet, soaring high tenor male vocal, powerhouse alto female vocal, lush 1980s polyphonic analog synthesizer fanfare, shimmering arpeggiated keyboards, twin harmonizing electric guitars, driving bassline, massive pounding 80s gated reverb drums, 134 BPM, G Major, uplifting, timeless, horizon-bound studio album closer, epic twin guitar and synth solo
```
* **Exclude Styles:**
```text
modern pop, hip hop, rap, country, acoustic folk, lo-fi, edm, techno, heavy metal screaming, sluggish, dark
```
* **Suno Lyrics Box:**
```text
[Intro]
(Lush, sweeping 1980s polyphonic analog synthesizer fanfare and shimmering arpeggiated keyboards)
(Twin harmonizing electric guitars and massive 80s gated reverb drums kick in)

[Verse 1]
[male]
Standing on the ridgeline where the mountain meets the sky
Watching thirty autumn seasons go rolling by
We started with a four-track and a borrowed set of keys
Chasing down a signal through the Appalachian trees

[female]
The maps have all been folded and the highways changed their names
We stepped out of the spotlight and we walked away from games
But look up at Orion hanging steady in the blue
The very same horizon is still waiting here for you!

[Pre-Chorus]
[male]
Time can weather iron, time can silver-streak the hair
[female]
But it cannot touch a melody that's built to share!
(vocal harmonies swell)
Open up the throttle, let the final chapter start
With a compass in the dashboard and a rocket in our heart!

[Chorus]
(full 1980s cosmic stadium rock anthem)
Out where the stars still burn! Across the open night!
Every mile ahead of us is bathed in golden light!
We took the long road home, we weathered every turn
And found the fire waiting out where the stars still burn!
Five hearts on the frequency, steady and true
The universe is wider than the one we knew!
Keep the engines running til the morning sun returns—
Meet us on the horizon where the stars still burn!

[Verse 2]
[female]
No regrets behind us in the valley down below
Every quiet winter only helped the timber grow
[male]
Four wheels on the pavement and four strings on the bass
Ten drumsticks in the quiver and a smile on every face!
[female]
We don't play for yesterday or monuments of stone
[male]
We play because this music is the truest home we've known!

[Pre-Chorus]
[female]
Time can weather iron, time can silver-streak the hair
[male]
But it cannot touch a melody that's built to share!
(vocal harmonies swell)
Open up the throttle, let the next adventure start
With a compass in the dashboard and a rocket in our heart!

[Chorus]
Out where the stars still burn! Across the open night!
Every mile ahead of us is bathed in golden light!
We took the long road home, we weathered every turn
And found the fire waiting out where the stars still burn!
Five hearts on the frequency, steady and true
The universe is wider than the one we knew!
Keep the engines running til the morning sun returns—
Meet us on the horizon where the stars still burn!

[Bridge]
(music softens to shimmering analog synth arpeggios and clean chorus guitar)
[female]
Look how far we traveled from the basement floor
[male]
And the best songs that we carry haven't been sung before!
(music swells with a thunderous gated reverb drum roll)
As long as we're together, the night is never cold
And the story of the Engine will never grow old!

[Guitar Solo]
(An epic, horizon-spanning 1980s stadium rock twin electric guitar and analog synthesizer solo soaring over pounding gated drums)

[Final Chorus]
(maximum cosmic stadium crescendo)
Out where the stars still burn! Across the open night!
Every mile ahead of us is bathed in golden light!
We took the long road home, we weathered every turn
And found the fire waiting out where the stars still burn!
Five hearts on the frequency, steady and true
The universe is wider than the one we knew!
Keep the engines running til the morning sun returns—
Meet us on the horizon where the stars still burn!

[Outro]
(soaring twin guitar harmonies and cascading analog synthesizer bells)
[female]
Where the stars still burn!
[male]
See you out on the horizon!
(final triumphant sustained G-Major stadium chord fading into starlight)
```
