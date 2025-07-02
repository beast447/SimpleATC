# EasyATC - Virtual ATC Phraseology Trainer (MVP)
# SimpleATC - Virtual ATC Phraseology Trainer (MVP)

A speech-enabled web application that helps pilots master realistic radio communications using randomized ATC scenarios and intelligent feedback.

## 🚀 Features (MVP)

- **Speech Recognition**: Uses Web Speech API for real-time voice input
- **Multiple Scenario Types**: Tower departures/arrivals, Ground control, Approach control
- **Intelligent Scoring**: Analyzes phraseology against FAA standards
- **Real-time Feedback**: Color-coded scoring with detailed improvement tips
- **Session Tracking**: Track your progress with attempt statistics
- **Aviation Phonetics**: Recognizes both standard and phonetic pronunciations

## 🎯 Perfect For

- VATSIM/IVAO pilots preparing for online flights
- Student pilots learning FAA phraseology
- CFIs looking for practice tools for students
- Anyone wanting to improve radio communication skills

## 🛠️ Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Modern web browser (Chrome, Edge, or Safari recommended for speech recognition)
- Microphone access

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd simpleatc-mvp
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## 🎮 How to Use

1. **Grant Microphone Access**: Allow the browser to access your microphone when prompted
2. **Select Scenario Type**: Choose from different ATC communication types
3. **Listen to ATC**: Read the ATC instruction displayed on screen
4. **Speak Your Response**: Click the microphone button and speak your readback
5. **Get Instant Feedback**: See your score and detailed improvement tips
6. **Practice More**: Try new scenarios to improve your skills

## 📋 Scenario Types

- **Tower Departures**: Takeoff clearances and runway assignments
- **Tower Arrivals**: Landing clearances and pattern instructions  
- **Ground Control**: Taxi instructions and ground movements
- **Approach Control**: Altitude changes and heading assignments

## 🎯 Scoring System

- **90-100%**: Excellent - Perfect phraseology
- **75-89%**: Good - Minor elements missing
- **60-74%**: Decent - Several key elements missing
- **Below 60%**: Needs improvement

## 🔧 Technical Details

### Built With

- **React 18** - Frontend framework
- **Vite** - Build tool and dev server
- **Web Speech API** - Browser-native speech recognition
- **Vanilla CSS** - Custom styling with gradient backgrounds

### Project Structure

```
src/
├── components/           # React components
│   ├── ATCScenario.jsx  # Main scenario component
│   ├── SpeechInput.jsx  # Microphone and speech handling
│   ├── ScoreDisplay.jsx # Feedback and scoring display
│   └── ScenarioSelector.jsx # Scenario type selection
├── data/
│   └── scenarios.js     # Hardcoded ATC scenarios
├── hooks/
│   └── useSpeechRecognition.js # Speech API wrapper
├── utils/
│   └── scoring.js       # Phraseology analysis logic
└── App.jsx             # Main application
```

## 🌟 Future Enhancements

This MVP provides the foundation for additional features:

- User accounts and progress tracking
- More scenario types (Center, Clearance Delivery)
- Community-generated scenarios
- Multiplayer training sessions
- Mobile app version
- Whisper integration for better accuracy
- ICAO phraseology support

## 🎧 Tips for Best Experience

- Use headphones to avoid audio feedback
- Speak clearly and at normal volume
- Ensure stable internet connection
- Use Chrome or Edge for best speech recognition

## 📖 Learn More

- [FAA Phraseology Guide](https://www.faa.gov/air_traffic/publications/atpubs/aim_html/)
- [VATSIM Pilot Resources](https://www.vatsim.net/pilots/flight-information)

## 🤝 Contributing

This is an MVP - contributions and suggestions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

MIT License - feel free to use this project as a foundation for your own ATC training tools. 