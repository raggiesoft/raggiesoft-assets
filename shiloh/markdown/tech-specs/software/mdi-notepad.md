---
type: software-spec
tags:
  - lore
  - kids-house
  - 1999-tech
  - software
  - quantum-basic
  - q32-api
title: "Matt's Custom MDI Notepad"
date_in_universe: "1999"
primary_developer: "Matt Miller"
language: "Quantum Basic 6.0 Professional"
environment: "Quantum OS 98"
status: canonical
---

# Matt's Custom MDI Notepad

## I. Origin & Architecture
Matt Miller’s primary software hyper-fixation in 1999 centers on a highly customized Multiple Document Interface (MDI) text editor.
*   **The QDN Foundation:** The software originated as a standard MDI sample project pulled directly from the massive, multi-disc QDN (Quantum Developer Network) Library included with the Quantum Basic 6.0 Professional retail box. 
*   **The Reverse Engineering:** Rather than building from a blank form, Matt meticulously reverse-engineered the Quantum Corporation's professional source code, stripping out bloated features to create a lightning-fast, minimalist editor perfectly suited to his sensory needs.
*   **Q32 API Integration:** Moving beyond standard Quantum Basic functions, Matt successfully integrated external library aliases. By declaring `GetPrivateProfileString` and `WritePrivateProfileString` from the `KERNEL32` library, he forced the program to bypass standard registries and interact directly with the Q32 API to read and write flat configuration files.

## II. The Memory Engine (`sarah.ini`)
Because Quantum OS 98 lacked the strict `%USERPROFILE%` directories of later operating systems, Matt coded his MDI Notepad to store its configuration file in the exact same directory as the executable (`App.Path`). He named this core memory file `sarah.ini`.
*   **The Logical Metaphor:** An INI file's sole purpose is to remember how an environment is supposed to be structured when a program wakes up. By naming the file after his sister, Sarah, Matt hardcoded her into his software as the foundational memory bank of his existence. She is his default path for safety and survival.

## III. The Operational Section (`[Shiloh]`)
A standard INI configuration file typically houses its primary variables under a `[General]` section header. Matt explicitly deleted this standard formatting.
*   **The `[Shiloh]` Header:** Inside `sarah.ini`, all application settings (such as font sizes, window dimensions, and default save paths) are housed under the `[Shiloh]` section header.
*   **The Caregiver Symbiosis:** This structural choice flawlessly maps the division of labor in his real-life care network. While Sarah is the foundational anchor (`sarah.ini`), his cousin Shiloh is the daytime LPN and "Player Two" who manages the general, minute-to-minute operations and settings of his daily life. 

## IV. Deployment
Because the Quantum Package & Deployment Wizard produced a messy, three-file output (`SETUP.EXE`, `SETUP.CAB`, `SETUP.LST`), Matt actively searched for better, more elegant deployment tools.
*   **The Runtime Trap:** Due to the rigid dependencies of the Quantum Basic runtime libraries, he was ultimately stuck relying on the official Quantum wizard. 
*   **The Band-Aid Solution:** To solve the messy deployment issue, Sarah purchased him a licensed copy of **NovaZip Self-Extractor** (developed by Nova Mak Computing). 
*   **The Execution:** Utilizing its "Software Installations" mode, Matt wrapped the clunky, three-file Quantum output into a single, clean executable. When launched by an end-user, the NovaZip program silently decompresses the payload into the Quantum OS `%TEMP%` directory and automatically fires the Quantum `SETUP.EXE` to handle the heavy lifting.