import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { OpenAI } from 'openai';
import { useNavigate } from 'react-router-dom';

// Import data sources
import { schemes as allSchemes } from '../data/schemes.js';
import { kisanCredit } from '../data/schemeDetails/kisanCredit.js';
import { pmfby } from '../data/schemeDetails/pmfby.js';
import { gangaKalyana } from '../data/schemeDetails/gangaKalyana.js';

const Ramanna = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableVoice, setAvailableVoice] = useState(null);
  const chatContainerRef = useRef(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const speechQueue = useRef([]);
  const isSpeaking = useRef(false);
  const navigate = useNavigate();

  const [isContinuousListening, setIsContinuousListening] = useState(false);

  const genAI = new GoogleGenerativeAI("");
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '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',
    dangerouslyAllowBrowser: true
  });

  console.log("OpenAI API Key configured:", !!import.meta.env.VITE_OPENAI_API_KEY);

  // Enhanced speech synthesis with better Kannada support
  const speak = (text) => {
    console.log("Ramanna speaking:", text);
    const utterance = new SpeechSynthesisUtterance(text);
    
    let kannadaVoice = null;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
        kannadaVoice = voices.find(voice => voice.lang === 'kn-IN' && voice.name.toLowerCase().includes('male'));
        if (!kannadaVoice) {
            kannadaVoice = voices.find(voice => voice.lang === 'kn-IN');
        }
    }
    
    if (kannadaVoice) {
      utterance.voice = kannadaVoice;
    } else if (availableVoice) {
        utterance.voice = availableVoice;
    }
    utterance.lang = 'kn-IN';

    utterance.onstart = () => {
        isSpeaking.current = true;
    };

    utterance.onend = () => {
        isSpeaking.current = false;
        console.log("Bot finished speaking.");
    };
    window.speechSynthesis.speak(utterance);
  };

  // Helper functions to format data into Kannada
  const formatBankLoanInfoKannada = (bank) => {
    let info = `${bank.bank_name.kn || bank.bank_name} (${bank.loan_type.kn}): `;
    info += `ಬಡ್ಡಿ ದರ ${bank.interest_rate_min}% ರಿಂದ ${bank.interest_rate_max}%. `;
    if (bank.special_features.kn && bank.special_features.kn.length > 0) {
        info += `ವಿಶೇಷ ಲಕ್ಷಣಗಳು: ${bank.special_features.kn.join(', ')}. `;
    }
    info += `ಹೆಚ್ಚಿನ ವಿವರಗಳಿಗಾಗಿ, ದಯವಿಟ್ಟು ಸಾಲ ವಿಭಾಗವನ್ನು ಪರಿಶೀಲಿಸಿ.`;
    return info;
  };

  const formatFdRateInfoKannada = (bank) => {
      let info = `${bank.bank_name.kn || bank.bank_name.en} ಸ್ಥಿರ ಠೇವಣಿ (FD) ದರಗಳು: `;
      const exampleRates = bank.rates.slice(0, 3).map(r => `${r.duration} ಕ್ಕೆ ${r.rate}%`).join(', ');
      info += exampleRates + ". ";
      if (bank.senior_citizen_bonus > 0) {
          info += `ಹಿರಿಯ ನಾಗರಿಕರಿಗೆ ${bank.senior_citizen_bonus}% ಹೆಚ್ಚುವರಿ ಬಡ್ಡಿ. `;
      }
      info += `ಹೆಚ್ಚಿನ ವಿವರಗಳಿಗಾಗಿ, ದಯವಿಟ್ಟು FD ದರಗಳ ವಿಭಾಗವನ್ನು ಪರಿಶೀಲಿಸಿ.`;
      return info;
  };

  const formatSchemeInfoKannada = (schemeDetails, mainSchemeEntry) => {
      if (!schemeDetails) return `${mainSchemeEntry.title.kn} ಬಗ್ಗೆ ಸಾಮಾನ್ಯ ಮಾಹಿತಿ ನಮ್ಮ ಯೋಜನೆಗಳ ಪುಟದಲ್ಲಿ ಲಭ್ಯವಿದೆ.`;
      let info = `${schemeDetails.title.kn}: ${schemeDetails.description.kn}. `;
      info += `ಹೆಚ್ಚಿನ ವಿವರಗಳಿಗಾಗಿ ಮತ್ತು ಅರ್ಜಿ ಸಲ್ಲಿಸಲು, ದಯವಿಟ್ಟು ನಮ್ಮ ಯೋಜನೆಗಳ ಪುಟದಲ್ಲಿ ಈ ಯೋಜನೆಯನ್ನು ಪರಿಶೀಲಿಸಿ.`;
      return info;
  };

  const constructGeminiPrompt = (userInputText) => {
    return `
You are Ramanna, an AI assistant for farmers in Karnataka, India. You understand both Kannada and English.

USER INPUT: "${userInputText}"

Analyze this user input and classify it into one of these intents. Respond ONLY with a valid JSON object:

For crop sales: {"intent": "add_crop_transaction", "parameters": {"item_name": "crop_name", "quantity": number, "price": number, "buyer_name": "buyer_name"}}
For navigation: {"intent": "navigate", "parameters": {"path": "/page_name"}}
For questions: {"intent": "general_query", "parameters": {"query_text": "original question", "response_message": "helpful answer in Kannada"}}
For unclear requests: {"intent": "clarify", "parameters": {"message": "clarification question in Kannada"}}

IMPORTANT: 
- Always respond with valid JSON only
- For general_query, provide a direct helpful response_message in Kannada
- Be helpful for Karnataka farmers with agricultural questions
`;
  };

  // MAIN PROCESSING FUNCTION - Now displays speech-to-text immediately
  const processAndRespond = async (userInputText) => {
    // Display the user's input immediately (speech-to-text) with indicator
    console.log("Displaying user input:", userInputText);
    setMessages(prev => [...prev, { type: 'user', text: userInputText, isTranscribed: true }]);
    setLoading(true);

    const thinkingMessage = "ಯೋಚಿಸುತ್ತಿದ್ದೇನೆ...";
    setMessages(prev => [...prev, { type: 'bot', text: thinkingMessage, isThinking: true }]);

    try {
      const prompt = constructGeminiPrompt(userInputText);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let aiResponseText = response.text();

      setMessages(prev => prev.filter(msg => !msg.isThinking)); // Remove thinking message
      
      console.log("Gemini raw response:", aiResponseText);

      // Extract JSON from markdown code block
      const jsonMatch = aiResponseText.match(/\`\`\`json\s*([\s\S]*?)\s*\`\`\`/);
      if (jsonMatch && jsonMatch[1]) {
        aiResponseText = jsonMatch[1];
        console.log("Extracted JSON from code block:", aiResponseText);
      }
      
      aiResponseText = aiResponseText.trim();
      
      // Sanitize string for JSON.parse
      aiResponseText = aiResponseText
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
      
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(aiResponseText);
        console.log("Successfully parsed Gemini response:", parsedResponse);
      } catch (e) {
        console.error("Failed to parse JSON response from Gemini:", aiResponseText, e);
        const jsonFallback = aiResponseText.match(/\{[\s\S]*\}/);
        if (jsonFallback) {
          try {
            parsedResponse = JSON.parse(jsonFallback[0]);
            console.log("Parsed JSON from fallback extraction:", parsedResponse);
          } catch (e2) {
            console.error("Fallback JSON parsing also failed:", e2);
          }
        }
        
        if (!parsedResponse) {
          console.log("Treating as direct response");
          const directResponse = aiResponseText.trim() || "ಕ್ಷಮಿಸಿ, ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ನನಗೆ ಸ್ವಲ್ಪ ಕಷ್ಟವಾಗುತ್ತಿದೆ. ದಯವಿಟ್ಟು ಬೇರೆ ರೀತಿಯಲ್ಲಿ ಪ್ರಯತ್ನಿಸಿ.";
          setMessages(prev => [...prev, { type: 'bot', text: directResponse }]);
          speak(directResponse);
          setLoading(false);
          return;
        }
      }

      console.log("Gemini parsed response:", parsedResponse);
      let botResponse = "";

      if (parsedResponse && parsedResponse.intent) {
        switch (parsedResponse.intent) {
          case 'add_crop_transaction':
            const params = parsedResponse.parameters;
            if (params && params.item_name && params.quantity && params.price && params.buyer_name) {
              try {
                const apiRes = await fetch('http://localhost:5000/api/crop-transactions', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    item_name: params.item_name,
                    quantity: Number(params.quantity),
                    price: Number(params.price),
                    buyer_name: params.buyer_name,
                  }),
                });
                if (apiRes.ok) {
                  botResponse = `ವಹಿವಾಟು ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ: ${params.item_name}, ${params.quantity} ಕೆಜಿ, ₹${params.price}, ಖರೀದಿದಾರರು ${params.buyer_name}.`;
                } else {
                  botResponse = "ಕ್ಷಮಿಸಿ, ವಹಿವಾಟನ್ನು ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.";
                }
              } catch (apiErr) {
                console.error("API Call failed:", apiErr);
                botResponse = "ವಹಿವಾಟನ್ನು ಉಳಿಸುವಾಗ ದೋಷ ಕಂಡುಬಂದಿದೆ.";
              }
            } else {
              botResponse = "ವಹಿವಾಟನ್ನು ಉಳಿಸಲು ದಯವಿಟ್ಟು ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ನೀಡಿ (ಬೆಳೆ, ಪ್ರಮಾಣ, ಬೆಲೆ, ಖರೀದಿದಾರ).";
            }
            break;
          case 'navigate':
            if (parsedResponse.parameters && parsedResponse.parameters.path) {
              navigate(parsedResponse.parameters.path);
              botResponse = `'${parsedResponse.parameters.path}' ಪುಟಕ್ಕೆ ನ್ಯಾವಿಗೇಟ್ ಮಾಡಲಾಗುತ್ತಿದೆ.`;
            } else {
              botResponse = "ಕ್ಷಮಿಸಿ, ಎಲ್ಲಿಗೆ ನ್ಯಾವಿಗೇಟ್ ಮಾಡಬೇಕೆಂದು ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ.";
            }
            break;
          case 'general_query':
            if (parsedResponse.parameters && parsedResponse.parameters.response_message) {
                botResponse = parsedResponse.parameters.response_message;
            } else {
                botResponse = `"${userInputText}" ಕುರಿತು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಸ್ವೀಕರಿಸಿದ್ದೇನೆ. ರೈತರಿಗೆ ಸಹಾಯ ಮಾಡಲು ನಾನು ಇಲ್ಲಿದ್ದೇನೆ.`;
            }
            break;
          case 'clarify':
            botResponse = parsedResponse.parameters && parsedResponse.parameters.message 
                          ? parsedResponse.parameters.message 
                          : "ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಸ್ಪಷ್ಟಪಡಿಸಿ.";
            break;
          default:
            botResponse = "ಕ್ಷಮಿಸಿ, ಆ ವಿನಂತಿಯನ್ನು ಹೇಗೆ ನಿರ್ವಹಿಸಬೇಕೆಂದು ನನಗೆ ತಿಳಿದಿಲ್ಲ.";
        }
      } else {
        botResponse = aiResponseText || "ಕ್ಷಮಿಸಿ, ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಹೇಳಿ.";
      }
      
      setMessages(prev => [...prev, { type: 'bot', text: botResponse }]);
      speak(botResponse);

    } catch (error) {
      console.error("Error processing user input with Gemini:", error);
      setMessages(prev => prev.filter(msg => !msg.isThinking));
      const errorMessage = "ಕ್ಷಮಿಸಿ, ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸುವಾಗ ದೋಷ ಕಂಡುಬಂದಿದೆ.";
      setMessages(prev => [...prev, { type: 'bot', text: errorMessage }]);
      speak(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load Kannada voices
  useEffect(() => {
    const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            let knVoice = voices.find(voice => voice.lang === 'kn-IN' && voice.name.toLowerCase().includes('male'));
            if (!knVoice) {
                knVoice = voices.find(voice => voice.lang === 'kn-IN');
            }
            setAvailableVoice(knVoice);
            console.log("Kannada voice set:", knVoice);
        }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
  }, []);

  // Scroll chat to bottom on new message
  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // VOICE RECORDING FUNCTION - Captures speech and sends to Whisper API
  const startListening = async () => {
    if (isListening) {
      // Stop recording
      if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
        mediaRecorder.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], 'audio.wav', { type: 'audio/wav' });

        try {
          console.log("Sending audio to OpenAI Whisper...");
          const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
            response_format: 'text',
          });
          console.log("Whisper API call successful");

          console.log("OpenAI Whisper transcription:", transcription);
          if (transcription && transcription.trim()) {
            console.log("Processing transcribed text:", transcription.trim());
            // Process and display the transcribed text
            processAndRespond(transcription.trim());
          } else {
            console.log("No transcription received from Whisper");
            const errorMsg = "ಕ್ಷಮಿಸಿ, ನಿಮ್ಮ ಮಾತನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.";
            setMessages(prev => [...prev, { type: 'bot', text: errorMsg }]);
            speak(errorMsg);
          }
        } catch (error) {
          console.error("OpenAI Whisper error:", error);
          const errorMsg = "ಧ್ವನಿ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸುವಲ್ಲಿ ದೋಷ ಕಂಡುಬಂದಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.";
          setMessages(prev => [...prev, { type: 'bot', text: errorMsg }]);
          speak(errorMsg);
        }

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsListening(true);
      console.log("Audio recording started.");
    } catch (error) {
      console.error("Error starting audio recording:", error);
      const errorMsg = "ಮೈಕ್ರೋಫೋನ್ ಪ್ರವೇಶವನ್ನು ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಅನುಮತಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.";
      setMessages(prev => [...prev, { type: 'bot', text: errorMsg }]);
      speak(errorMsg);
    }
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
      >
        <span>🎤</span>
        <span>ರಾಮಣ್ಣ</span>
      </button>

      {isOpen && (
        <>
          {/* Mobile overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50 sm:hidden z-40" 
               onClick={() => setIsOpen(false)} />
          
          {/* Chat modal */}
          <div className="fixed sm:absolute bottom-0 sm:bottom-auto left-0 right-0 sm:right-0 sm:left-auto 
                        w-full sm:w-96 bg-white rounded-t-lg sm:rounded-lg shadow-xl border border-emerald-100 
                        z-50 sm:mt-2">
            <div className="p-4 border-b border-emerald-100 bg-emerald-50">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-emerald-900">
                ರಾಮಣ್ಣನೊಂದಿಗೆ ಮಾತನಾಡಿ</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
            </div>

            {/* Messages Container - With enhanced display */}
            <div ref={chatContainerRef} className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 && (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center text-gray-500">
                    <p className="text-2xl mb-2">👋</p>
                    <p>ಹಿಯೊಗ! ಕ್ಲಿಕ್ ಮಾಡಿ ಮತ್ತು ಮಾತನಾಡಿ</p>
                  </div>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-emerald-100 text-emerald-900 border-2 border-emerald-400'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <div className="break-words leading-relaxed">
                      {message.text}
                    </div>
                    {message.isTranscribed && (
                      <div className="text-xs text-emerald-600 mt-2 italic font-medium">
                        🎤 (ಸ್ವರ ಪ್ರಯುಕ್ತಿ)
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></span>
                      <span className="text-gray-700 animate-pulse">ಯೋಚಿಸುತ್ತಿದ್ದೇನೆ...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recording Button - Enhanced with animations */}
            <div className="p-4 border-t border-emerald-100 bg-white">
              <button
                onClick={startListening}
                disabled={loading}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  isListening
                    ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse shadow-lg'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isListening ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-2 h-2 bg-white rounded-full animate-bounce"></span>
                    <span>ನಿಲ್ಲಿಸಿ (ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ)</span>
                  </span>
                ) : (
                  'ಮಾತನಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ 🎤'
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Ramanna;
