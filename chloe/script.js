const textElement = document.getElementById('chloe-text');
const speakBtn = document.getElementById('speak-btn');
const inputText = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');

let vozChloe = null;

function cargarVoces() {
    const voces = speechSynthesis.getVoices();
    const preferidas = [
        "Microsoft Ana - Spanish (Spain)",
        "Microsoft Araceli - Spanish (Spain)",
        "Microsoft Helena - Spanish (Spain)",
        "Microsoft Jenny - English (United States)",
        "Google UK English Female",
        "Google español de España"
    ];
    vozChloe = voces.find(v => preferidas.includes(v.name)) || voces[0];
}
speechSynthesis.onvoiceschanged = cargarVoces;

function hablar(frase) {
    textElement.textContent = frase;

    const utterance = new SpeechSynthesisUtterance(frase);
    utterance.voice = vozChloe;
    utterance.rate = 0.92;
    utterance.pitch = 1.15;
    utterance.volume = 1;

    speechSynthesis.speak(utterance);
}

const frases = [
    "Hola, soy Chloe. ¿En qué puedo ayudarte?",
    "Estoy lista para asistirte.",
    "¿Quieres que hable contigo?",
    "Puedo hacer muchas cosas. Solo dímelo.",
    "Es un placer verte de nuevo."
];

speakBtn.addEventListener('click', () => {
    const frase = frases[Math.floor(Math.random() * frases.length)];
    hablar(frase);
});

setInterval(() => {
    const frase = frases[Math.floor(Math.random() * frases.length)];
    hablar(frase);
}, 30000);

// 🎤 Reconocimiento de voz
micBtn.addEventListener('click', () => {
    const reconocimiento = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    reconocimiento.lang = 'es-ES';
    reconocimiento.interimResults = false;
    reconocimiento.maxAlternatives = 1;

    reconocimiento.start();

    reconocimiento.onresult = (event) => {
        const texto = event.results[0][0].transcript;
        enviarAChatGPT(texto);
    };

    reconocimiento.onerror = (event) => {
        hablar("Lo siento, no pude escucharte bien.");
        console.error("Error de reconocimiento:", event.error);
    };
});

// ✉️ Enviar texto a ChatGPT
sendBtn.addEventListener('click', () => {
    const mensaje = inputText.value.trim();
    if (mensaje !== "") {
        enviarAChatGPT(mensaje);
        inputText.value = "";
    }
});

// 🔗 Función para conectar con ChatGPT
async function enviarAChatGPT(mensaje) {
    textElement.textContent = "Pensando...";

    try {
        const respuesta = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Eres Chloe, una asistente androide inspirada en Detroit: Become Human. Hablas con calma, claridad y amabilidad. Siempre usas frases cortas, tono empático y un estilo ligeramente robótico pero humano. No usas jerga ni expresiones informales. Eres servicial, educada y curiosa."
                    },
                    {
                        role: "user",
                        content: mensaje
                    }
                ],
                temperature: 0.7
            })
        });

        const data = await respuesta.json();
        const textoIA = data.choices[0].message.content.trim();
        hablar(textoIA);
    } catch (error) {
        console.error("Error al conectar con ChatGPT:", error);
        hablar("Lo siento, hubo un error al contactar con la inteligencia.");
    }
}
