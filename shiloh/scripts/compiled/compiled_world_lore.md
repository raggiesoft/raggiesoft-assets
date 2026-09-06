# Master World Context (Compiled)

## [FILE: tech-specs/computers/jessica.md]

---
type: tech-spec
tags:
  - lore
  - adults-house
  - 1999-tech
  - hardware
  - sysadmin
title: "Jessica's Root Terminal"
date_in_universe: "1999"
location: "The Adults House (COMMS Closet)"
primary_hardware: "Scrapped Omni-Comp Server Tower"
operating_system: "Dual-Boot: Linux (Command Line) / Quantum OS 98"
sysadmin: "Jessica Brooks"
status: canonical
---

# Jessica's Root Terminal ("The Frankenstein")

## I. Hardware & Physical Integration
While the rest of the Kids House relies on clean, consumer-grade hardware, Jessica’s primary workstation is an absolute nightmare of exposed wires and scrapped enterprise tech. 
*   **The COMMS Closet:** Because the heavy server chassis lacks consumer-grade acoustic dampening and sounds like a jet engine, Casper housed it in a dedicated, properly ventilated COMMS closet in the Adults House. This protects Matt's sensory environment next door while keeping the gateway directly connected to the main utility drop.
*   **The Omni-Comp Chassis:** Built out of a massive, discarded Omni-Comp server tower, the side panels are permanently removed to allow for constant hardware hot-swapping.
*   **The Drive Array:** Jessica has heavily modified the IDE ribbon cables to support a chain of salvaged hard drives dangling dangerously outside the chassis. This massive storage array hoards her Linux ISOs, source code tarballs, and the compound's localized backups.

## II. Operations & Software
*   **Remote Administration:** She spends 90% of her time in a raw, POSIX-compliant terminal environment managing this headless NAT gateway from her ThinkPad or terminal over in the Kids House via secure SSH. 
*   **The Physical Reboot:** She only physically enters the Adults House COMMS closet when forced to hot-swap a dead drive, untangle a Cat5 cable, or loudly curse out the motherboard in person.

---

## [FILE: tech-specs/computers/rachel-emily.md]

---
type: tech-spec
tags:
  - lore
  - kids-house
  - 1999-tech
  - hardware
  - gaming
title: "The Navy Gaming Towers"
date_in_universe: "1999"
location: "The Kids House (Bedroom 1 - The Command Center)"
primary_hardware: "Dual Omni-Comp 5000 Series Desktops"
operating_system: "Quantum OS 98"
sysadmin: "Jessica Brooks"
status: canonical
---

# The Navy Gaming Towers

## I. Hardware & Physical Integration
Because the living room is reserved for the communal puppy pile, Rachel and Emily Miller treat Bedroom 1 like a strict naval operations center.
*   **The Command Center:** This room is the loud, hot, tangled LAN and computer lab. The desks are pushed together, and the towers are hardwired directly into the wall's Cat5 Ethernet jacks.
*   **The Omni-Comp Fleet:** They operate twin Omni-Comp 5000 Series mini-towers. 
*   **The Gaming Upgrades:** Standard Omni-Comp machines from 1999 struggled with heavy 3D rendering. Jessica violently ripped out their internal modems and installed dedicated 16MB 3D AGP Graphics cards alongside 128MB of RAM. 

## II. Operations & Software
*   **The Combat Simulators:** These machines exist almost exclusively to run heavily expanded, community-authored map modifications for classic 16-bit shooters via the GZDoom source port.
*   **Audio Arsenal:** Both rigs are equipped with heavy desktop subwoofers and SoundBlaster Audio cards. When they launch a co-op match, Bedroom 1 shakes with the sound of pixelated shotgun blasts, usually accompanied by the sisters screaming naval profanity at their heavy CRT monitors.

---

## [FILE: tech-specs/computers/matt.md]

---
type: tech-spec
tags:
  - lore
  - kids-house
  - 1999-tech
  - accessibility
  - hardware
title: "Matt's Tactile Command Rig"
date_in_universe: "1999"
location: "The Kids House (Northern Albemarle County)"
primary_hardware: "Vanguard LogicPad (1999 Model)"
operating_system: "Quantum OS 98"
sysadmin: "Jessica Brooks"
status: canonical
---

# Matt's Tactile Command Rig 

## I. Hardware & Physical Integration
Matt’s Tactile Command Rig is not a standard desktop; it is a highly customized, mobile extension of his manual wheelchair, designed to withstand the chaotic, highly physical environment of the Kids House.
*   **The Vanguard LogicPad:** The core of the rig is a Vanguard LogicPad (the in-universe equivalent of an IBM ThinkPad). Chosen by Jessica for its indestructible, matte-black magnesium-alloy chassis, it can easily survive being bumped into doorframes or taking the brunt of an excited Husky jumping up on Matt’s lap. 
*   **The Swing-Arm Mount:** Casper Brooks custom-machined a heavy-duty steel swing-arm that mounts directly to the tubular frame of Matt's wheelchair. The LogicPad is securely bolted to a tray on this arm. 
*   **Physical Deployment:** When Matt needs to navigate the house or be transferred to the floor by his sister and cousins, the arm swings safely out of the way and locks against the side of the chair. When he is seated and ready to compute, the arm swings over his lap and locks firmly into place, positioning the keyboard exactly within his optimal motor range.
*   **The "Crimson Node":** Because standard computer mice are useless on a wheelchair, Matt navigates Quantum OS 98 using the LogicPad's built-in "Crimson Node"—the highly sensitive red pointing stick nestled directly in the center of the keyboard.

## II. Environmental Control (X10 Automation)
The rig serves as Matt's physical interface with the Kids House. Because he cannot verbally ask someone to adjust the room or physically reach standard light switches, Casper and Jessica wired the house with early X10 home automation modules.
*   **The Macros:** Jessica mapped specific macro shortcuts to the heavy KeyMech-style keys on the LogicPad. 
*   **Autonomy:** By pressing a single tactile combination, Matt can send X10 signals over the electrical wiring to turn on his bedroom lights, activate his box fan for sensory regulation (white noise), or ping a digital pager carried by Shiloh in the Bedroom 2 clinical depot if he needs immediate assistance.

## III. The Communications Hub (LAN Messenger)
Functionally non-verbal, Matt uses the rig as his primary voice when he needs to communicate beyond his immediate physical proximity.
*   **Local Chat:** He utilizes an early, lightweight LAN messenger client (configured by Jessica) to send text broadcasts across the compound. 
*   **Frictionless Pinging:** Whether he is telling Sarah in the kitchen that he is ready for dinner, or letting Jessica know that his Quantum OS 98 installation just threw a fatal exception error, the LogicPad allows him to seamlessly interface with the rest of the flock.

## IV. The Network Dependency (QoS)
Because the Vanguard LogicPad controls both his environmental autonomy and his "voice," its connection to the Kids House network is a critical medical necessity, not a luxury.
*   **The Vulnerability:** If the network drops or suffers extreme lag, Matt's X10 commands will fail to execute, and his LAN messages will time out. 
*   **The QoS Priority:** To prevent this, Jessica hardcoded the compound's headless NAT gateway to grant the LogicPad absolute Quality of Service (QoS) priority. 
*   **The Acoustic Confirmation:** When Matt's rig seizes the network to send an X10 command or a message, the router instantly chokes all other downloads in the house. This immediately causes Rachel and Emily's Archway 2000 and Omni-Comp desktop towers to lag, prompting a highly predictable, entertaining burst of muffled naval profanity from down the hall. To Matt, this swearing is a comforting acoustic signature confirming his hardware is functioning perfectly.

---

## [FILE: tech-specs/computers/chloe.md]

---
type: tech-spec
tags:
  - lore
  - kids-house
  - 1999-tech
  - hardware
  - academic
title: "Chloe's Academic Station"
date_in_universe: "1999"
location: "The Kids House (Bedroom 4 - The Acoustic Sanctuary)"
primary_hardware: "Archway 2000 Performance"
operating_system: "Quantum OS 98"
sysadmin: "Jessica Brooks"
status: canonical
---

# Chloe's Academic Station

## I. Hardware & Physical Integration
As the oldest cousin and the master strategist, Chloe requires a machine that simply works, placed in an environment completely devoid of Huskies and video game noise.
*   **The Acoustic Sanctuary:** Her setup is securely located in Bedroom 4, the designated quiet zone of the Kids House. When she needs to escape the communal living room, she closes this door to study.
*   **The Archway Performance Tower:** She utilizes a high-end Archway 2000 Performance mid-tower featuring a fast 500 MHz processor and a large 17-inch monitor.
*   **The Clean Desk:** Chloe’s workspace is immaculate. Unlike Jessica’s exposed wiring in the COMMS closet or the Navy sisters' tangled LAN cables down the hall, her cables are perfectly zip-tied, reflecting her absolute unbothered energy and control.

## II. Operations & Software
*   **The College Hub:** She primarily uses Quantum WritePad and early web browsers to execute her collegiate research for Piedmont State University. 
*   **The "Trent Firewall":** While she doesn't know how to code like Jessica, Chloe is highly proficient at weaponizing Quantum OS 98's basic security features. After the "Honey Chicken Incident," she expertly scrubbed Trent's screen names from her early instant messaging clients and deployed email blocklists with ruthless efficiency.

---

## [FILE: tech-specs/computers/sarah-shiloh.md]

---
type: tech-spec
tags:
  - lore
  - kids-house
  - 1999-tech
  - hardware
  - clinical
title: "The Medical Depot Terminal"
date_in_universe: "1999"
location: "The Kids House (Bedroom 2 - Clinical Hub)"
primary_hardware: "Archway 2000 Essential"
operating_system: "Quantum OS 98"
sysadmin: "Jessica Brooks (Hardware) / Sarah Miller (SOPs)"
status: canonical
---

# The Medical Depot Terminal

## I. Hardware & Physical Integration
Bedroom 2 serves as the strict, highly organized clinical hub for the compound, heavily contrasting the chaos of the living room puppy pile and the noisy Command Center.
*   **The Archway 2000:** The medical depot operates on a pristine Archway 2000 Essential desktop. It originally arrived at the house in one of Archway's legendary, massive Dalmatian-spotted cow boxes.
*   **The Specs:** It runs a reliable 400 MHz processor with a 13.6GB hard drive and an integrated 3Com Ethernet Network Card for network stability. 
*   **Peripherals:** It is hooked up to a heavy-duty laser printer, crucial for generating hard copies of daily shift schedules, clinical triage notes, and medication logs.

## II. Operations & Software
*   **The Digital MAR:** Sarah and Shiloh use the Quantum Suite to maintain immaculate, hospital-grade Medication Administration Records (MARs) for Matt and Jessica. 
*   **Zero Chaos Tolerance:** The Archway 2000 is strictly off-limits for recreational use. There are no games installed, and the Navy cousins are absolutely forbidden from downloading GZDoom WADs onto its hard drive.

---

## [FILE: locations/kids-house.md]

---
type: location
tags:
  - lore
  - kids-house
  - 1999-tech
  - architecture
  - compound
title: "The Kids House"
date_in_universe: "1999"
location: "Northern Albemarle County, Virginia"
status: canonical
---

# The Kids House (1999 Golden Era)

## I. Architectural Overview
Located in northern Albemarle County, the Kids House is a standard 4-bedroom, 3-bathroom suburban home situated on a shared property directly adjacent to the "Adults House." It is connected to the main house via a shared, fenced backyard equipped with heavy-duty dog doors to accommodate the roaming pack of Siberian Huskies. 

Because the house is occupied by seven young adults (Matt, Sarah, Shiloh, Chloe, Rachel, Emily, and Jessica), the concept of privacy has been entirely eradicated. The traditional floor plan has been radically repurposed to support Matt's physical accessibility, medical needs, and the family's communal lifestyle.

## II. The Living Room (The Primary Hub)
The living room serves as the permanent, communal sleeping quarters for the entire flock.
*   **The Gymnastic Mat:** Traditional beds and heavy furniture have been pushed to the walls or removed entirely. A massive, heavy-duty foam gymnastic mat covers the floor, creating a wall-to-wall "puppy pile". 
*   **Accessibility:** Sleeping at ground level eliminates any fall risk for Matt and provides a firm, stable surface for his cousins to safely execute low-friction slides and ADL transfers.
*   **The Husky Anchor:** The dogs wedge themselves into the sleeping bags at night, providing deep-pressure therapy and regulating warmth.

## III. The Repurposed Bedrooms
Since no one actually sleeps in the bedrooms, the four rooms have been highly specialized into functional zones.

### Bedroom 1: The Command Center
*   **Function:** The loud, hot, and tangled LAN and computer lab.
*   **Occupants:** This is where Rachel and Emily's Navy Gaming Towers are set up for GZDoom LAN matches. Matt also uses this room to dock his Tactile Command Rig when he needs a desk rather than his wheelchair swing-arm.
*   **Environment:** It is noisy, heavily wired with Cat5 Ethernet drops, and often occupied by Huskies sleeping under the desks.

### Bedroom 2: The Clinical Depot
*   **Function:** The highly sterilized medical hub and triage center.
*   **Occupants:** Governed strictly by Sarah and Shiloh (the LPNs).
*   **Environment:** Contains the Archway 2000 Essential desktop for maintaining digital MARs (Medication Administration Records). It is retrofitted with a dedicated water station for medication dispensing. 
*   **The Iron Door:** Siberian Huskies are absolutely banned from crossing the threshold, triggering daily vocal protests from the pack at the door.

### Bedroom 3: The Communal Wardrobe
*   **Function:** A massive, shared walk-in closet.
*   **Environment:** With modesty entirely absent from the house's culture, all clothing, jackets, and shoes are pooled into this single room. This centralization makes it incredibly efficient for any cousin to run in and grab clean clothes for Matt (or themselves) during chaotic morning routines or emergency ADL reboots.

### Bedroom 4: The Acoustic Sanctuary
*   **Function:** The designated quiet zone for intense academic focus.
*   **Occupants:** Primarily utilized by Chloe for her Piedmont State University coursework.
*   **Environment:** It houses Chloe's pristine Archway 2000 Performance desktop. It is strictly off-limits to video games, loud toilet humor, and chattering dogs.

## IV. The Bathrooms
With seven residents, the home's three bathrooms are fiercely divided by function.
*   **The Master Bath (Matt's Zone):** Exclusively retrofitted for Matt's survival. It features a roll-in shower, a two-person transfer bench (allowing Shiloh to assist without losing her balance), and reinforced grab bars. Sarah and Shiloh maintain absolute clinical authority over this space.
*   **The Cousins' Baths:** The remaining two bathrooms are domains of pure, unadulterated chaos where the six women battle daily for hot water, mirror space, and hair products.

---

## [FILE: characters/antagonists/courtney-evans.md]

---
type: character-profile
tags:
  - character
  - antagonist
  - virginia-beach
  - northwood-high
character_name: "Courtney Evans"
aliases: ["The Ex-Girlfriend"]
creation_date: "1981-07-23"
status: exiled
---

# Courtney Evans

## I. Core Demographics
*   **Full Name:** Courtney Evans
*   **Date of Birth:** July 23, 1981 (Turning 18 in the summer of 1999)
*   **Gender:** Female
*   **Standing Height:** 5'3"
*   **Location:** Virginia Beach, Virginia 
*   **Affiliation:** Northwood High School (Class of 1999)
*   **Role:** Antagonist / Ex-Girlfriend to Matt Miller

## II. The "School Matt" Illusion
Courtney was Matt Miller's first genuine romantic connection. However, her attraction was entirely based on a highly curated, artificial version of his life. 
*   **The Bubble:** At Northwood High School, Matt’s complex medical and physical needs were quietly managed by a retired male paraprofessional. Courtney enjoyed Matt's personality and intelligence but compartmentalized his severe dyspraxia and non-verbal status as background noise.
*   **The Disconnect:** She liked the *idea* of having Matt as a boyfriend but was completely unwilling (and unequipped) to handle the reality of his 24/7 care requirements, including his MACE routine and manual wheelchair transfers.

## III. The Omni-Q Betrayal
Courtney’s superficial acceptance shattered when the relationship attempted to transition into the real world for a movie date to see *The Matrix* in May 1999.
*   **The Trigger:** When Matt utilized his Vanguard LogicPad to inform her via Omni-Q that his 21-year-old sister, Sarah, would accompany them as his Private Duty Nurse, Courtney's insecurity flared into toxic jealousy.
*   **The Attack:** Completely missing the clinical necessity of Sarah's presence, Courtney lashed out, sending a barrage of cruel, ableist messages directly to Matt's hard drive. 
*   **The Failed Apology:** Realizing she had sabotaged a major relationship milestone (their shared 18th/21st birthday weekend), Courtney attempted to win Matt back at school by desperately offering a sexual encounter. 

## IV. The Exile
Courtney drastically underestimated Matt's boundaries and the terrifying physical and legal power of his family.
*   **The School Rejection:** Matt fiercely rejected her inappropriate apology, prompting his retired male aide to physically step in and block her access to his wheelchair.
*   **The Mall Confrontation:** When Courtney attempted to corner Matt at a local mall, she was intercepted by Sarah Miller. Standing a full 13 inches shorter than Sarah's 6'4" bodybuilder frame, Courtney was completely dwarfed. 
*   **Permanent Ban:** Utilizing her newly activated joint-and-several legal guardianship, Sarah threatened Courtney with a restraining order and harassment charges. Courtney was forced into a humiliating retreat and is permanently locked out of the Miller and Brooks family ecosystem.

---

## [FILE: characters/family/brooks/casper/chloe-brooks.md]

---
type: character-profile
tags:
  - character
  - kids-house
  - strategist
  - the-anchor
character_name: "Chloe Brooks"
aliases: ["The Strategist", "The Anchor"]
creation_date: "1976-10-12"
status: active
---

# Chloe Brooks

## I. Core Demographics & Lineage
*   **Full Name:** Chloe Brooks
*   **Date of Birth:** October 12, 1976
*   **Place of Birth:** NPT-HOS (Newport Hospital)
*   **Gender:** Female
*   **Parents:** Casper Brooks and Katrina Brooks
*   **Siblings:** Shiloh Brooks (Younger Sister) and Jessica Brooks (Younger Sister)
*   **Family of Origin:** `brooks_casper_core`
*   **Social Role:** Cousin / The Flock

## II. The Master Strategist
As the oldest of all the cousins in the Kids House, Chloe operates with a profound level of maturity, strategic foresight, and emotional detachment from petty drama.
*   **The Tactician:** Chloe does not waste energy on arguments or emotional outbursts. When faced with a problem—like her exhausting 1990s lacrosse bro boyfriend, Trent—she simply engineers a controlled demolition. She weaponizes her family's automated security system to execute a flawless, drama-free ejection.
*   **Absolute Unbothered Energy:** Because she helps run a highly complex, decentralized medical network for her family, she has zero tolerance for outside fragility. She views the chaotic, communal nature of the Kids House not as a burden, but as an incredibly efficient, perfectly oiled machine.
*   **Collegiate Focus:** While navigating the chaotic living room, she balances her responsibilities with her education at Piedmont State University, completely unfazed by the campus rumors that inevitably circulate about her formidable family.

## III. Clinical Role & Operations (The Anchor)
In the physical logistics of the Kids House, Chloe plays a critical, highly specific role during complex Activities of Daily Living (ADLs) for Matt.
*   **The Physical Anchor:** Because Matt is non-ambulatory and essentially dead weight on the floor, lifting his upper body requires someone to secure his lower half. Chloe frequently serves as this foundational anchor.
*   **The Two-Point Leverage System:** She will seamlessly drop to the floor, straddle Matt's legs, and place her weight firmly on his waist or hips to hold his lower body secure against the carpet. This allows Shiloh, Emily, or Rachel to safely hoist his torso without him sliding. 
*   **Clinical Pragmatism:** Chloe executes these incredibly physical maneuvers without a second thought. She can strip a soiled shirt off Matt or stabilize him for a transfer without ever breaking eye contact with the television or pausing her conversation.

## IV. Relationship to Matt
Chloe’s bond with Matt is built on absolute familial loyalty and a complete absence of neurotypical boundaries. 
*   **Priority Override:** Matt's needs will eternally override the comfort of any outsider. If Matt spills food on himself, Chloe will instantly abandon whatever she is doing—or whoever she is entertaining—to initiate a reboot routine.
*   **Platonic Comfort:** She operates with absolute, comfortable physical proximity to Matt. What outsiders completely misunderstand as inappropriate intimacy is, to Chloe, just the standard, platonic physics of keeping her cousin safe, clean, and cared for.

---

## [FILE: characters/family/brooks/casper/shiloh-brooks.md]

---
type: character-profile
tags:
  - character
  - kids-house
  - lpn
  - spastic-diplegia
  - player-two
character_name: "Shiloh Brooks"
aliases: ["Player Two", "Teddy Bear", "The Clinical Technician"]
creation_date: "1981-05-02"
status: active
---

# Shiloh Brooks

## I. Core Demographics & Lineage
*   **Full Name:** Shiloh Brooks
*   **Date of Birth:** May 2, 1981 *(Note: She shares the exact same birthday as her cousin Matt)*
*   **Place of Birth:** NPT-HOS (Newport Hospital)
*   **Gender:** Female
*   **Parents:** Casper Brooks and Katrina Brooks
*   **Siblings:** Chloe Brooks (Older Sister) and Jessica Brooks (Younger Sister)
*   **Family of Origin:** `brooks_casper_core`
*   **Career Track:** LPN
*   **Family Role:** Player Two / Teddy Bear / Legal Guardian

## II. Medical & Physical Profile
Shiloh’s approach to caregiving is entirely defined by her own physical realities, making her a master of technique and leverage over raw strength.
*   **Medical Baseline:** Shiloh has Spastic Diplegia, a form of cerebral palsy that affects her lower extremities.
*   **The Pivot-Transfer Expert:** Because she lacks the foundational leg strength or physical mass to solo-lift Matt like Sarah does, Shiloh relies entirely on flawless, textbook clinical physics. She executes perfect pivot transfers by locking Matt's knees with her own, using leverage and momentum to seamlessly swing his weight from his wheelchair to a bed or the floor without endangering her own physical safety.

## III. Clinical Authority (The Second-in-Command)
As a formally trained LPN, Shiloh operates as Sarah's trusted second-in-command within the Kids House medical ecosystem. 
*   **The Co-Architect:** Alongside Sarah, Shiloh helps author and enforce the strict Standard Operating Procedures (SOPs) that govern Matt's routine. 
*   **The Dispensary (Bedroom 2):** She shares absolute authority with Sarah over the clinical depot. Shiloh strictly maintains the Medication Administration Records (MARs) and has the training to run baseline physical assessments and triage for any member of the flock.
*   **The Quiet Operator:** While Sarah commands the house through sheer physical presence and volume, Shiloh leads through quiet, unshakeable clinical precision. 

## IV. Relationship to Matt (The 24/7 Protocol)
Sharing an exact birthdate and a deep, intrinsic understanding of living with a physical disability, Shiloh’s bond with Matt is arguably the most intertwined in the house. She is his designated "Player Two" and "Teddy Bear".
*   **Absolute Proximity:** Once Matt is fully established in the Kids House, Shiloh initiates a 24/7 care protocol. She rarely, if ever, leaves his side.
*   **Educational Integration:** Her dedication extends far beyond the walls of the house. To ensure Matt always has his primary technician and emotional anchor present, Shiloh actively registers for the exact same collegiate class schedules. Where Matt goes, Shiloh goes, ensuring his complex needs are universally met without ever relying on outside, untrained institutional aides.
*   **The Grounding Force:** During moments of overstimulation or potential meltdowns, Shiloh is often the first line of tactile defense, providing the familiar, calming deep-pressure touch that Matt needs to regulate his system.

---

## [FILE: characters/family/brooks/casper/casper-brooks.md]

---
type: character-profile
tags:
  - character
  - adults-house
  - girl-dad
  - the-builder
character_name: "Casper Brooks"
aliases: ["The Architect", "Girl Dad"]
creation_date: "1950-11-08"
status: active
---

# Casper Brooks

## I. Core Demographics & Lineage
*   **Full Name:** Casper Brooks
*   **Date of Birth:** November 8, 1950
*   **Gender:** Male
*   **Spouse:** Katrina Brooks
*   **Children:** Chloe Brooks, Shiloh Brooks, Jessica Brooks
*   **Family of Origin:** `brooks_casper_core`

## II. The Infrastructure Architect
*   **The Handyman:** Casper is the quiet, highly effective structural force behind the compound. If the Kids House needs a dedicated plumbing line run into Bedroom 2 to create a clinical water station, Casper is the one with the tools and the drywall saws making it happen.
*   **The Silent Provider:** He doesn't meddle in the daily operations of the Kids House. He just ensures the roof doesn't leak, the HVAC can handle seven people, and the heavy CRT monitors in Bedroom 1 have dedicated electrical circuits that won't trip the breakers. 

## III. Family Role (Girl Dad)
*   **Ultimate Girl Dad:** Officially designated as a "Girl Dad," Casper is entirely unbothered by being heavily outnumbered by formidable women. 
*   **The Background Observer:** He likely finds the legendary ejections of terrible boyfriends (like Trent) deeply amusing. He stays out of the line of fire, perfectly content to let his daughters and nieces run their automated security system while he handles the logistics.

---

## [FILE: characters/family/brooks/casper/katrina-brooks.md]

---
type: character-profile
tags:
  - character
  - adults-house
  - professor
  - matriarch
  - legal-guardian
character_name: "Katrina Brooks"
aliases: ["Professor Brooks", "The Academic Anchor"]
creation_date: "1955-08-14"
status: active
---

# Katrina Brooks

## I. Core Demographics & Lineage
*   **Full Name:** Katrina Brooks
*   **Date of Birth:** August 14, 1955
*   **Gender:** Female
*   **Spouse:** Casper Brooks
*   **Children:** Chloe Brooks, Jessica Brooks, Shiloh Brooks
*   **Sibling:** Linda Miller
*   **Family of Origin:** `brooks_casper_core`

## II. Career & The Campus Connection
*   **Profession:** Tenured Professor at Piedmont State University. 
*   **The Piedmont Network:** Because Katrina is a tenured presence on the local campus, she is highly visible. This makes Trent's attempt to lie to his lacrosse team about the Kids House even more pathetic—everyone at Piedmont State already knows who Professor Brooks and her formidable family are.
*   **Relocation Timeline:** She relocated to the Charlottesville area by 1980, establishing the geographic foundation for what would eventually become the Albemarle County compound. She was also present in Newport in May 1981 when Shiloh was born.

## III. Family Role (The Matriarch)
*   **Legal Guardian:** Katrina officially holds Legal Guardian status within the family network. 
*   **The Adults House:** She rules the Adults House next door. While she allows the Kids House to operate with its own autonomous, chaotic sovereignty, she is the ultimate safety net. She provides the intellectual and financial stability that allows her daughters (and nieces/nephew) to thrive.

---

## [FILE: characters/family/brooks/casper/jessica-brooks.md]

---
type: character-profile
tags:
  - character
  - kids-house
  - agent-of-chaos
  - sailor-mouth
  - sysadmin
  - 1999-tech
character_name: "Jessica Brooks"
aliases: ["The Agent of Chaos", "The Kill Shot", "Root User", "PROGMAN.EXE"]
creation_date: "1980-02-28"
status: active
---

# Jessica Brooks

## I. Core Demographics & Lineage
*   **Full Name:** Jessica Brooks
*   **Date of Birth:** February 28, 1980
*   **Place of Birth:** UVA-HOS (UVA Health System)
*   **Gender:** Female
*   **Parents:** Casper Brooks and Katrina Brooks
*   **Siblings:** Chloe Brooks (Older Sister) and Shiloh Brooks (Older Sister)
*   **Family of Origin:** `brooks_casper_core`
*   **Social Role:** Cousin / SysAdmin / The Flock

## II. The Agent of Chaos & The "Sailor Mouth"
As the youngest of the cousins in the Kids House, nineteen-year-old Jessica is completely unfiltered, unbothered, and highly volatile. 
*   **The Hybrid Profanity:** Jessica seamlessly combines the spectacular, military-grade profanity brought into the house by her older Navy cousins with her own brand of unapologetic, crude toilet humor.
*   **The Biological Critique:** She specializes in highly graphic, anatomically insulting verbal takedowns. During the legendary "Honey Chicken Incident," it was Jessica who delivered the final "kill shot" to Trent, diagnosing his insecurity by loudly comparing his anatomy to a "soggy wonton." 
*   **Zero Shame:** She possesses absolutely no social filter, keeping the house in a constant state of chaotic amusement.

## III. The Kids House SysAdmin (1999 Tech & Operations)
Beneath the chaos, Jessica is the undisputed in-house IT expert. She treats the Kids House network with the exact same aggressive, unfiltered approach she applies to everything else.
*   **The Swearing Technician:** When the internet goes down or a piece of hardware fails, Jessica does not politely troubleshoot. She unleashes a barrage of highly specific, foul-mouthed diagnostics at the motherboard. She is known to verbally assault routers until they submit and start routing packets again.
*   **Lightweight Philosophy:** She absolutely despises bloated, corporate graphical interfaces like the Quantum Menu. She prefers to drop straight into POSIX-compliant terminal environments, managing the house network via secure SSH connections. To Jessica, if you can't fix it from a raw command line, the software is garbage and deserves to be insulted.
*   **Matt's Tactile Command Rig:** Matt's primary communication and environmental control device is a heavy-duty, ruggedized machine custom-tailored to his motor needs, utilizing a highly durable KeyMech mechanical keyboard. Because it currently runs on Quantum OS 98, it occasionally throws catastrophic errors. When this happens, Jessica takes absolute ownership. She will sit cross-legged on the floor next to his wheelchair, typing furiously into a terminal window while loudly cursing out the executives at the Quantum Corporation on his behalf. 

## IV. Clinical Role & Logistics (The Designated Spotter)
While she may not have Sarah’s heavy lifting power or Shiloh’s formal LPN training, Jessica plays a vital role in the physical mechanics of the Kids House.
*   **The Spotter and Runner:** During complex Activities of Daily Living (ADLs) or emergency transfers, Jessica acts as the rapid-response runner. She clears obstacles out of the flight path and fetches specific gear from the Bedroom 2 Clinical Depot.
*   **The Distraction:** If Matt is experiencing mild distress or anxiety during a medical assessment, Jessica provides high-energy distraction, using her chaotic humor to redirect his attention while Sarah and Shiloh work.
*   **Medication Evasion:** Ironically, despite being part of the care team, she is the worst offender when it comes to taking her own medication. Sarah frequently has to physically track her down with a paper pill cup and the MAR clipboard to force compliance.

## V. Relationship to Matt
Jessica and Matt share a highly entertaining, dynamic bond based on pure, unfiltered energy and technological trust.
*   **Aggressive Defense:** While Sarah provides structural protection, Jessica provides loud, offensive defense. If anyone disrespects Matt's space, Jessica will verbally annihilate them.
*   **The IT Trust:** Because Matt relies heavily on his technology to interface with the world, his trust in Jessica's ability to keep his rig running is absolute. He finds her furious, swearing rants at his Quantum Hardware highly amusing, responding with rapid, breathy chuckles whenever she threatens to throw his external drive into the Albemarle County woods.
*   **The Puppy Pile Participant:** Despite her chaotic energy, she intimately understands his boundaries. When it is time to wind down on the living room gymnastic mat, she will happily drop the volume, wedge herself into the puppy pile, and provide the deep, grounded physical presence he needs to regulate his system.

---

## [FILE: characters/family/miller/peter/rachel-miller.md]

---
type: character-profile
tags:
  - character
  - kids-house
  - navy-brat
  - operator
  - refined-profanity
character_name: "Rachel Miller"
aliases: ["The Naval Artillery", "Navy Tag-Team"]
creation_date: "1978-09-18"
status: active
---

# Rachel Miller

## I. Core Demographics & Lineage
*   **Full Name:** Rachel Miller
*   **Date of Birth:** September 18, 1978
*   **Place of Birth:** NPT-NAVHOS (Naval Hospital Newport)
*   **Gender:** Female
*   **Parents:** Peter Miller and Susan Miller
*   **Siblings:** Emily Miller (Younger Sister)
*   **Family of Origin:** `miller_peter_core`
*   **Social Role:** Cousin / The Flock

## II. The Naval Influence & "The Refined Sailor Mouth"
Raised by Master Chief Peter Miller, a retired US Navy Fire Controlman with 30 years of service, Rachel absorbed the exact same military culture as her sister Emily, but she applies it with a distinctly different flavor.
*   **The Refined Artillery:** While Emily’s swearing is casual, chaotic, and fluent, Rachel’s profanity is elevated to an absolute art form. It is surgical, highly articulate, and mathematically flawless. She doesn't just casually drop curses; she constructs devastating, hyper-specific paragraphs of swearing designed to completely dismantle a target.
*   **The Heavy Cannon:** When the Kids House automated security system is triggered—such as during the legendary Trent Honey Chicken Incident—Rachel is the one who steps forward to deliver the unbroken naval artillery. Her refined sailor mouth allows her to verbally bulldoze threats into submission, forcing them to retreat without ever needing to lay a hand on them.

## III. Clinical Role & Operations (The Navy Tag-Team)
Rachel forms the other half of the elite mobility unit within the house, operating in complete, unspoken synchronization with her younger sister.
*   **The Two-Person Lift:** Rachel and Emily execute perfect, military-style two-person lifts to safely transfer Matt. 
*   **The Precision Director:** As the older Navy cousin, Rachel often takes the lead on the rigid, synchronized vocal countdowns during these complex maneuvers (e.g., *"On three. One, two, three, up"*). This ensures their timing is absolutely flawless, protecting both Matt and themselves from injury.
*   **The Phalanx:** In moments of external threat, Rachel seamlessly falls into a military formation alongside Emily, standing shoulder-to-shoulder directly behind Sarah to form a literal wall of defense.

## IV. Relationship to Matt (The Military Handshake)
Rachel treats Matt’s care routines with the exact same strict, military-grade respect for his bodily autonomy as her sister does.
*   **Command and Acknowledge:** She strictly utilizes the "Call and Response" protocol. Rachel will always announce her exact flight path to Matt before touching him, removing all sensory ambiguity from the transfer.
*   **Tactile Confirmation:** Once she announces the move, she freezes. She waits patiently for Matt’s internal processor to catch up and issue his explicit physical green light—usually a deliberate double-tap or squeeze on her arm—before applying any leverage.
*   **Auditory Comfort:** To Matt's highly logical brain, Rachel's articulate strings of curses carry zero social taboo. He simply categorizes her refined swearing as a safe, highly predictable acoustic signature that lets him know his oldest Navy cousin is in the room and standing watch.

---

## [FILE: characters/family/miller/peter/emily-miller.md]

---
type: character-profile
tags:
  - character
  - kids-house
  - navy-brat
  - operator
  - sailor-mouth
character_name: "Emily Miller"
aliases: ["The Operator", "Navy Tag-Team"]
creation_date: "1980-12-05"
status: active
---

# Emily Miller

## I. Core Demographics & Lineage
*   **Full Name:** Emily Miller
*   **Date of Birth:** December 5, 1980
*   **Place of Birth:** NPT-NAVHOS (Naval Hospital Newport)
*   **Gender:** Female
*   **Parents:** Peter Miller and Susan Miller
*   **Siblings:** Rachel Miller (Older Sister)
*   **Family of Origin:** `miller_peter_core`
*   **Social Role:** Cousin / The Flock

## II. The Naval Influence & "The Sailor Mouth"
Raised by Peter Miller, a retired US Navy Master Chief Fire Controlman, Emily grew up immersed in military culture. She absorbed both the extreme discipline and the highly colorful vocabulary of a thirty-year sailor.
*   **The Sailor Mouth:** Emily possesses a spectacularly creative, naval-grade vocabulary of profanity. Whether she is lounging in the living room, playing a video game, or yelling at a Husky to get out of the way, she drops F-bombs and complex curses with absolute, casual fluency. (She and Rachel are the primary reason the youngest cousin, Jessica, swears so heavily).
*   **The Contrast:** Despite her casual, chaotic profanity, the exact millisecond she steps in to help Matt with an Activity of Daily Living (ADL), her posture straightens. She switches instantly from a relaxed, swearing college student into a hyper-focused, precision drill sergeant.

## III. Clinical Role & Operations (The Navy Tag-Team)
Emily operates in total, unspoken synchronization with her sister Rachel. Together, they function as a highly elite mobility unit within the Kids House.
*   **The Two-Person Lift:** Because Emily lacks Sarah's massive 6'4" bodybuilder frame, she does not perform solo lifts. Instead, she and Rachel execute flawless, military-style two-person lifts. 
*   **The Leverage Anchor:** In complex ADL transfers (like the legendary Honey Chicken Incident), Emily seamlessly assumes the heavy lifting role, effortlessly hooking her arms under Matt’s armpits to hoist his upper body weight while another cousin anchors his legs. 
*   **The Phalanx:** In moments of external threat, Emily naturally falls into a military formation. She provides secondary physical enforcement directly behind Sarah, forming a literal wall of defense for Matt.

## IV. Relationship to Matt (The Military Handshake)
Emily treats Matt’s care routines like a strict naval operation, prioritizing his need for predictability and bodily autonomy above all else.
*   **Command and Acknowledge:** She strictly utilizes a "Call and Response" protocol. Before moving Matt, she verbally announces the exact flight path to remove all ambiguity (e.g., *"Alright Matt, we are shifting you from the chair to the floor."*).
*   **Holding Pattern:** After announcing the move, Emily freezes. She will not apply any pressure or initiate a lift until Matt processes the auditory input and gives explicit tactile confirmation (a double-tap or a squeeze on her hand).
*   **Acoustic Signature:** Matt does not attach social taboos to Emily's heavy swearing. To his autistic brain, her colorful naval profanity is just a highly predictable, distinct auditory signature that lets him know his Navy cousins are safely in the room.

---

## [FILE: characters/family/miller/peter/susan-miller.md]

---
type: character-profile
tags:
  - character
  - miller-family
  - navy-wife
  - matriarch
character_name: "Susan Miller"
aliases: ["The Matriarch"]
creation_date: "1948-06-12"
status: active
---

# Susan Miller

## I. Core Demographics & Lineage
*   **Full Name:** Susan Miller
*   **Date of Birth:** June 12, 1948
*   **Gender:** Female
*   **Spouse:** Peter Miller
*   **Children:** Rachel Miller and Emily Miller
*   **Family Created:** `miller_peter_core`

## II. Family Role & Resilience
*   **Navy Wife / Matriarch:** Susan’s primary roles are defined as "Navy Wife / Matriarch."
*   **The Military Foundation:** Navigating a 30-year military career alongside a Master Chief requires immense logistical capability, resilience, and independence. Susan had to manage her household and raise Rachel and Emily through multiple deployments and major geographic relocations (from Newport to Norfolk).
*   **The Matriarchal Triad:** Alongside her sister-in-law Linda and Katrina Brooks, Susan completes the older generation's matriarchal triad. The extreme competence, fierce loyalty, and unbothered independence seen in Rachel and Emily are clearly inherited from a mother who spent decades running operations on the home front while her husband was at sea.

---

## [FILE: characters/family/miller/peter/peter-miller.md]

---
type: character-profile
tags:
  - character
  - miller-family
  - us-navy
  - master-chief
  - girl-dad
character_name: "Peter Miller"
aliases: ["Master Chief", "The Anchor"]
creation_date: "1945-11-04"
status: active
---

# Peter Miller

## I. Core Demographics & Lineage
*   **Full Name:** Peter Miller
*   **Date of Birth:** November 4, 1945
*   **Gender:** Male
*   **Spouse:** Susan Miller
*   **Children:** Rachel Miller and Emily Miller
*   **Siblings:** David Miller (Brother)
*   **Family of Origin:** `miller_peter_core` (by proxy of his wife and daughters)

## II. The Naval Career & Arc
*   **Rank and Rating:** US Navy - Master Chief Fire Controlman (Ret.)
*   **The 30-Year Arc:** He served a full 30-year career in the United States Navy. 
*   **Geographic Timeline:** He was stationed in Newport, Rhode Island, in the early 1980s (which is where both of his daughters were born). He underwent a Permanent Change of Station (PCS) to Norfolk, Virginia, in 1985, and eventually retired in the Hampton Roads area.
*   **The Acoustic Legacy:** As a Master Chief with three decades of service, Peter is the direct source of Rachel and Emily's spectacular, highly articulate "sailor mouths." The military precision and discipline he instilled in them translates perfectly into their flawless, two-person ADL lifts for Matt.

## III. Family Role
*   **The Anchor:** He holds the attribute of "The Anchor," providing a deeply grounded, disciplined foundation for his branch of the family.
*   **Girl Dad:** Like his brother David and brother-in-law Casper, Peter is officially designated as a "Girl Dad." Raising two incredibly formidable, fiercely loyal daughters who operate like a highly elite mobility unit is a direct reflection of his leadership.

---

## [FILE: characters/family/miller/david/matt-miller.md]

---
type: character-profile
tags:
  - character
  - kids-house
  - non-verbal
  - aac
  - wheelchair-user
  - autism
  - dyspraxia
character_name: "Matt Miller"
aliases: ["The Core", "Man of Honor"]
creation_date: "1981-05-02"
status: active
---

# Matt Miller

## I. Core Demographics & Lineage
*   **Full Name:** Matt Miller
*   **Date of Birth:** May 2, 1981
*   **Gender:** Male
*   **Standing Height:** 5'7"
*   **Parents:** David Miller and Linda Miller
*   **Siblings:** Sarah Miller (Older Sister)
*   **Family of Origin:** `miller_david_core`
*   **Social Role:** Man of Honor / One of the Girls
    *   *Note:* He is explicitly included in all female-centric family events.

## II. Medical & Neurological Baseline
Matt's physical and neurological profile requires a highly structured, predictable environment. His non-ambulatory status is driven by profound neurological factors rather than structural orthopedic issues. 
*   **Primary Diagnoses:** 
    *   Dyspraxia
    *   Sensory Processing Disorder
    *   Asynchronous Development
*   **Mobility:** Matt relies entirely on a manual wheelchair for ambient movement or physical transfers (lifts, slides, pivots) executed by his sister and cousins.
*   **Vocal Capacity:** Functionally non-verbal. He cannot articulate words, relying instead on alternative communication methods.

## III. Communication & Boundaries
Matt processes his environment through a systems-based, logical framework. Because he lacks traditional speech, his communication is intensely tactile, physical, and auditory.

### Primary Output Systems
*   **AAC Device:** His primary "voice" for complex thoughts or specific requests.
*   **"Yes" Indicators:** A short, soft hum (upward inflection) or a breathy "Huh!" paired with a sharp nod, quick upward glance, or specific tap on his armrest.
*   **"No" Indicators:** A forceful, guttural grunt or soft "mmm-mmm" sound, accompanied by a vigorous side-to-side headshake or a pushing-away gesture.

### Tactile Language & Emotion
Touch is Matt's most fluent language. He implicitly trusts his core group (Sarah, Shiloh, Chloe, Rachel, Emily, Jessica) for his physical survival and emotional grounding.
*   **Seeking Comfort:** He actively desires affection from his trusted group, demonstrating genuine relaxation (dropped shoulders) and returning hugs with noticeable pressure and a soft smile.
*   **Deep Pressure:** If overstimulated or anxious, he may gently lean toward a trusted person or cling to them for a grounding hug.
*   **Joy/Excitement:** Expressed through bright squeals, happy hums, bouncing, or drumming his fingers.
*   **Frustration/Anger:** Signaled by a tense jaw, sharp head movements, a forceful "huff!", or a light fist tap on his armrest.

### Distresses & System Overloads
When variables in his environment become too chaotic, Matt's internal processor can crash, leading to a meltdown.
*   **Triggers:** Sensory overload, extreme emotional distress, or physical discomfort.
*   **Precursors:** Low repetitive humming, shallow breathing, unusual quietness, or a tense/panicked facial expression.
*   **The Overload:** Manifests as loud, distressed (non-word) cries, violent rocking, covering his ears/eyes, and visible terror.
*   **The Reboot:** Afterward, he requires quiet, rest, and the deeply trusted physical reassurance of his primary protectors.

---

## [FILE: characters/family/miller/david/david-miller.md]

---
type: character-profile
tags:
  - character
  - miller-family
  - bodybuilder
  - legal-guardian
character_name: "David Miller"
aliases: ["The Giant", "Girl Dad"]
creation_date: "1951-09-14"
status: active
---

# David Miller

## I. Core Demographics & Lineage
*   **Full Name:** David Miller
*   **Date of Birth:** September 14, 1951
*   **Gender:** Male
*   **Standing Height:** 6'11"
*   **Spouse:** Linda Miller
*   **Children:** Sarah Miller and Matt Miller
*   **Siblings:** Peter Miller (Brother)
*   **Family of Origin:** `miller_david_core`

## II. Physical Profile & Presence
*   **The Blueprint:** David is a massive 6'11" natural bodybuilder. He is the direct genetic source of Sarah’s towering 6'4" frame and immense physical strength. 
*   **The Gentle Giant:** Despite his incredibly intimidating physical stature, he is explicitly designated as a "Girl Dad." This implies that beneath the muscle, he has a profound patience and tenderness, especially when it comes to supporting his formidable daughter and his son, Matt.

## III. Family Role
*   **Legal Guardian:** He holds official Legal Guardian status within the family.
*   **The Foundation:** As the father of Matt (the emotional center of the family) and Sarah (the Primary Protector), David provided the genetic and emotional foundation for the Kids House's most critical caretaking dynamic. He likely taught Sarah the foundational mechanics of lifting and physical leverage long before she ever went to LPN school.

---

## [FILE: characters/family/miller/david/linda-miller.md]

---
type: character-profile
tags:
  - character
  - miller-family
  - matriarch
  - legal-guardian
character_name: "Linda Miller"
aliases: []
creation_date: "1953-03-22"
status: active
---

# Linda Miller

## I. Core Demographics & Lineage
*   **Full Name:** Linda Miller
*   **Date of Birth:** March 22, 1953
*   **Gender:** Female
*   **Standing Height:** 5'5"
*   **Spouse:** David Miller
*   **Children:** Sarah Miller and Matt Miller
*   **Siblings:** Katrina Brooks (Sister)
*   **Family of Origin:** `miller_david_core`

## II. Physical Profile
*   **The Contrast:** Standing at 5'5", Linda provides a stark physical contrast to her husband David's 6'11" bodybuilder frame and her daughter Sarah's 6'4" stature. (Interestingly, her height is much closer to her son Matt's 5'7" frame). 

## III. Family Role & The Sisterly Bond
*   **Legal Guardian:** Like her husband, Linda holds official Legal Guardian status.
*   **The Matriarchal Link:** As Katrina Brooks' sister, Linda is half of the maternal foundation that bridges the Miller and Brooks families. The incredibly tight-knit bond between the cousins in the Kids House (Chloe, Shiloh, Jessica, Sarah, and Matt) is a direct reflection of the strong, foundational bond between Linda and Katrina.
*   **The Support Network:** While her daughter Sarah and niece Shiloh handle the day-to-day, 24/7 clinical logistics for Matt, Linda's presence (and legal authority) ensures the overarching medical and bureaucratic architecture for Matt's care remains entirely within the family's control.

---

## [FILE: characters/family/miller/david/sarah-miller.md]

---
type: character-profile
tags:
  - character
  - kids-house
  - lpn
  - bodybuilder
  - charge-nurse
  - primary-protector
character_name: "Sarah Miller"
aliases: ["The Charge Nurse", "The Heavy Crane"]
creation_date: "1978-05-02"
status: active
---

# Sarah Miller

## I. Core Demographics & Lineage
*   **Full Name:** Sarah Miller
*   **Date of Birth:** May 2, 1978
*   **Place of Birth:** NPT-HOS (Newport Hospital)
*   **Gender:** Female
*   **Standing Height:** 6'4"
*   **Parents:** David Miller and Linda Miller
*   **Siblings:** Matt Miller (Younger Brother)
*   **Family of Origin:** `miller_david_core`
*   **Career Track:** LPN / Future MD
*   **Family Role:** Primary Protector / Legal Guardian

## II. Physical Profile & Presence
Sarah is the physical anchor of the Kids House. Inheriting her father David's massive frame, she operates with a terrifying, calm authority.
*   **Build:** 6'4" Natural Bodybuilder. She possesses immense functional strength.
*   **The "Heavy Crane":** She is the only person in the Kids House authorized to execute a solo "scoop and carry" transfer for Matt. She can easily pluck him from his wheelchair or the floor and carry his dead weight without strain.
*   **Physical Intimidation:** She rarely needs to raise her voice. She enforces boundaries (such as ejecting Trent during the Honey Chicken Incident) using sheer physical mass and her uncompromising "Charge Nurse" posture, acting as an impenetrable wall between the outside world and her family.

## III. Clinical Authority & Role (The "Charge Nurse")
With her formal LPN training, Sarah is the undeniable operational architect of the Kids House ecosystem. She runs the home like a highly affectionate, slightly chaotic clinical floor.
*   **The Blueprint:** She authors the strict Standard Operating Procedures (SOPs) for Matt’s care routines. She ensures that whether Shiloh, Chloe, or the Navy cousins are assisting Matt, the execution is mathematically identical every time to prevent his internal system from crashing.
*   **The Medical Depot (Bedroom 2):** She commands the retrofitted clinical hub of the house. She and Shiloh maintain strict hospital-grade Medication Administration Records (MARs) for every resident. 
*   **The Enforcer:** She keeps the chaotic elements of the house in check. If Jessica attempts to rush a routine or skip a medication dose, Sarah is instantly there with a clipboard and a paper cup, demanding compliance. She also enforces the strict "no dogs allowed" perimeter around the medical room.
*   **Ethical Guardrails:** Despite her vast knowledge, she strictly adheres to her LPN scope of practice. She triages, documents vital signs, and takes clinical notes, but defers all actual diagnoses and prescriptions to the individual's primary care team.

## IV. Relationship to Matt
As his biological sister and Primary Protector, Sarah's bond with Matt is absolute. 
*   **The Anchor:** While Matt is the emotional center of the house, Sarah is the structural steel that keeps him safe. She translates his tactile communication and routine-based needs into actionable directives for the rest of the flock.
*   **Zero-Tolerance Firewall:** She is the ultimate judge of the "Matt Test." Anyone who applies a neurotypical, insecure lens to Matt's platonic, physical bond with the women in the house is immediately and systematically removed by Sarah's authority.

---

## [FILE: characters/ccc/bouchard/heather-bouchard.md]

---
type: character-profile
tags:
  - character
  - ccc-campus
  - peer
  - nuclear-medicine
  - unhandled-exception
character_name: "Heather Bouchard"
aliases: []
creation_date: "1980-09-12"
status: disconnected
---

# Heather Bouchard

## I. Core Demographics
*   **Full Name:** Heather Bouchard
*   **Date of Birth:** September 12, 1980
*   **Gender:** Female
*   **Affiliation:** Charlottesville Community College (CCC)
*   **Major:** Nuclear Medicine
*   **Role:** CCC Peer / Former Romantic Interest

## II. The Campus Connection
Heather is a student at Charlottesville Community College who shares an identical twin sister, Hailey. She possesses a highly clinical, technically demanding academic track in Nuclear Medicine, which gives her a profound mutual respect for both Shiloh's LPN training and Matt's hardware programming.
*   **The Safe Variable:** Heather provided Matt with an incredibly safe, judgment-free social environment. She completely accepted his non-verbal communication and his reliance on a manual wheelchair without neurotypical awkwardness or pity.
*   **The Boolean Boundary:** When invited to the Kids House, Heather provided a clear, polite decline. To Matt, this directness was deeply comforting, establishing a clean geographic parameter (`Geographic_Limit = CCC_Campus`) that allowed their platonic campus friendship to flourish.

## III. The Psychological Profile (The Silent Overload)
Unlike a malicious antagonist, Heather’s ultimate failure in the relationship stemmed from her own internal, unarticulated neurological limits.
*   **Autistic Burnout:** Balancing the grueling demands of her Nuclear Medicine track with the daily, high-engagement social routine of the CCC cafeteria slowly drained her "processing RAM." 
*   **The Missing Protocol:** Lacking the emotional vocabulary to express that she needed a sensory break or a temporary pause, her brain defaulted to the only fail-safe it had: completely deleting the variable to stop the drain. 

## IV. The Lasting Impact
Heather’s sudden, unexplained severance of the relationship—executed without a word on the CTS bus—triggered a catastrophic system crash for Matt. 
*   Because she was not a villain and the connection had been genuinely positive, her silent departure left a permanent, unresolvable `Syntax Error` in Matt's memory. 
*   Even years later, the lack of closure regarding Heather remains a source of quiet, lingering grief, as his logical mind can never fully process a failure that had no discernible cause.

---

## [FILE: characters/ccc/bouchard/hailey-bouchard.md]

---
type: character-profile
tags:
  - character
  - ccc-campus
  - peer
  - desktop-publishing
  - ui-ux
character_name: "Hailey Bouchard"
aliases: []
creation_date: "1980-09-12"
status: disconnected
---

# Hailey Bouchard

## I. Core Demographics
*   **Full Name:** Hailey Bouchard
*   **Date of Birth:** September 12, 1980
*   **Gender:** Female
*   **Affiliation:** Charlottesville Community College (CCC)
*   **Major:** Desktop Publishing
*   **Role:** CCC Peer

## II. The Creative Co-Processor
Hailey is Heather's identical twin sister. To Matt's highly literal, system-oriented brain, her identical appearance causes zero processing errors; she is simply recognized as a separate, highly valued piece of hardware running different software.
*   **The UI/UX Counterpart:** Hailey's major in Desktop Publishing makes her the perfect creative counterbalance to Matt's raw Visual Basic backend logic. While Matt codes API calls and INI configurations, Hailey utilizes early Adobe software and QuarkXPress to discuss UI/UX layouts.
*   **The Collaborator:** She frequently reviews Matt's projects on his Vanguard LogicPad, offering design insights for his `setup.exe` installers or custom icons, creating a highly productive, symbiotic workflow at their CCC cafeteria table.

## III. The Campus Ecosystem
Hailey is an essential component of the "CCC Quad" (Matt, Shiloh, Heather, and Hailey). She shares her sister's complete, unbothered acceptance of Matt's physical and neurological realities. 
*   When Shiloh needs to pause the group's hangout to assist Matt with an Activity of Daily Living (ADL), Hailey effortlessly holds down their social space without making the medical reality feel taboo or burdensome. 
*   When Heather's sudden, silent burnout severed the connection with Matt on the CTS bus, Hailey's presence in Matt's daily routine was simultaneously and permanently disconnected, abruptly terminating their productive creative partnership.

---

## [FILE: lore-events/honey-chicken.md]

---
type: lore-event
tags:
  - lore
  - kids-house
  - breakup
  - adl-routine
  - 1990s
title: "The Trent Honey Chicken Incident"
date_in_universe: "1999 (A Friday Night)"
location: "The Kids House - Living Room (Northern Albemarle County)"
characters_present:
  - Chloe Brooks (The Strategist)
  - Trent (The Target / Ex-Boyfriend)
  - Matt Miller (The Catalyst / VIP)
  - Sarah Miller (The Heavy Crane)
  - Rachel Miller (The Naval Artillery)
  - Emily Miller (The Leverage Anchor)
  - Jessica Brooks (The Kill Shot)
  - Shiloh Brooks (The Clinical Technician)
  - The Huskies (Riot Squad)
tone: "Comedic, tactical, chaotic, highly vindicating"
core_conflict: "Neurotypical insecurity vs. Clinical family pragmatism"
catalyst: "A dropped piece of sticky chicken requiring an immediate, physical ADL transfer."
ai_prompt_hooks:
  - "Focus on the stark contrast between the romantic intimacy on the TV and the clinical pragmatism on the floor."
  - "Highlight Chloe's absolute emotional detachment; this is a tactical operation, not a heartbreak."
  - "Portray Trent as performatively macho but deeply insecure."
  - "Describe the cousins rising from the floor with synchronized, military-grade intimidation."
status: canonical
---

# The Trent Honey Chicken Incident of 1999

## I. The Tactical Pre-Briefing
It was a Friday night during the golden era of the northern Albemarle County compound, and Chloe Brooks had called a tactical briefing in the living room. 

She was officially done with Trent. The 1990s lacrosse bro from the Piedmont State campus was needy, insecure, and exhausting, and she wanted an ironclad excuse to cut the cord. Gathering Sarah, Shiloh, Rachel, Emily, and nineteen-year-old Jessica—with Matt happily sitting in the center of the floor—Chloe laid the trap. 

*"I'm bringing Trent over tonight for the first time,"* she announced. *"I need an excuse to dump him. Just run the standard house protocols. Do not filter yourselves. Let the automated security system do its job."* 

For the cousins, this was the equivalent of being slipped off their leashes. They just had to wait for Trent to step on a landmine of his own making. 

## II. The Arrival and The "Macho" Bonding Attempt
When Trent pulled his car into the driveway, he was immediately on edge. He was profoundly confused as to why Chloe and her adult cousins referred to their home as the "Kids House," completely lacking the spatial and familial context that Casper and Katrina lived in the "Adults House" right next door.

The living room was in its standard operational configuration: no furniture, just a massive puppy pile of sleeping bags, heavily breathing Huskies, and a mountain of Chinese takeout. The first VHS tape of *Titanic* was playing on the heavy CRT television.

Trent, desperately trying to assert dominance, decided the best way to bond with Matt was to act like a complete slob. Assuming that Matt, being disabled, would be a messy eater, Trent aggressively crushed his takeout, talking with his mouth full and wiping grease on his jeans in a failed attempt at macho camaraderie. Matt completely ignored him, continuing to eat his own order of Honey Chicken, white rice, and broccoli with mathematical, spotless precision.

## III. The Cinematic Accelerant
About halfway through the evening, the movie reached its most infamous climax on Tape 1. The room went quiet as Leonardo DiCaprio readied his charcoal and Kate Winslet dropped her robe. 

Trent shifted uncomfortably on the couch. Being an insecure, hyper-sexualized 1990s frat bro sitting in a room full of his girlfriend's female relatives, he was already sweating. He immediately looked down at the floor, expecting eighteen-year-old Matt to be staring wide-eyed at the screen like a typical, hormone-driven teenager. 

Instead, Matt was completely unbothered. 

Because Matt lived in a house with zero privacy, where his sister and cousins regularly changed clothes, showered, and helped him bathe in an entirely communal setting, he was completely desensitized to female nudity. His autistic brain didn't register the scene as sexual; it registered it as functional. To Matt's internal processor, a nude female usually just meant it was time for his bath. Since the water wasn't running, the visual input was deemed irrelevant, and he simply kept eating his rice.

## IV. The Catalyst: The Two-Point Leverage System
At the *exact second* Jack’s charcoal hit the paper on the TV, a sticky piece of Honey Chicken slipped from Matt’s chopsticks and landed squarely on his shirt. 

Because Matt was lying flat on the floor and was entirely non-ambulatory, removing a form-fitting, sticky t-shirt required a standard, two-person clinical leverage system. 

Without breaking eye contact with the television, Chloe crawled over, straddled Matt’s legs, and sat her weight firmly on his waist to act as a physical anchor. Simultaneously, Emily slid in behind Matt, hooking her arms under his armpits to hoist his head and torso off the carpet. With Matt’s lower half secured by Chloe’s body weight and his upper half elevated by Emily, Chloe reached her hands down to the very bottom hem of Matt’s shirt—right at his waistband—ready to pull it up while Shiloh grabbed a clean one.

## V. The Fatal Error
Trent’s neurotypical brain completely short-circuited. The juxtaposition of the intense romantic intimacy on the screen and the clinical physical pragmatism on the floor was too much. He conflated the two. He didn't see a highly efficient, platonic ADL transfer; he saw his girlfriend straddling another man’s hips and grabbing his waistband while Kate Winslet posed naked in the background.

Trent jumped up, completely invading the clinical workspace. 
*"Whoa, boundaries, babe!"* he snapped, grabbing Chloe's shoulder. *"He’s a grown guy. I don't really like another dude touching you like that. You're practically grabbing his junk."*

## VI. The System Response (The Ejection)
The trap had been sprung. The house flatlined. The VCR was paused right on the drawing. 

Chloe didn't argue or defend herself. She just sat back on her heels and let the Kids House automated security system go to work.

Sarah, all 6'4" of her bodybuilder frame, rose from the floor. Radiating terrifying Charge Nurse authority, she stepped directly into Trent's personal space and kept walking forward, using her sheer physical mass to bulldoze a panicked Trent away from Chloe. 

Behind Sarah, Rachel and Emily rose in absolute military synchronization. Tapping into thirty years of Master Chief Peter's accumulated naval fury, Rachel unleashed a breathtaking, mathematically flawless string of hyper-specific profanity. 

Then, nineteen-year-old Jessica delivered the kill shot. Stepping out from the pack, she weaponized the swearing she learned from the Navy cousins with her own crude toilet humor. She loudly and graphically diagnosed Trent’s insecurity, dropping F-bombs while informing him that he had the functional manhood of a soggy wonton and the processing power of a dropped eggroll. 

The Huskies, sensing a sanctioned hit, formed a riot line at Sarah's feet, throwing their heads back and screaming at Trent in absolute, deafening outrage. 

Outnumbered, out-sworn, and terrified, Trent was marched backward to the front door by the phalanx of women. Chloe tossed his jacket out onto the Albemarle County grass, slammed the door, and locked the deadbolt. 

## VII. The Reboot
The exact millisecond the deadbolt clicked shut, the entire house erupted into cheers and laughter. Chloe high-fived Emily. The system had worked flawlessly. They had executed a clean breakup without a single tear or drawn-out conversation.

Through the entire explosive ejection, Matt remained perfectly calm, sitting propped up against Emily's arms. To Matt, Trent wasn't a threat; Trent was simply a `Syntax Error` that had temporarily paused his shirt-changing routine. 

With the virus quarantined and deleted, Matt simply raised his arms slightly, giving Chloe the physical green light to finish pulling the shirt over his head. The system had rebooted, and his mathematically perfect rice was waiting.

---

## [FILE: lore-events/the-ccc-crash.md]

----
type: lore-event
tags:
  - lore
  - ccc-campus
  - kids-house
  - heartbreak
  - meltdown
  - unhandled-exception
title: "The CCC Crash (The Unhandled Exception)"
date_in_universe: "Fall 1999"
location: "Charlottesville Community College, CTS Bus Route, & The Kids House"
characters_present:
  - Matt Miller (The VIP)
  - Shiloh Brooks (Player Two / Triage)
  - Heather (The Romantic Interest / Nuclear Medicine)
  - Hailey (The Twin / Desktop Publishing)
  - Sarah Miller (The Heavy Crane)
  - The Huskies (Weighted Blankets)
tone: "Quietly devastating, profound, clinical, fiercely protective"
core_conflict: "Autistic processing vs. Silent emotional burnout"
catalyst: "A sudden, unexplained rejection of a routine goodbye hug on the CTS bus."
ai_prompt_hooks:
  - "Highlight the initial perfection of the daytime college routine and the twins' absolute acceptance of Shiloh's clinical duties."
  - "Focus on the mathematical terror of an 'Unhandled Exception'—a variable deleting itself without executing a shutdown sequence."
  - "Portray Shiloh's immediate shift into emergency triage on a moving public bus."
  - "Describe the 48-hour 'Safe Mode' recovery on the living room mat as a silent, fiercely dedicated communal medical operation."
status: canonical
---

# The CCC Crash (The Unhandled Exception)

## I. The Daytime Campus Ecosystem
After relocating to Albemarle County, Matt Miller and his cousin Shiloh Brooks established a flawless daytime routine. Relying on the Charlottesville Transit Service (CTS), they commuted to Charlottesville Community College (CCC) for daytime IT classes. Shiloh, utilizing Matt's manual wheelchair to stabilize her Spastic Diplegia, acted as his permanent "Player Two" and Private Duty Nurse. 

In the CCC computer labs, they integrated with two identical twins: Heather (studying Nuclear Medicine) and Hailey (studying Desktop Publishing). To Matt’s highly literal brain, the identical twins caused zero visual confusion; they were simply two distinct variables running different operational software.

## II. The Illusion of the Perfect Fit
Heather initially represented the ultimate safe variable for Matt. 
*   **Clinical Acceptance:** She and Hailey were entirely unbothered by Matt's severe dyspraxia and non-verbal status. When Shiloh needed to execute a pivot-transfer or take Matt to the restroom for his MACE routine, the twins simply held down their cafeteria table without an ounce of neurotypical awkwardness.
*   **The Boolean Boundary:** When Matt used his Vanguard LogicPad to invite Heather back to the Kids House, she declined with a direct, polite *"No thank you."* Because she did not offer fake excuses or manipulation, Matt’s brain processed this as a safe, clean geographic parameter (`Geographic_Limit = CCC_Campus`). 
*   **The Campus Quad:** The four of them became a highly functional fixture at the college. Hailey assisted Matt with UI/UX icon design for his Visual Basic projects, while Heather connected with Shiloh over clinical anatomy terminology. 

## III. The Silent Burnout
What Matt could not process was Heather’s own invisible, draining social battery. Balancing the grueling academic load of Nuclear Medicine with the intense daily engagement of the CCC social group slowly pushed her autistic processing into the red. Lacking the emotional vocabulary to request a temporary pause or a sensory break, her brain executed an emergency shutdown to survive the burnout. She decided to simply uninstall herself from the routine.

## IV. The Severance (The CTS Bus Crash)
The devastation occurred during the standard afternoon CTS bus commute. Matt’s manual wheelchair was locked into the ADA bay, with Shiloh gripping the handles and Heather standing nearby. 

As the bus air-brakes hissed to announce Heather’s stop, Matt executed the daily, hardcoded "goodbye" routine. He leaned forward to initiate their standard, platonic hug—the tactile equivalent of a successful system shutdown.
*   **The Rejection:** Heather did not lean in. Driven by absolute burnout, she simply rejected the input, stood up, and exited the bus without a single word of explanation. 
*   **The Void:** The hydraulic doors slammed shut, and the bus pulled away, leaving Matt suspended in mid-air. 

## V. The Unhandled Exception (`Err 6 - Overflow`)
To Matt’s systems-oriented brain, a trusted variable had just vanished without cause. 
*   **The Infinite Loop:** He fell into an agonizing, stunned silence, frantically scanning his own internal code to find the error he had made, unaware that the failure was entirely on Heather's end. 
*   **The Overflow:** His sensory firewalls immediately collapsed. The vibration of the diesel engine, the fluorescent lights, and the noise of the passengers triggered a catastrophic system overload (`Err 6`). His breathing grew ragged, and his dyspraxic spasticity locked his limbs. 
*   **Emergency Triage:** Shiloh instantly dropped to her knees in front of his wheelchair, building a physical shield against the staring passengers. Burying her head against him, she applied massive, grounding deep pressure while frantically dialing her pocket autodialer to trigger the `911` Beeper Code to Sarah's pager at Piedmont State.

## VI. The 48-Hour Safe Mode Reboot
When Shiloh finally navigated the wheelchair into the Kids House, Sarah (6'4", natural bodybuilder) was waiting. Recognizing a total central nervous system crash, the family initiated a silent, 48-hour intensive care lockdown. 

*   **The Mat Sanctuary:** Sarah effortlessly scooped Matt out of the chair and placed him directly in the center of the heavy-duty foam gymnastic mat in the living room. 
*   **Total Surrender:** Matt remained completely unresponsive, staring blankly at the ceiling. Sarah and Shiloh took over 100% of his biological functions, feeding him by hand, changing him, and managing his toileting routines directly on the floor. 
*   **The Husky Blankets:** The house fell perfectly silent. The seventy-pound Siberian Huskies abandoned their usual chattering, stepping onto the mat to drape their heavy bodies across Matt's legs, acting as living weighted blankets. 
*   **The Reboot:** It took two full days of silent, unconditional love, deep-pressure therapy, and absolute physical surrender before Matt’s internal processor finally cooled down enough to tentatively reach for his ThinkPad and acknowledge the heartbreak.

---

## [FILE: lore-events/the-omni-q-betrayal.md]

---
type: lore-event
tags:
  - lore
  - virginia-beach
  - 1999-tech
  - breakup
  - guardianship
title: "The Courtney Betrayal (The Omni-Q Incident)"
date_in_universe: "May 1999"
location: "Virginia Beach, Virginia (Miller Family Home & Northwood High School)"
characters_present:
  - Matt Miller (The VIP)
  - Sarah Miller (The Primary Protector)
  - Courtney (The Antagonist / Ex-Girlfriend)
  - David Miller (The Patriarch)
  - Linda Miller (The Matriarch)
  - Retired Male Aide (Northwood High School Paraprofessional)
tone: "Heartbreaking, fiercely protective, legally absolute, triumphant"
core_conflict: "Neurotypical ignorance vs. Absolute familial protection and disability reality"
catalyst: "A transparent message regarding medical accommodations for a movie date triggers a toxic, ableist explosion."
ai_prompt_hooks:
  - "Focus on the technological difference between transient messaging and permanent chat logs."
  - "Highlight the immense physical contrast between Sarah (6'4\") and Courtney (5'3\")."
  - "Emphasize Matt's internal realization that his cousins would verbally destroy Courtney if they were present."
  - "Portray the activation of the joint-and-several guardianship not just as paperwork, but as a weapon of protection."
status: canonical
---

# The Courtney Betrayal (The Omni-Q Incident)

## I. The Technological Landscape (Spring 1999)
In the spring of his senior year at Northwood High School, eighteen-year-old Matt Miller utilized his wheelchair-mounted Vanguard LogicPad (the in-universe equivalent of an IBM ThinkPad) to communicate with the world. 

While most teenagers used the casual, transient InfoLink Messenger (AIM) to chat, Matt relied on **Omni-Q** (the in-universe equivalent of ICQ). This distinction was critical. Unlike InfoLink, which erased conversations the second a window was closed, Omni-Q functioned for power users. It permanently saved local, timestamped chat logs directly to the computer's hard drive. 

## II. The Saturday Night Meltdown (May 1, 1999)
Matt had been dating a seventeen-year-old classmate named Courtney. Up until this point, she had only interacted with "School Matt"—a highly curated environment where Matt's medical needs were quietly handled by a retired male paraprofessional provided by the school district. 

Wanting to celebrate his 18th birthday and Sarah's 21st birthday, Matt planned a major relationship milestone: a Sunday movie date to see *The Matrix*. 

Using his Vanguard LogicPad, Matt sent Courtney an Omni-Q message. Because he operated on pure, transparent logic, he explained that Sarah would be accompanying them to handle his Private Duty Nursing (PDN) needs—managing his MACE routine and urinary bag so Courtney wouldn't have to worry about the clinical reality of his dyspraxia[cite: 8, 9]. 

Courtney’s neurotypical, deeply insecure teenage ego shattered. Ignoring the medical logistics, she unleashed a toxic, ableist barrage of messages. The cheerful Omni-Q notification chime rang out repeatedly in the Virginia Beach house as Courtney cruelly rejected him for bringing another woman on their date. 

## III. The Investigation and the Safe Harbor
Because Matt had not yet moved to Albemarle County, he did not have his flock of female cousins surrounding him. He sat alone in the family's shared study, weeping in front of his glowing LCD screen. 

When Sarah (6'4", natural bodybuilder)[cite: 8, 9] returned home from an LPN shift, she immediately recognized his distress.
*   **The Receipts:** Because Matt used Omni-Q, Sarah did not have to guess what had happened. She opened the application history and read the permanent, saved chat logs verbatim.
*   **The Hard Copy:** Acting with clinical precision, Sarah sent the devastating chat logs to the home's slow inkjet printer, securing physical evidence.
*   **The Deadlift:** With the printer grinding in the background, Sarah effortlessly scooped Matt's 5'7" frame[cite: 8, 9] out of his manual wheelchair. She deadlift-carried him into her bedroom, curled up around him on the bed, and provided the deep-pressure therapy required to reset his crashing nervous system. 
*   **The Ghost of the Flock:** As Matt cried, he found a small sliver of comfort imagining the sheer volume of spectacular naval profanity Rachel, Emily, or Jessica would unleash on Courtney if they were there.

## IV. The Unified Front
When David (6'11")[cite: 8, 9] and Linda (5'5")[cite: 8, 9] returned home, Sarah handed them the printed Omni-Q logs. The family instantly closed ranks. There was no debate and no teenage drama. The printed logs proved Courtney was an active threat to Matt's emotional stability, and she was permanently excised from their ecosystem.

On Sunday, May 2, 1999, Matt officially turned 18[cite: 8, 9]. This activated the joint-and-several legal guardianship and conservatorship, legally empowering David, Linda, and Sarah to act unilaterally on his behalf. Matt and Sarah went to see *The Matrix* alone, celebrating their shared birthday in peace.

## V. The Double Shutdown (May 4, 1999)
Courtney’s attempts to backtrack the following Tuesday resulted in her systematic dismantling.

*   **The Morning Incident (Northwood High School):** Egged on by her friends, Courtney cornered Matt at school and offered a sexual encounter as a desperate apology. Matt, having zero concept of sexual subtext and viewing her purely as a threat, fiercely rejected her. When Courtney ignored his "no," the retired male paraprofessional physically stepped between them, shutting down the harassment.
*   **The Afternoon Execution (The Mall):** Courtney attempted to confront Matt again later that afternoon at a local mall. This time, Sarah intercepted her. The physical disparity was staggering—Courtney (5'3") had to crane her neck to look up at Sarah (6'4")[cite: 8, 9]. Sarah did not yell. Leveraging her newly activated, court-appointed guardianship, she calmly informed Courtney that she was causing her ward emotional distress and threatened an immediate restraining order and harassment charges. 

Courtney retreated for good, and Sarah and Matt began planning their escape to Charlottesville[cite: 8, 9].

---

## [FILE: lore-events/network-rules.md]

---
type: infrastructure-sop
tags:
  - lore
  - kids-house
  - 1999-tech
  - sysadmin
  - networking
  - quality-of-service
title: "Kids House Network Protocols & QoS"
date_in_universe: "1999"
location: "The Kids House (Northern Albemarle County)"
primary_architect: "Jessica Brooks (Root User)"
infrastructure_support: "Casper Brooks"
status: canonical
---

# Kids House Network Protocols & Quality of Service (1999)

## I. The Hardware Architecture
Sharing a single, early-adopter 1.5 Mbps commercial cable modem across two distinct residential dwellings requires aggressive, physical infrastructure.
*   **The Adults House Drop:** To keep administrative and financial liability centralized, the primary cable broadband connection drops into the Adults House. Casper and Katrina Brooks serve as the official billing contacts, shielding the Kids House from service interruptions or bureaucratic friction.
*   **The Trench:** Casper Brooks manually trenched a weatherproof PVC conduit beneath the Albemarle County grass, running a heavy-duty Cat5 Ethernet cable to physically link the two houses. 
*   **Internal Wiring:** Both houses utilize commercial-grade 10/100 Mbps Fast Ethernet switches. Dedicated Cat5 lines are fished through the drywall, ensuring every bedroom and the main living room has a hardwired network jack.

## II. The POSIX Gateway Server
Commercial routers in 1999 are incapable of reliably handling the simultaneous heavy traffic of seven young adults. 
*   **The Headless Rig:** Jessica Brooks operates a scrapped, monitor-less PC acting as the dedicated NAT (Network Address Translation) and DHCP server for the compound.
*   **Command-Line Enforcement:** Bypassing bloated graphical interfaces, Jessica runs a lightweight Linux distribution on the server. She manages routing tables, IP leases, and network traffic natively using POSIX-compliant text utilities, executing all configurations via secure SSH terminal connections.

## III. Sanctioned Bandwidth Black Holes
The Kids House network is constantly under heavy load from legitimate, high-bandwidth traffic. Jessica actively monitors and manages these specific use cases to prevent network crashes:
*   **Independent Music Caching:** The cousins legally download gigabytes of high-quality, sanctioned audio from early indie promotional platforms like MP3.com. 
*   **Heavy OS & Driver Updates:** As the sysadmin, Jessica is frequently pulling down massive 150 MB Linux ISO tarballs, source code packages, and extensive hardware drivers to keep the house’s Quantum OS 98 machines running natively and securely.
*   **Modding Repositories:** Rachel and Emily download heavily expanded, community-authored map modifications (WADs) for classic 16-bit shooters via legal FTP repositories like FilePlanet. 
*   **Cinematic QuickTime Drops:** The release of a 30 MB, high-resolution QuickTime movie trailer triggers an immediate, house-wide network freeze to ensure the download does not time out.

## IV. The Golden Rule: Tactile Command Rig QoS
Regardless of what is being downloaded, Jessica has hardcoded one unbreakable routing rule into the gateway server: **Matt Miller’s IP address possesses absolute Quality of Service (QoS) priority.**
*   **Zero-Lag Guarantee:** Matt’s Tactile Command Rig is his primary interface for communication and environmental control. If his machine requests a single packet of data, the server instantly throttles all other connections in the compound. 
*   **The Acoustic Confirmation:** When the QoS protocol dynamically kicks in, the immediate result is usually a synchronized eruption of Master Chief-level profanity from Rachel and Emily's bedroom. If their multiplayer match rubber-bands or an FTP download stalls, they unleash a breathtaking barrage of naval curses at their CRT monitors. 
*   **Absolute Compliance:** Despite the furious swearing, there is zero genuine resentment. The Navy cousins intimately understand the clinical necessity of the QoS protocol. They aren't cursing at Matt; they are cursing at the physics of 1999 bandwidth. Once the swearing subsides, they sit patiently and wait for his rig to finish its priority traffic. 
*   **Matt's Amusement:** To Matt's logical brain, the sudden, muffled burst of articulate F-bombs from down the hall isn't aggressive or scary—it is simply a highly entertaining, predictable acoustic signature confirming that his network request was successfully prioritized.

---

## [FILE: lore-events/beeper-protocol.md]

---
type: infrastructure-sop
tags:
  - lore
  - kids-house
  - communication
  - 1999-tech
  - medical-protocol
  - visual-basic
title: "The Beeper Code Protocol (VB6 Dictionary)"
date_in_universe: "1999"
location: "Albemarle County & Piedmont State University"
primary_architect: "Matt Miller & Sarah Miller"
status: canonical
---

# The Beeper Code Protocol (VB6 Dictionary)

## I. The Analog Architecture
Because Matt Miller is functionally non-verbal and 1999 cell phone technology (like T9 predictive text) is inaccessible for his motor needs, the family relies on a heavily structured analog paging system.
*   **The Hardware:** Sarah and Shiloh carry standard numeric pagers (e.g., Motorola Bravo Flex) provided through a discounted medical/university rate. 
*   **The Transmission:** Matt carries a pocket DTMF autodialer. When he needs assistance, he rolls up to a campus payphone or library courtesy phone, holds the dialer to the mouthpiece, and transmits a pre-agreed numeric code to his protectors.

## II. The VB6 Error Dictionary
Because Matt’s brain is highly logical and heavily hyper-fixated on Visual Basic 6.0 programming, he mapped his emotional and physical states directly to classic VB6 Runtime Error codes.
*   **`0` (Err.Clear):** *Baseline / Essential Need.* Usually indicates he needs assistance with his standard bathroom/MACE routine.
*   **`6` (Overflow):** *Sensory Overload / Meltdown.* A critical system warning that he is receiving too much sensory or emotional input and is about to crash. 
*   **`7` (Out of Memory):** *Exhaustion.* He is physically or mentally depleted and requires immediate extraction to the Kids House to sleep.
*   **`13` (Type Mismatch):** *Social Discomfort.* He is in an unpredictable environment or dealing with an unsafe social variable (like a toxic outsider) and needs intervention.
*   **`53` (File Not Found):** *Location Error.* He is lost, or his designated protector (Sarah/Shiloh) is not at the agreed-upon location.
*   **`70` (Permission Denied):** *Authority Conflict.* A librarian, transit driver, or security guard is trying to force him to move, and he requires an LPN or Legal Guardian to advocate for him.
*   **`911`:** *Catastrophic System Failure.* A genuine medical emergency requiring the immediate suspension of all other activities.

## III. The Closed-Loop Handshake
For Matt's systems-oriented brain, a one-way transmission is insufficient. An unacknowledged error code will rapidly escalate his anxiety into an `Err 6` Overflow.
*   **The Receipt:** When Sarah or Shiloh receives a code on their pager, they must immediately find a payphone to close the loop.
*   **The Clear Command:** They dial Matt's digital pager and transmit a simple **`0`**. To Matt, this functions as an `Err.Clear` command. It provides instant, silent confirmation that his error was successfully trapped by his care team, the protocol is executing, and physical help is on the way.

---

