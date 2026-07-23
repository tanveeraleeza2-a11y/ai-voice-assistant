/*=========================================
        NOVA AI ASSISTANT
=========================================*/

// Elements
const startBtn = document.getElementById("start-btn");
const startChatBtn = document.getElementById("start-chat");
const endBtn = document.getElementById("end-btn");
const clearBtn = document.getElementById("clear-btn");

const userText = document.getElementById("user-text");
const aiText = document.getElementById("ai-text");
const statusText = document.getElementById("status-text");

// Speech Recognition
const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();

recognition.lang = "en-US";
recognition.continuous = true;
recognition.interimResults = false;

let listening = false;

//=========================================
// Start Listening
//=========================================

function startListening(){

    if(listening) return;

    listening = true;

    statusText.innerHTML="🎤 Listening...";

    recognition.start();

}

//=========================================
// Stop Listening
//=========================================

function stopListening(){

    listening=false;

    recognition.stop();

    speechSynthesis.cancel();

    statusText.innerHTML="🔴 Chat Ended";

}

//=========================================
// Buttons
//=========================================

startBtn.onclick=startListening;
startChatBtn.onclick=startListening;
endBtn.onclick=stopListening;

clearBtn.onclick=()=>{

    stopListening();

    userText.innerHTML="Waiting for your voice...";

    aiText.innerHTML="Hello 👋<br><br>Ask me anything...";

    statusText.innerHTML="🟢 Ready";

}

//=========================================
// AI Voice using Browser TTS
//=========================================

function speak(text){

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang="en-US";

    utterance.rate=1;

    utterance.pitch=1;

    statusText.innerHTML="🔊 Speaking...";

    utterance.onend=()=>{

        if(listening){

            statusText.innerHTML="🎤 Listening...";

            setTimeout(()=>{

                try{

                    recognition.start();

                }
                catch(e){}

            },500);

        }

    };

    speechSynthesis.speak(utterance);

}

//=========================================
// Speech Result
//=========================================

recognition.onresult=async(event)=>{

    const last=event.results.length-1;

    const message=event.results[last][0].transcript.trim();

    if(message==="") return;

    userText.innerHTML=message;

    statusText.innerHTML="🤖 Thinking...";

    try{

        recognition.stop();

        const response=await fetch("/chat",{

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                message:message

            })

        });

        const data=await response.json();

        aiText.innerHTML=data.reply;

        speak(data.reply);

    }

    catch(error){

        aiText.innerHTML="Server Error. Please try again.";

        statusText.innerHTML="❌ Error";

    }

};

//=========================================
// Restart Recognition
//=========================================

recognition.onend=()=>{

    if(listening && !speechSynthesis.speaking){

        try{

            recognition.start();

        }

        catch(e){}

    }

};

//=========================================
// Errors
//=========================================

recognition.onerror=(event)=>{

    if(event.error==="not-allowed"){

        listening=false;

        statusText.innerHTML="❌ Microphone Permission Denied";

    }

};

//=========================================
// Settings
//=========================================

const settingsBtn=document.getElementById("settings-btn");

if(settingsBtn){

settingsBtn.onclick=()=>{

alert(`Nova AI Assistant

Version : 2.0

Backend : Flask

LLM : Groq

Voice : Browser SpeechSynthesis`);

}

}

//=========================================
// Load
//=========================================

window.onload=()=>{

statusText.innerHTML="🟢 Ready";

userText.innerHTML="Waiting for your voice...";

aiText.innerHTML="Hello 👋<br><br>How can I help you today?";

};

console.log("Nova AI Loaded Successfully");