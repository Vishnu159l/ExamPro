from flask import Flask, request, render_template, jsonify, send_from_directory
import requests

app = Flask(__name__, static_folder='.', static_url_path='')

# Hugging Face API for Chatbot
API_URL = "https://api-inference.huggingface.co/models/gpt2"
API_KEY = "your_huggingface_api_key"  # Replace with your actual Hugging Face API key

@app.route("/")
def index():
    return send_from_directory(".", "home.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message")
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    try:
        # Send message to Hugging Face API
        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "inputs": f"ExamPro Assistant: {user_message}\nResponse:",
            "parameters": {
                "max_new_tokens": 100,
                "temperature": 0.7,
                "top_k": 50,
                "top_p": 0.95
            }
        }
        
        response = requests.post(API_URL, headers=headers, json=payload)
        response.raise_for_status()  # Raise an exception for bad status codes

        # Get chatbot reply
        data = response.json()
        
        # Extract the generated text
        if isinstance(data, list) and data and 'generated_text' in data[0]:
            bot_reply = data[0]['generated_text'].split('Response:')[-1].strip()
        elif isinstance(data, dict) and 'generated_text' in data:
            bot_reply = data['generated_text'].split('Response:')[-1].strip()
        else:
            bot_reply = "I'm not sure, could you clarify your question?"

        return jsonify({"response": bot_reply})

    except requests.RequestException as e:
        print(f"API Request Error: {e}")
        return jsonify({"error": "Failed to get response from chatbot"}), 500
    except Exception as e:
        print(f"Unexpected Error: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)