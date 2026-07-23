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
// Variables
let listening = false;
let audioPlayer = null;
//=========================================
// START LISTENING
//=========================================
function startListening(){
    if(listening) return;
    listening = true;
    statusText.innerHTML="🎤 Listening...";
    recognition.start();
}
//=========================================
// STOP LISTENING
//=========================================
function stopListening(){
    listening = false;
    recognition.stop();
    statusText.innerHTML="🔴 Chat Ended";
    // Stop AI Voice
    if(audioPlayer){
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
    }
}
//=========================================
// BUTTON EVENTS
//=========================================
startBtn.onclick = startListening;
startChatBtn.onclick = startListening;
endBtn.onclick = stopListening;
//=========================================
// NEW CHAT
//=========================================
clearBtn.onclick = ()=>{
    stopListening();
    userText.innerHTML="Waiting for your voice...";
    aiText.innerHTML="Hello 👋<br><br>Ask me anything...";
    statusText.innerHTML="🟢 Ready";
}
//=========================================
// SPEECH RESULT
//=========================================
recognition.onresult = async (event) => {
    // Stop old voice if it is still playing
if(audioPlayer){
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
}
    const last = event.results.length - 1;
    const message = event.results[last][0].transcript.trim();
    if(message==="") return;
    userText.innerHTML = message;
    statusText.innerHTML = "🤖 Thinking...";
    try{
        const response = await fetch("/chat",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                message:message
            })
        });
        const data = await response.json();
        aiText.innerHTML = data.reply;
        statusText.innerHTML = "🟢 Ready";
        // Play Voice
        if(data.audio){
            if(audioPlayer){
                audioPlayer.pause();
                audioPlayer.currentTime = 0;
            }
            audioPlayer = new Audio(data.audio + "?t=" + new Date().getTime());
            // Pause microphone while AI speaks
try{
    recognition.stop();
}
catch(e){}
statusText.innerHTML="🔊 Speaking...";
audioPlayer.play();
        }
    }
    catch(error){
        aiText.innerHTML =
        "Server Error. Please try again.";
        statusText.innerHTML = "❌ Error";
    }
    setTimeout(()=>{
    if(listening){
        statusText.innerHTML="🎤 Listening...";
    }
},5000);
};
//=========================================
// RESTART LISTENING AUTOMATICALLY
//=========================================
recognition.onend = () => {
    if(listening){
        setTimeout(()=>{
            try{
                recognition.start();
            }
            catch(e){}
        },500);
    }
};
//=========================================
// RECOGNITION ERRORS
//=========================================
recognition.onerror = (event)=>{
    console.log(event.error);
    if(event.error==="not-allowed"){
        statusText.innerHTML="❌ Microphone Permission Denied";
        listening=false;
        return;
    }
    if(event.error==="no-speech"){
        statusText.innerHTML="🎤 Listening...";
        return;
    }
    if(event.error==="aborted"){
        return;
    }
    statusText.innerHTML="⚠ Microphone Error";
};
//=========================================
// AFTER AI FINISHES SPEAKING
//=========================================
document.addEventListener("click",()=>{
    if(audioPlayer){
        audioPlayer.onended = () => {
    if(listening){
        statusText.innerHTML="🎤 Listening...";
        setTimeout(()=>{
            try{
                recognition.start();
            }
            catch(e){}
        },400);
    }
}
            }
        }
    );
//=========================================
// SETTINGS BUTTON
//=========================================
const settingsBtn=document.getElementById("settings-btn");
if(settingsBtn){
settingsBtn.onclick=()=>{
alert(
`Nova AI Assistant
Version : 2.0
Language : English
Backend : Flask
LLM : Groq (Llama 3.1)
Speech : Google Speech Recognition
Voice : Google TTS`
);
}
}
//=========================================
// PAGE LOAD
//=========================================
window.onload=()=>{
statusText.innerHTML="🟢 Ready";
userText.innerHTML="Waiting for your voice...";
aiText.innerHTML="Hello 👋<br><br>How can I help you today?";
};
console.log("Nova AI Loaded Successfully"); 