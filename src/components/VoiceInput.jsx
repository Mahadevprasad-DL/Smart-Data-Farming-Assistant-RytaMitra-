import React, { useState, useRef } from 'react'

const VoiceInput = ({ onTransactionAdd }) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [status, setStatus] = useState(null) // Add status state
  const recognitionRef = useRef(null)

  const startListening = () => {
    try {
      if (!('webkitSpeechRecognition' in window)) {
        throw new Error('Speech recognition not supported')
      }

      recognitionRef.current = new window.webkitSpeechRecognition()
      const recognition = recognitionRef.current

      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'kn-IN'

      recognition.onstart = () => {
        setIsListening(true)
        setTranscript('')
      }

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setTranscript(transcript)
        parseTransaction(transcript)
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } catch (error) {
      console.error('Speech recognition setup failed:', error)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const parseTransaction = (text) => {
    try {
      const normalizedText = text.replace(/,/g, '')
      console.log('Input:', normalizedText)

      // Updated patterns with more crop variations
      const cropPattern = /(?:ಭತ್ತ|ರಾಗಿ|ಗೋಧಿ|ಬತ್ತ|ಪತನ)(?:ವ|ನ|ನ್ನು|ನ್ನ)?/
      const quantityPattern = /(\d+)\s*(?:kg|ಕೆಜಿ|ಕೇಜಿ|ಕೆ\.ಜಿ)/i
      const pricePattern = /(\d+)(?:\s*ರೂ|\s*₹|\s*ಗೆ|\s*ರೂಪಾಯಿ)/
      
      // Updated buyer pattern to handle variations
      const buyerPattern = /([^\s]+?)(?:ನಿಗೆ|ಗೆ)/

      // Extract matches
      const matches = {
        crop: normalizedText.match(cropPattern),
        quantity: normalizedText.match(quantityPattern),
        price: normalizedText.match(pricePattern),
        buyer: normalizedText.match(buyerPattern)
      }

      // Extract values
      const quantity = matches.quantity ? parseInt(matches.quantity[1]) : null
      const price = matches.price ? parseInt(matches.price[1]) : null
      
      // Detailed logging of matches
      console.log('Parsed components:', {
        cropFound: matches.crop?.[0],
        buyerFound: matches.buyer?.[1],
        quantityFound: quantity,
        priceFound: price,
        rawMatches: matches
      })

      if (matches.crop && matches.buyer && quantity && price) {
        const transaction = {
          item_name: matches.crop[0].replace(/[ವನ್ನು]$/, ''),
          quantity: quantity,
          price: price,
          buyer_name: matches.buyer[1].replace(/[ನ]$/, '') // Remove ನ suffix if present
        }

        console.log('Valid transaction:', transaction)
        setStatus('processing')
        submitTransaction(transaction)
      } else {
        const missingFields = {
          crop: !matches.crop,
          buyer: !matches.buyer,
          quantity: !quantity,
          price: !price
        }
        console.error('Missing fields:', missingFields)
        throw new Error(`Missing: ${Object.entries(missingFields)
          .filter(([_, missing]) => missing)
          .map(([field]) => field)
          .join(', ')}`)
      }
    } catch (error) {
      console.error('Parsing error:', {
        message: error.message,
        input: text,
      })
      setStatus('error')
      speakError()
    }
  }

  const submitTransaction = async (transaction) => {
    try {
      const response = await fetch('http://localhost:5000/api/crop-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
      })
      
      if (!response.ok) throw new Error('Failed to add transaction')
      
      setStatus('success')
      speakConfirmation(transaction)
      onTransactionAdd() // Call the callback to refresh transactions
      
      // Reset after 3 seconds
      setTimeout(() => {
        setStatus(null)
        setTranscript('')
      }, 3000)
      
    } catch (error) {
      console.error('Submission error:', error)
      setStatus('error')
      speakError()
    }
  }

  const speakConfirmation = (transaction) => {
    const msg = new SpeechSynthesisUtterance()
    msg.lang = 'kn-IN'
    // Add any confirmation message logic here
  }

  const speakError = () => {
    const msg = new SpeechSynthesisUtterance()
    msg.lang = 'kn-IN'
    msg.text = 'ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
    window.speechSynthesis.speak(msg)
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">ಧ್ವನಿ ಇನ್‌ಪುಟ್</h2>
      <div className="text-center mb-4">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`p-4 rounded-full ${
            isListening ? 'bg-red-500' : 'bg-blue-500'
          } text-white hover:opacity-90 transition-all`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      </div>
      {transcript && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <p className="text-gray-700">{transcript}</p>
        </div>
      )}
      {status === 'processing' && (
        <div className="mt-2 p-2 bg-yellow-100 text-yellow-700 rounded">
          ವಹಿವಾಟು ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿ...
        </div>
      )}
      {status === 'success' && (
        <div className="mt-2 p-2 bg-green-100 text-green-700 rounded">
          ವಹಿವಾಟು ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ
        </div>
      )}
      {status === 'error' && (
        <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
          ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.
        </div>
      )}
    </div>
  )
}

export default VoiceInput