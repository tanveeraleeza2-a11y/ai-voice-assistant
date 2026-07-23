from flask import Flask, render_template, request, jsonify
from groq import Groq
from dotenv import load_dotenv
from gtts import gTTS
import os
# Load .env
load_dotenv()
app = Flask(__name__)
# Groq Client
client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)
# Audio Folder
AUDIO_FOLDER = "static/audio"
os.makedirs(AUDIO_FOLDER, exist_ok=True)
@app.route("/")
def home():
    return render_template("index.html")
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message")
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
    {
    "role": "system",
    "content": """
You are Nova AI, a professional AI Voice Assistant.

Rules:
- Answer in simple English.
- Keep normal answers short (2 to 4 lines).
- If the user asks for programming code, always provide complete working code.
- Support Python, C++, Java, HTML, CSS, JavaScript, SQL and other programming languages.
- Give a short explanation after the code.
- If the user asks for essays, emails or notes, provide them clearly.
- Be friendly and helpful.
"""
},
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            temperature=0.5,
            max_tokens=120 
        )
        ai_reply = response.choices[0].message.content
        # Generate Voice
        tts = gTTS(text=ai_reply, lang="en")
        audio_path = os.path.join(AUDIO_FOLDER, "reply.mp3")
        tts.save(audio_path)
        return jsonify({
            "reply": ai_reply,
            "audio": "/static/audio/reply.mp3"
        })
    except Exception as e:
        return jsonify({
            "reply": f"Error: {str(e)}"
        })
if __name__ == "__main__":
    app.run(debug=True)