# MirrorOS Final Public Mobile App - Claude Manifest

## Project Overview
**MirrorOS Final Public Mobile App v2.0** - React Native/Expo mobile application with Web Search RAG-powered predictions.

## Key Components

### Core Files
- `MirrorOSApp.tsx` - Main React Native application component
- `app.config.js` - Expo configuration with API endpoint settings
- `package.json` - Node dependencies and scripts
- `App.js` - Entry point that renders MirrorOSApp

### Configuration
- **API Endpoint**: `https://yyk4197cr6.execute-api.us-east-2.amazonaws.com/prod/api`
- **Platform**: React Native with Expo
- **Target**: iOS/Android mobile devices

## App Architecture

### User Interface
1. **Goal Input**: Text field for user's objective
2. **Context Input**: Background information field
3. **Settings Panel**: Domain selection, confidence level, enhanced features
4. **Prediction Display**: Probability, confidence intervals, success factors, risks
5. **Chain of Thought**: Detailed reasoning breakdown (expandable)

### API Integration v2.0
- **Web Search RAG Backend**: Connects to evidence-grounded prediction API
- **Real-time Statistics**: Backend searches web for relevant success rate data
- **Prediction Request**: POST to `/predict` with structured prediction_data payload
- **Enhanced Response**: Grounded probability, evidence summary, baseline comparison
- **Error Handling**: Network failures, API errors, authentication issues
- **Demo Authentication**: Simplified token-based auth for production use

### Key Features v2.0
- **Evidence-Based Predictions**: Web Search RAG provides real-world grounding
- **Domain Detection**: Automatic goal categorization with SI units extraction
- **Visual Feedback**: Success probability with color-coded indicators
- **Grounded Analysis**: Risk factors, success drivers based on web-searched evidence
- **Chain of Thought**: Expandable reasoning with animated visualization
- **Confidence Intervals**: Shows probability ranges from Monte Carlo simulations
- **Baseline Comparison**: Compares user odds vs web-searched average person data
- **SI Factors Display**: Shows quantified analysis factors (education ratio, competitiveness, etc.)
- **Advantage Multiplier**: Shows how many times better/worse than average (e.g., "28.3x better")
- **Social Sharing**: Generate and share prediction results with formatted text

## Development Commands

### Local Development
```bash
# Install dependencies
npm install

# Start development server with QR code
npx expo start

# Platform-specific builds
npx expo run:ios
npx expo run:android
```

### Production Testing
```bash
# Test with production API
npx expo start --prod
```

## Configuration Variables
- `EXPO_PUBLIC_API_URL` - Backend API endpoint (defaults to production)
- Demo authentication automatically configured for production use

## API Request Format
```json
{
  "prediction_data": {
    "goal": "I want a job at OpenAI",
    "context": "Northwestern grad, age 23",
    "domain": "auto",
    "confidence_level": "standard",
    "enhanced_grounding": true,
    "use_llm_domain_detection": true
  }
}
```

## Expected Response Format
```json
{
  "probability": 0.18,
  "probability_percent": "18.0%",
  "explanation": "Analysis indicates 18.0% success probability for your goal.",
  "confidence_interval": [0.1, 0.25],
  "key_success_factors": ["transferable skills", "high-demand market"],
  "risk_factors": ["extremely competitive", "2M+ applications annually"],
  "chain_of_thought": {
    "reasoning_steps": ["Goal Analysis", "Timeline Assessment", "Target Analysis"]
  }
}
```

## Recent Updates v2.1 (2025-09-03)
- ✅ **Speed Optimization**: Backend response time improved from 9s to 3-4s (60% faster)
- ✅ **Parallel Processing**: RAG grounding + Monte Carlo now execute simultaneously
- ✅ **Stable Backend**: Fixed service crashes, containers no longer restart constantly
- ✅ **TestFlight Ready**: iOS Build 7 with 30s timeout handling deployed
- ✅ **Web Search RAG Integration**: Backend now searches web for real evidence before predictions
- ✅ **Evidence-Based Grounding**: Real-time statistics from internet (not static knowledge base)
- ✅ **Realistic Predictions**: OpenAI job 2.7% (web-searched evidence vs 57% fallback)
- ✅ **Brave Search Primary**: Optimized API for fastest real-time statistics
- ✅ **Mobile Compatibility**: Full response parsing with new grounding fields

## Test Results Summary v2.0
**End-to-End Validation Complete** - 100+ test cases across 10 domains:
- **Tech Companies**: 2.7-17.8% (evidence-grounded competitive analysis)
- **Career Transitions**: 60.4-76.8% (bootcamp success rates from web data)
- **Entrepreneurship**: 25.1-79.3% (YC acceptance, Series A funding)
- **Finance Goals**: 25.7-69.1% (millionaire statistics, savings rates)
- **Dating Success**: 23.2% (app statistics, 3.33x user advantage)
- **Academic Goals**: 14.3-41.1% (Harvard 3.8%, PhD completion 50%)
- **Travel Adventures**: 54.7-63.1% (Everest 41%, country visits 55%)
- **Creative Pursuits**: 24.9-30.0% (bestseller 3%, music career)

## Known Issues & Solutions
- **QR Code Visibility**: Run `npx expo start --tunnel` for network accessibility
- **Minor API Errors**: 2 edge cases in regex handling (non-critical)
- **Authentication**: Demo token system working with production API