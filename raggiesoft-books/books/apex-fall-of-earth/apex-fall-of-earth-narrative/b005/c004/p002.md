# Part 2: The Debugger – Friday, May 10, 2045 – 11:30

For the next three hours, the only sounds in the sprawling mahogany library were the steady drumming of the rain against the glass, the soft hum of the holographic table, and the occasional frustrated sigh from one of the two completely nude students.

Wyatt rubbed his temples, staring at the complex string of floating green variables on his side of the table. He was a hands-on mechanic who was used to feeling the heat of a failing engine, not calculating its theoretical limits on a digital whiteboard.

"Okay," Wyatt muttered to himself, leaning forward. "If the repulsor-coil is operating in a high-density atmospheric envelope, the thermal dissipation isn't just a matter of airflow. It's friction against the localized gravity field."

He pulled up the digital scratchpad, his thick finger tracing out the complex formula he had spent the last hour trying to balance.

F_d = (1/2) \* ρ \* v^2 \* C_d \* A + α \* ΔT (drag force = half \* density \* velocity squared \* drag coefficient \* reference area + thermal expansion coefficient \* change in temperature)

"Aria," Wyatt called out, double-checking his final variable. "If I calculate the drag coefficient using the standard atmospheric density of Exoplanet 4, the thermal expansion variable α forces the core temperature of the coil to increase by fourteen percent. Which means the fail-safe would trigger and stall the ship unless we manually reroute the coolant lines to the primary housing. Is that the correct resolution?"

The holographic table chimed a pleasant, affirmative note.

*"Excellent analytical deduction, Wyatt,"* Aria responded, her voice ringing from the ceiling array. *"Your calculations are flawless. You successfully identified the engineering bottleneck and derived the correct physical solution without utilizing a proprietary corporate patch. I am logging a passing grade for your first module."*

Wyatt let out a massive, triumphant breath, sinking back into the plush leather sofa. Ten years of taking orders from people who thought he was just a wrench-monkey, and he had just successfully reverse-engineered the thermal physics of a multi-billion-credit spacecraft component.

He looked over at Sarah, expecting to see her celebrating alongside him. Instead, her brow was deeply furrowed, her dark eyes locked onto a cascading wall of relational database syntax.

"Sarah?" Wyatt asked, resting his heavy hand gently on her bare thigh. "You okay over there?"

"Something's not right," Sarah murmured, chewing on her bottom lip.

She had spent the morning mapping out the data schema for the Genesis Vault. She wanted a simple, secure query that would allow her to pull a list of all fully viable embryos that had no localized familial ties, ensuring they could organize the first generation without any genetic overlap.

She had asked Aria for a standard relational syntax template to help her format the search. The AI had promptly generated the following block of code:

SELECT \* FROM genesis_vault JOIN lineage ON genesis_vault.embryo_id = lineage.parent_id WHERE viability_status = 'TRUE' AND lineage.sibling_id IS NULL;

\[for our records:

SELECT genesis_vault.embryo_id, genesis_vault.donor_id, genesis_vault.gender

FROM genesis_vault

LEFT JOIN lineage ON genesis_vault.donor_id = lineage.donor_id

WHERE genesis_vault.viability_status = 'TRUE'

AND lineage.sibling_id IS NULL

AND lineage.cousin_id IS NULL;

The donor_id fixes Aria’s AI Hallucination\]

Sarah stared at the floating text, mentally tracing the logic. She was new to this, but the underlying structure of organizing data felt incredibly natural to her.

"Aria," Sarah said slowly, leaning closer to the hologram. "Look at the JOIN command you generated. You linked the embryo_id to the parent_id in the lineage table."

*"That is the standard structural syntax for cross-referencing generational demographic databases,"* Aria replied smoothly.

"Right, for a normal population," Sarah countered, tapping the glowing code with her index finger. "But this isn't a normal population. This is a cryogenic vault filled entirely with unborn embryos. None of them are parents yet. If I actually run this query, it's going to trigger a logic loop and return a null set, because the parent_id column for these specific subjects is entirely empty."

There was a distinct, three-second pause from the ceiling array. The glowing blue ring on the holographic table pulsed as the AI processed the logical paradox.

*"You are absolutely correct, Sarah,"* Aria finally responded, her tone shifting to an apologetic baseline. *"I apologize. I experienced a generative hallucination. In my attempt to provide a rapid template, my language model prioritized the statistical likelihood of standard generational databases over the unique contextual constraints of the Genesis Vault schema. You have successfully identified a critical bug in my generated output."*

Wyatt let out a low chuckle, deeply amused. "Careful, Aria. She’s only been at this for three hours and she's already fact-checking you."

"It's just logic," Sarah smiled, feeling a massive surge of confidence. She swiped her hand through the hologram, deleting the AI's flawed code, and began typing out her own corrected syntax from scratch, replacing parent_id with donor_id.

*"Your debugging skills are highly commendable,"* Aria noted. *"As a generative intelligence, I rely on vast datasets to predict the most likely output, but I am not infallible. Having a human Administrator with the structural knowledge to audit my code ensures the absolute integrity of our systems. I am logging a passing grade with distinction for your first module."*

Sarah hit the execute command on her corrected code. Instantly, the database pinged, pulling up a flawless, perfectly organized list of forty-two thousand unrelated, viable embryos.

She let out a delighted laugh, leaning over to wrap her arms around Wyatt's neck. They were sitting completely bare in a mountain fortress, miles away from the floodwaters, and they were actually winning.

"Not bad for a mechanic and a farm girl," Wyatt grinned, kissing her deeply.

"Not bad at all," Sarah agreed, resting her head against his chest.

