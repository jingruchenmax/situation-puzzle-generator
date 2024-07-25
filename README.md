# situation-puzzle-generator
A llm-based mixed initiative situation puzzle generator.

## What is a situation puzzle?
What is a situation puzzle? Here's an example:

One situation puzzle would be:

A man walks into a bar, and asks the bartender for a drink of water. The bartender pulls out a gun, points it at the man, and cocks it. The man pauses, before saying "Thank you" and leaving. What happened?

The question-and-answer segment might go something like this.

Question: Could the bartender hear him? Answer: Yes

Question: Was the bartender angry for some reason? A: No

Question: Was the gun a water pistol? A: No

Question: Did they know each other from before? A: No (or: "irrelevant" since either way it does not affect the outcome)

Question: Was the man's "thank you" sarcastic? A: No (or with a small hint: "No, he was genuinely grateful")

Question: Did the man ask for water in an offensive way? A: No

Question: Did the man ask for water in some strange way? A: Yes
## Why is situation puzzle generation difficult?
Puzzles require an intimate understanding of the causal relationships of the real world.

Simply asking LLMs to generate them directly tend to result in uninteresting, nonsensical results. It also runs risk of
directly copying existing puzzles it memorizes.

Including human in the loop can lead to better results. In addition, it's more fun to co-create puzzles with AI!

## How to play

This demo involves two parts, a puzzle generator and an evaluator. Your goal is to generate a puzzle that can beat the AI evaluator.

First you can use LLM to brainstorm a draft story by combining various key elements you want to include in the game.

Then you choose which key information of the draft story you want to withhold. This is the crucial part, as it gives
LLM a hint which withheld information is crucial to create a good situation puzzle.

This will prompt the LLM to generate a puzzle and an answer to the puzzle.

At this point you can use this idea or further tweak it yourself.

Otherwise you can also let the LLMs to try playing the puzzle by itself.

The final score will be how many steps it took the AI to solve the puzzle (the longer -> the more interesting the puzzles are!)


## Environment setup for local development
Create a ```.env``` file and enter

```OPENAI_API_KEY=[Your OpenAI API]```
```BACKEND_URL=https://your-deployed-backend.com```


## Requirement
Run ```pip install -r requirements.txt``` to install all required packages.

## Reference
[OpenAI Introduction](https://platform.openai.com/docs/api-reference/introduction)


# 2024 AI & Game Summer School Malta
## Contributors
* Fandi Meng
* Shyam Shinde
* Wenki Qiu
* Sicong Li
* Ginger Huang
