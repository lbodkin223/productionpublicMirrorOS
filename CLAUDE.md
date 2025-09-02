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

## Recent Updates v2.0 (2025-09-02)
- ✅ **Web Search RAG Integration**: Backend now searches web for real evidence before predictions
- ✅ **Evidence-Based Grounding**: Real-time statistics from internet (not static knowledge base)
- ✅ **Realistic Predictions**: OpenAI job 2.7% (web-searched evidence vs 57% fallback)
- ✅ **Multiple Search APIs**: OpenAI/Anthropic web search + optional Brave Search integration
- ✅ **Complex Statistics Extraction**: Handles research data like "7 out of 33 men got dates"
- ✅ **Advantage Calculation**: Shows user advantage (e.g., "28.3x better than average")
- ✅ **Grounding Data Display**: Evidence summary with sources and confidence levels
- ✅ **Production Deployment**: Lightweight container deploys successfully
- ✅ **Mobile Compatibility**: Full response parsing with new grounding fields

## Known Issues & Solutions
- **QR Code Visibility**: Run `npx expo start --tunnel` for network accessibility
- **Dating Domain**: Minor type error still being fixed
- **Authentication**: Demo token system working with production API