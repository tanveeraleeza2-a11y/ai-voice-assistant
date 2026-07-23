from flask import Flask, render_template, request, jsonify
from groq import Groq
from dotenv import load_dotenv
import os

# Load .env
load_dotenv()

app = Flask(__name__)

# Groq Client
client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"reply": "No data received."})

        user_message = data.get("message", "")

        if user_message.strip() == "":
            return jsonify({"reply": "Please say something."})

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
- Be friendly and helpful.
"""
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            temperature=0.5,
            max_tokens=150
        )
        ai_reply = response.choices[0].message.content
        return jsonify({
            "reply": ai_reply
        })
    except Exception as e:
        return jsonify({
            "reply": f"Error: {str(e)}"
        })
if __name__ == "__main__":
    app.run(debug=True)