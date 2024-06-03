from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()
app = Flask(__name__)
client = OpenAI()
CORS(app)
history = []
draft_story_save = ""
puzzles = ""
final_story = ""

def generate_draft_story_message(time, place, character, death):
    history = []
    messages = [
        {"role": "user", "content": f"Please generate create a complete story suitable for designing a situation puzzle. The story should be 4 to 6 sentences long with the following information: At {time}, in {place}, {character} is found dead due to {death}. The story should have clear plot development and logical cause-and-effect relationships to facilitate the subsequent puzzle creation."}
    ]
    history.append(messages[0])
    return messages, history

def generate_puzzle(story, history):
    messages = history.copy()
    messages.append({"role": "assistant", "content": f"{story}"})
    messages.append(
        {"role": "user", "content": f"Find five information puzzle informed or implied in the story or related to the natural, well-established traits of the time, place, character, or weapon that can be explain the cause-effect relationships. Return them in the following format without numerical numbering [\"sentence\",\"sentence\",\"sentence\",\"sentence\",\"sentence\"]"}
    )
    print(messages)
    history = messages.copy()
    return messages, history

def generate_final_story_prompt(info_to_hide, puzzles, history):
    messages = history.copy()
    messages.append({"role": "assistant", "content": f"{puzzles}"})
    messages.append(
        {"role": "user", "content": f"Rewrite the story. The puzzle should be created by removing the selected parts from the complete story and rephrasing it as a coherent narrative with missing information. The puzzle should have a reasonable difficulty level and revolve around the hidden information. At the end of telling the story, propose a question that can be solved or explained by the hidden information. The information to be hidden are {info_to_hide}. Write the answer, which is the hidden information, in an answer narrative. Combine the story and the answer in an array like shown in the following example [\"The situation story\",\"The hidden information\"]. Return the array."}
    )
    print(messages)
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
    print(data)
    time_data = data.get('section1')
    place_data = data.get('section2')
    character_data = data.get('section3')
    reason_data = data.get('section4')
    if not data:
        return jsonify({'error': 'No query provided'}), 400
    try:
        messages, history = generate_draft_story_message(time_data, place_data, character_data, reason_data)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages
        )
        answer = response.choices[0].message.content
        print(response.choices[0].message)
        draft_story_save = answer
        return jsonify({'answer': answer})
    except Exception as e:
        print(f"General error: {e}")
        return jsonify({'error': f"General error: {e}"}), 500

@app.route('/get_options', methods=['GET'])
def get_options():
    query_type = request.args.get('type')
    if not query_type:
        return jsonify({'error': 'No query type provided'}), 400
    prompts = {
        "time": "Provide 6 different times in an array format, for example, [\"Evening\", \"May\", \"Night\", \"1999\", \"Morning\", \"Monday\"]",
        "place": "Provide 6 different places in an array format, for example, [\"Paris\", \"New York\", \"Tokyo\", \"Beach\", \"Mountain\", \"Desert\"]",
        "character": "Provide 6 different characters in an array format, for example, [\"Hero\", \"Villain\", \"Sidekick\", \"Mentor\", \"Monster\", \"Princess\"]",
        "weapon": "Provide 6 different weapons in an array format, for example, [\"Gun\", \"Wound\", \"Weapon\", \"Scissors\", \"Shoes\", \"Fruit\"]"
    }
    prompt = prompts.get(query_type)
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=generate_story_options(prompt)
        )
        answer = response.choices[0].message.content
        print(response.choices[0].message.content)
        return jsonify({'options': answer})
    except Exception as e:
        print(f"General error: {e}")
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
        print(response.choices[0].message.content)
        return jsonify({'options': answer})
    except Exception as e:
        print(f"General error: {e}")
        return jsonify({'error': f"General error: {e}"}), 500

@app.route('/generate_final_story', methods=['POST'])
def generate_final_story():
    global draft_story_save, history
    hiddeninfo = request.get_json()
    print(hiddeninfo)
    try:
        messages = generate_final_story_prompt(hiddeninfo, draft_story_save, history)
        print(messages)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages
        )
        answer = response.choices[0].message.content
        print(response.choices[0].message.content)
        return jsonify({'story': answer})
    except Exception as e:
        print(f"General error: {e}")
        return jsonify({'error': f"General error: {e}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5010)
