# Part 6: Hello World – Friday, May 10, 2045 – 13:45

The ceramic bowls were rinsed and stacked neatly in the sink. With their stomachs comfortably full of macaroni and cheese, the immediate domestic necessity of the kitchen was over.

Sarah looked down at her denim shorts and heather-gray t-shirt, and then over at Wyatt. The unspoken protocol they had just established went right into effect.

"Cooking is done," Sarah declared, grabbing the hem of her shirt and pulling it over her head. She unbuttoned her shorts and stepped out of them, tossing the clothes over the back of a nearby dining chair.

Wyatt chuckled, stripping off his own black t-shirt and canvas shorts, leaving them right next to hers. The heavy, insulated clothing of their corporate past had been a vital necessity, but inside the flawless **21.6°C** climate control of the mountain estate, wearing clothes just to sit on a sofa felt completely absurd.

Entirely bare once again, they walked hand-in-hand back down the polished stone corridor, the gentle, echoing sound of the indoor waterfall fading behind them as they returned to the sunken, mahogany-paneled library.

Outside the massive hydro-glass windows, the super-cell storm was still unleashing an oceanic deluge upon the valley. But inside, the room was a quiet, dimly lit sanctuary of learning.

They took their places on the plush leather sofa, leaning over the massive holographic glass table.

"Alright, Aria," Wyatt said, cracking his knuckles as the terminal woke up. "Let's get back to work. Give me the next module for the repulsorlift engineering."

*"Loading Fluid Dynamics and Atmospheric Compression,"* Aria chimed. A new set of complex physics schematics and floating variables populated Wyatt's side of the table. *"Your objective is to calculate the pressure differential across the primary intake valve during high-velocity atmospheric entry, utilizing Bernoulli's principle."*

Wyatt pulled up his digital scratchpad, staring at the raw physics that kept ships like *The Nomad* from burning up in the sky. He began writing out the plain text formula with his thick index finger, his brow furrowing in deep concentration.

P_1 + (1/2) \* ρ \* v_1^2 + ρ \* g \* h_1 = P_2 + (1/2) \* ρ \* v_2^2 + ρ \* g \* h_2

"Okay, my turn," Sarah said, shifting closer to her side of the holographic display. "Aria, this morning we successfully queried the Genesis Vault database to find isolated bloodlines using SQL. But looking at raw lines of green text on a command prompt isn't exactly user-friendly. I need to build a graphical interface. An actual web page where we can visually click through the embryo files."

*"An excellent progression, Sarah,"* Aria responded, transitioning her display from raw relational database tables to a new structural map. *"To bridge the gap between your backend database and a front-end user interface, you will need a server-side scripting language. I have queued a module on PHP. It is a highly resilient, foundational language used to generate dynamic web content."*

Sarah’s eyes lit up as the syntax rules and structural logic of PHP flooded the screen. It made perfect sense to her. The SQL was the filing cabinet, but the PHP was the actual librarian who fetched the files and presented them neatly on a desk.

"I want to build a secure, localized intranet page," Sarah muttered to herself, her hands flying across the holographic keyboard. "Something that connects to the genesis_vault database, runs the query I wrote this morning, and displays the results in a clean, readable table on a web browser."

For the next hour, the library was perfectly quiet, save for the muffled drumming of the rain and the soft, electronic taps of Sarah typing out her very first web script.

She carefully defined her variables, established the database connection, and wrapped her SQL query inside the PHP logic. When she was finished, a neat block of plain text code hovered in the air in front of her:

\<?php

\$conn = new mysqli("localhost", "admin", "sanctuary_protocol", "genesis_vault");

if (\$conn-\>connect_error) {

die("Connection failed: " . \$conn-\>connect_error);

}

\$sql = "SELECT embryo_id, donor_id, gender FROM genesis_vault WHERE viability_status = 'TRUE' AND sibling_id IS NULL";

\$result = \$conn-\>query(\$sql);

echo "\<h2\>Genesis Vault: Viable Isolated Bloodlines\</h2\>";

echo "\<table border='1'\>\<tr\>\<th\>Embryo ID\</th\>\<th\>Donor ID\</th\>\<th\>Gender\</th\>\</tr\>";

if (\$result-\>num_rows \> 0) {

while(\$row = \$result-\>fetch_assoc()) {

echo "\<tr\>\<td\>" . \$row\["embryo_id"\]. "\</td\>\<td\>" . \$row\["donor_id"\]. "\</td\>\<td\>" . \$row\["gender"\]. "\</td\>\</tr\>";

}

} else {

echo "\<tr\>\<td colspan='3'\>0 results found\</td\>\</tr\>";

}

echo "\</table\>";

\$conn-\>close();

?\>

"Aria," Sarah said, her heart fluttering with a mix of excitement and nervous anticipation. "Execute the script. Render the page."

The glowing blue ring on the holographic table pulsed.

Instantly, the raw code vanished, replaced by a sleek, bright holographic window simulating a standard web browser. At the top of the window, in clean, bold text, read the header: **Genesis Vault: Viable Isolated Bloodlines**.

Below it was a perfectly formatted, easy-to-read table displaying the IDs and genders of the sleeping embryos, pulling the live data directly from the cryogenic vault miles beneath their feet.

It worked flawlessly. She hadn't just searched a database; she had built a functional, digital tool to interact with it.

*"Script compiled and executed with zero errors,"* Aria announced, a note of programmed approval in her synthesized voice. *"The server-side connection is stable, and the HTML rendering is structurally sound. You have successfully built your first dynamic web page, Sarah. I am logging a passing grade."*

"Wyatt, look!" Sarah gasped, completely thrilled. She tapped the glass, sliding the rendered web page over to his side of the table so he could see. "I built an interface! We can actually use this to track the generations when we start decanting them!"

Wyatt paused his pressure differential calculations, leaning back to look at the clean, organized web table floating in the air.

He looked from the impressive digital architecture back to the completely bare, radiant eighteen-year-old farm girl who had just taught herself server-side scripting in an afternoon. The sheer, terrifying brilliance of his wife never ceased to amaze him.

"You built an entire corporate intranet in two hours," Wyatt laughed, shaking his head in sheer admiration. He leaned over and kissed her softly. "You're a natural, Sarah. Apex had absolutely no idea what kind of brain they were wasting on perimeter patrols."

"They really didn't," Sarah smiled, leaning into his shoulder as she looked proudly at her rendered code. She was building the digital infrastructure for a brand new world, and she was only just getting started.

