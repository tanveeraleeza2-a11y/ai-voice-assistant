from groq import Groq
client = Groq(
    api_key="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"
)
response = client.chat.completions.create(
    model="llama-3.1-8b-instant",
    messages=[
        {
            "role": "user",
            "content": "What is Artificial Intelligence?"
        }
    ]
)
print(response.choices[0].message.content)