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