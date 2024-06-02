from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI

app = Flask(__name__)
client = OpenAI()
CORS(app)

def generate_query_message(query_input):
    messages = [
        {"role": "system", "content": "You are StorySmithGPT and you excel at crafting immersive and engaging stories. Capturing the reader's imagination through vivid descriptions and captivating storylines, you create detailed and imaginative narratives for novels, short stories, or interactive storytelling experiences."},
        {"role": "user", "content": query_input}
    ]
    return messages

def generate_draft_story_message(time,place,character,death):
    messages = [
        {"role": "user", "content": f"Please generate a short murder mystery story (in 4 to 6 sentences) with the following information: At {time}, in {place}, {character} met their untimely demise due to {death}."}
    ]
    return messages

@app.route('/query', methods=['POST'])
def query():
    data = request.get_json()
    query = data.get('query')
    
    if not query:
        return jsonify({'error': 'No query provided'}), 400

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=generate_query_message(query)
        )
        answer = response.choices[0].message.content
        print(response.choices[0].message)
        return jsonify({'answer': answer})
    except Exception as e:
        print(f"General error: {e}")
        return jsonify({'error': f"General error: {e}"}), 500
    
@app.route('/generate_draft_story', methods=['POST'])
def draft_story():
    data = request.get_json()
    print(data)
    time_data = data.get('section1')
    place_data = data.get('section2')
    character_data = data.get('section3')
    reason_data = data.get('section4')
    if not query:
        return jsonify({'error': 'No query provided'}), 400
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=generate_draft_story_message(time_data,place_data,character_data,reason_data)
        )
        answer = response.choices[0].message.content
        print(response.choices[0].message)
        return jsonify({'answer': answer})
    except Exception as e:
        print(f"General error: {e}")
        return jsonify({'error': f"General error: {e}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)


