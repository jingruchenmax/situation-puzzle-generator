# TODO: history doesn't seem to be cleaned up (when re-generating full stories (and maybe even draft stories))
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
import os
from pprint import pprint

load_dotenv()
app = Flask(__name__)
client = OpenAI()
CORS(app)
history = []
draft_story_save = ""
puzzles = ""
final_story = ""
game_history = []

def generate_draft_story_message(time, place, character, objectname):
    history = []
    messages = [
        {"role": "user",
        # "content": f"Please generate a complete short story of up to 50 words using the following keywords: {time, place, character, objectname}. The story needs to have a complete narrative with cause and effect, as well as some non-daily factors."}
        "content": 
#         f"""I'm writing some situation puzzles / minute mysteries / lateral thinking puzzles, and I need some ideas.
# A situation puzzle is a short mystery story with some key hidden surprise information. 
# Can you generate a narrative within 80 words, complete with such key information, that can be turned into a situation puzzle.
# Then I'll choose which parts hidden information I want to hide, so that it can be later turned into a puzzle.
# Please include the following keywords in your narrative: {time, place, character, objectname}.
# """
        f"Please generate a mystery short story of up to 60 words in simple English using the following keywords: {time, place, character, objectname}. \
          The story needs to have at least 1 major believable twist. Make sure the story includes all the causes for the twist."
#         f"""Can you write me a short situation puzzle up to 80 words, complete with the answer?
# A situation puzzle is often referred to as minute mysteries, lateral thinking puzzles or "yes/no" puzzles.
# # Situation puzzles are usually played in a group, with one person hosting the puzzle and the others asking questions which can only be answered with a "yes" or "no" answer. Depending upon the settings and level of difficulty, other answers, hints or simple explanations of why the answer is yes or no, may be considered acceptable. The puzzle is solved when one of the players is able to recite the narrative the host had in mind, in particular explaining whatever aspect of the initial scenario was puzzling.
# Please include the following key elements in your narrative: {time, place, character, objectname}.
# """
}
    ]
    history.append(messages[0])
    return messages, history

def generate_puzzle(story, history):
    messages = history.copy()
    messages.append({"role": "assistant", "content": f"{story}"})
    messages.append(
        {"role": "user", "content": f"Find five information puzzle informed or implied in the story or related to the natural, well-established traits of the time, place, character, or weapon that can be explain the cause-effect relationships. Return them in the following format without numerical numbering [\"sentence\",\"sentence\",\"sentence\",\"sentence\",\"sentence\"]"}
    )
    pprint(messages)
    history = messages.copy()
    return messages, history

def generate_final_story_prompt_v0(info_to_hide, puzzles, history):
    messages = history.copy()
    messages.append({"role": "assistant", "content": f"{puzzles}"})
    messages.append(
        {"role": "user", "content": f"Rewrite the story. The puzzle should be created by removing the selected parts from the complete story and rephrasing it as a coherent narrative with missing information. The puzzle should have a reasonable difficulty level and revolve around the hidden information. At the end of telling the story, propose a question that can be solved or explained by the hidden information. The information to be hidden are {info_to_hide}. Write the answer, which is the hidden information, in an answer narrative. Combine the story and the answer in an array like shown in the following example [\"The situation story\",\"The hidden information\"]. Return the array."}
    )
    pprint(messages)
    return messages

def generate_final_story_prompt_v1(info_to_hide, story, history):
    messages = history.copy()
    messages.append({"role": "assistant", "content": f"{story}"})
    messages.append(
        {"role": "user", "content": f"There is a story and the information {info_to_hide} which need to be hide, \
        please design a situation puzzle based on these. The puzzle should be created by removing the ‘hidden information’\
         from the complete story and rephrasing it as a coherent narrative with missing information. The puzzle should have \
         a reasonable difficulty level and revolve around the hidden information. After creating the situation puzzle, \
         please provide the answer to the puzzle, which should consist of the hidden parts of the story. \
         Combine the story and the answer in an array like shown in the following example [\"The situation story\",\"The hidden information\"]. Return the array. "}
    )
    pprint(messages)
    return messages

def generate_story_options(request):
    messages = [
        {"role": "user", "content": request}
    ]
    return messages

@app.route('/')
def index():
    backend_url = os.getenv('BACKEND_URL')
    return render_template('index.html', backend_url=backend_url)

@app.route('/generate_draft_story', methods=['POST'])
def draft_story():
    global draft_story_save, history
    data = request.get_json()
    pprint(data)
    time_data = data.get('section1')
    place_data = data.get('section2')
    character_data = data.get('section3')
    reason_data = data.get('section4')
    if not data:
        return jsonify({'error': 'No query provided'}), 400
    try:
        messages, history = generate_draft_story_message(time_data, place_data, character_data, reason_data)
        response = client.chat.completions.create(
            # model="gpt-3.5-turbo",
            model="gpt-4",
            messages=messages
        )
        answer = response.choices[0].message.content
        pprint(response.choices[0].message)
        draft_story_save = answer
        return jsonify({'answer': answer})
    except Exception as e:
        pprint(f"General error: {e}")
        return jsonify({'error': f"General error: {e}"}), 500

@app.route('/get_options', methods=['GET'])
def get_options():
    pprint("get_options")
    query_type = request.args.get('type')
    if not query_type:
        return jsonify({'error': 'No query type provided'}), 400
    prompts = {
        "time": "Provide 6 different times, including various scales such as days, months, years, seasons, eras, or even abstract concepts related to time, in a json array format, for example, [\"Evening\", \"May\", \"Night\", \"1999\", \"Morning\", \"Monday\"]",
        "place": "Provide 6 different places, covering a wide range of places like cities, countries, continents, landmarks or even fictional locations, in a json array format, for example, [\"Paris\", \"New York\", \"Tokyo\", \"Beach\", \"Mountain\", \"Desert\"]",
        "character": "Provide 6 different characters, including diverse types even non-human creatures in the format of an array of strings, for example, [\"Hero\", \"Villain\", \"Sidekick\", \"Mentor\", \"Monster\", \"Princess\"]",
        "object": "Provide 6 different objects, ranging from everyday items to unique, mysterious, or technologically advanced objects in a json array format, for example, [\"Gun\", \"Wound\", \"Weapon\", \"Scissors\", \"Shoes\", \"Fruit\"]"
    }
    prompt = prompts.get(query_type)
    try:
        response = client.chat.completions.create(
            # model="gpt-3.5-turbo",
            model="gpt-4",
            messages=generate_story_options(prompt)
        )
        answer = response.choices[0].message.content
        pprint(response.choices[0].message.content)
        return jsonify({'options': answer})
    except Exception as e:
        pprint(f"General error: {e}")
        return jsonify({'error': f"General error: {e}"}), 500

@app.route('/get_puzzle_options', methods=['GET'])
def get_puzzle_options():
    global draft_story_save, history
    try:
        messages, history = generate_puzzle(draft_story_save, history)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages
        )
        answer = response.choices[0].message.content
        pprint(response.choices[0].message.content)
        return jsonify({'options': answer})
    except Exception as e:
        pprint(f"General error: {e}")
        return jsonify({'error': f"General error: {e}"}), 500

@app.route('/generate_final_story', methods=['POST'])
def generate_final_story():
    global draft_story_save, history
    hiddeninfo = request.get_json()
    pprint(hiddeninfo)
    try:
        messages = generate_final_story_prompt_v1(hiddeninfo, draft_story_save, history)
        pprint(messages)
        response = client.chat.completions.create(
            model="gpt-4",
            messages=messages
        )
        answer = response.choices[0].message.content
        pprint(response.choices[0].message.content)
        return jsonify({'story': answer})
    except Exception as e:
        pprint(f"General error: {e}")
        return jsonify({'error': f"General error: {e}"}), 500

def generate_ai_game_play(puzzle, game_history):
    messages = game_history.copy()
    messages.append({"role": "assistant", "content": f"Puzzle: {puzzle}"})
    # messages.append(
    #     {"role": "user", "content": f"There is a situation puzzle and please play it, the game host should give you yes or no answer\
    #      for your question and you can do the reasoning based on the game history,\
    #      it would be better if you can find out the truth in fewer steps. Now you can ask question like the example [\"Question\"], \
    #      or if you already know the truth, you can just reply with the truth. Please return the array format. "}
    # )
    messages.append(
        {"role": "user", "content": f"You are a good puzzle game solver. There is a situation puzzle and you need to solve the puzzle with as few questions as possible.\
        This is the game history:{game_history}, You can do the reasoning based on the history\
        If you are confident that you know the truth, please give the answer directly. If not, you can ask 1 yes or no question to get clues.\
        Please return your answer in correct json array format."}
    )
    # messages.append(
    #     {"role": "user", "content": f"You are an expert puzzle game solver. There is a situation puzzle that you need to solve with as few questions as possible.\
    #     You have already asked {n_question} questions, and this is the game history: {game_history}. Use this history to inform your reasoning.\
    #     You need to ask yes/no questions to gather information based on the incomplete story and gradually guess the truth\
    #     You need to ask yes/no questions to gain more information. The host will only respond with 'yes', 'no', or 'irrelevant'. Avoid asking 'why' questions.\
    #     When you think you have definitely guessed the answer, stop asking questions and respond following this format\
    #     In each round of conversation, you can only ask one yes/no question or provide an answer, not multiple questions at once\
    #     If you are confident that you know the truth, please provide the full answer directly in a detailed and reasoned manner.\
    #     If you need more information, ask one specific yes or no question to gather more clues, demonstrating your reasoning process. Your question should aim to uncover critical information efficiently.\
    #     Please return your response in the following array format: ['question: Your question here'] or ['answer: Your answer here'].\
    #     Remember, your goal is to solve the puzzle with minimal questions and maximal accuracy."
    #      }
    # )
    pprint(messages)
    return messages

@app.route('/ai_game_play', methods=['POST'])
def ai_game_play():
    global draft_story_save, history
    puzzle = request.get_json()
    pprint(puzzle)
    try:
        messages = generate_ai_game_play(puzzle, game_history)
        pprint(messages)
        response = client.chat.completions.create(
            # model="gpt-3.5-turbo",
            model="gpt-4",
            messages=messages
        )
        answer = response.choices[0].message.content
        pprint(response.choices[0].message.content)
        return jsonify({'question': answer})
    except Exception as e:
        pprint(f"General error: {e}")
        return jsonify({'error': f"General error: {e}"}), 500


def generate_ai_game_host(puzzle, true_answer, question):
    messages = game_history.copy()
    messages.append({"role": "assistant", "content": f"Puzzle:{puzzle}, Answer:{true_answer}, Player's question:{question}"})
    # messages.append(
    #     {"role": "user",
    #      "content": f"You are the host of a situation puzzle game. This is the puzzle and its answer, please based on \
    #      this to answer ['yes'] or ['no'] to the player's question in an array format. And if the player's question is \
    #      the truth roughly match the puzzle answer, please respond ['solved']"}
    # )
    messages.append(
        {"role": "user",
         "content": f"You are the host of a situation puzzle game. Here is the puzzle: {puzzle} and its answer: {true_answer}. \
         The player has responded with: {true_answer}. If the player's response is a question, please answer it with [\"yes\"] or [\"no\"] based strictly on the given puzzle and answer. \
         If the player's response is an answer, please evaluate it. If the player's answer matches the provided answer exactly, respond with [\"right\"]. If it does not match, respond with [\"wrong\"]. \
         Remember, the puzzle is: {puzzle} and the correct answer is: {true_answer}. \
         Please reply in an array format and do not provide any additional commentary."
         }
    )
    pprint(messages)
    return messages

@app.route('/ai_game_host', methods=['POST'])
def ai_game_host():
    data = request.get_json()
    pprint(data)
    puzzle = data["puzzle"]
    true_answer = data["true_answer"]
    question = data["question"]
    try:
        messages = generate_ai_game_host(puzzle, true_answer, question)
        pprint(messages)
        response = client.chat.completions.create(
            # model="gpt-3.5-turbo",
            model="gpt-4",
            messages=messages
        )
        answer = response.choices[0].message.content
        pprint(response.choices[0].message.content)
        return jsonify({'answer': answer}) # TODO:
    except Exception as e:
        pprint(f"General error: {e}")
        return jsonify({'error': f"General error: {e}"}), 500


def generate_split_story(story, history):
    messages = history.copy()
    messages.append({"role": "assistant", "content": f"{story}"})
    messages.append(
        {"role": "user", "content":
        f"Please split the provided story text into fragmented segments, with each segment containing some information. \
        Please make every segment contains up to 8 words, return them in a json list like [\"segment 1\",\"segment 2\", ...] \
        Here's the story: {story}."}
    )
    pprint(messages)
    history = messages.copy()
    return messages, history

@app.route('/split_story', methods=['POST'])
def split_story():
    global history
    data = request.get_json()
    pprint(data)
    story = data["story"]
    try:
        messages, history = generate_split_story(story, history)
        pprint(messages)
        response = client.chat.completions.create(
            # model="gpt-3.5-turbo",
            model="gpt-4",
            messages=messages
        )
        answer = response.choices[0].message.content
        pprint(response.choices[0].message.content)
        return jsonify({'split_story_segments': answer})
    except Exception as e:
        pprint(f"General error: {e}")
        return jsonify({'error': f"General error: {e}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5010, debug=True)
