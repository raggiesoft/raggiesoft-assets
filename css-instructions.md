Prompt / Documentation: The RaggieSoft Theming Architecture
Core Philosophy: "State Drives Style." The site does not load a static CSS file. Instead, header.php dynamically constructs a load queue based on two variables set in the Router (index.php): $site and $theme.

1. Environment & Asset Paths (Crucial)
The file paths you see in the code are dynamic. You must ensure your environment is set up correctly for assets to load.

Development (Local): Assets live in the local folder /raggiesoft-assets/.

Production (Live): Assets are served via CDN from https://assets.raggiesoft.com/.

CORS Warning: If you set up a new domain (e.g., raggiesoftknox.com), you MUST update the CORS rules in the DigitalOcean Spaces settings for the assets.raggiesoft.com bucket, or fonts and scripts will fail to load.

2. The CSS Loading Order (The Cascade)
The header loads files in this specific order. Later files override earlier ones.

bootstrap-base.css (Common): The raw Bootstrap 5 framework. Never touch this.

root.css (Theme): The Foundation. Defines :root variables (colors, fonts, RGB values). This paints the broad strokes.

extras.css (Theme): The FX Engine. Contains custom classes for visual flair (e.g., .tome-container, .text-glow). It uses the variables defined in root.css.

bootstrap-header.css (Common): Global layout for the navbar.

bootstrap-footer.css (Common): Global layout for the footer and the sticky audio player.

safety-net.css (Theme): The Override. Used to force specific elements (like Navbars or Buttons) to behave when the default Bootstrap styles clash with your theme.

raggiesoft-extras.css (Common): Global hotfixes that apply to the entire network.

3. How to Construct a New Theme
To build a new visual identity (e.g., "The Silver Gauntlet"), you need to create a folder in your local raggiesoft-assets repository and define three critical files.

Step 1: Create the Directory

Site-Level Theme: raggiesoft-assets/[site-name]/css/bootstrap/

Example: raggiesoft-assets/aethel/css/bootstrap/

Sub-Theme (Context Override): raggiesoft-assets/[site-name]/css/bootstrap/[theme-name]/

Example: raggiesoft-assets/aethel/css/bootstrap/gloom/

Step 2: Create the Three Files

root.css (The Palette)

Purpose: Define your colors and fonts here.

Must Have: A :root block, plus overrides for [data-bs-theme="light"] and [data-bs-theme="dark"].

Key Tip: Always define RGB versions of your colors (e.g., --bs-primary-rgb) so Bootstrap's opacity utilities work.

extras.css (The Look)

Purpose: Custom CSS classes that define the "vibe" (glassmorphism, parchment textures, neon glows).

Key Tip: Use the variables you defined in root.css so you can change colors easily later.

safety-net.css (The Fix)

Purpose: Brute-force overrides using !important. Use this to ensure text is readable on your background or to force the Navbar to a specific color regardless of light/dark mode.

Key Tip: If the header looks wrong, fix it here.

4. How to Activate a Theme
You do not link CSS files manually. You set the context in the Router (public/index.php).

Example: Activating the "Gloom" Theme

PHP

'/library/aethel/book/chapter-1' => [
    'title' => 'Chapter 1',
    
    // 1. Sets the Asset Folder (loads /aethel/css/bootstrap/...)
    'site'  => 'aethel', 
    
    // 2. Sets the Sub-Folder (loads /aethel/css/bootstrap/gloom/...)
    // If null, it loads the default files in the site folder.
    'theme' => 'gloom',  
    
    'view'  => 'pages/library/aethel/chapter-1',
],
Common Pitfall: If you set 'theme' => 'gloom', you MUST have root.css, extras.css, AND safety-net.css inside the gloom folder. If one is missing, the header will try to load it and fail, potentially breaking the cascade.