# MirrorOS Final Public Mobile App - Claude Manifest

## Project Overview
**MirrorOS Final Public Mobile App** - React Native/Expo mobile application for goal achievement predictions.

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

### API Integration
- **Prediction Request**: POST to `/predict` with structured prediction_data payload
- **Response Handling**: Parses JSON response with probability, explanations, risk factors
- **Error Handling**: Network failures, API errors, authentication issues
- **Demo Authentication**: Simplified token-based auth for production use

### Key Features
- **Real-time Predictions**: Connects to FRED-enhanced backend
- **Domain Detection**: Automatic goal categorization
- **Visual Feedback**: Success probability with color-coded indicators
- **Detailed Analysis**: Risk factors, success drivers, timeline assessments
- **Chain of Thought**: Expandable reasoning explanation

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

## Recent Updates (2025-09-02)
- ✅ **LLM Extraction Fixed**: 3000 token limits (was 500) for long context support
- ✅ **Type Safety**: Fixed 'int' object has no attribute 'lower' errors
- ✅ **Realistic Predictions**: OpenAI job 1.0% (was 57% fallback)
- ✅ **Factor Extraction**: Now properly extracts company competitiveness

## Known Issues & Solutions
- **QR Code Visibility**: Run `npx expo start --tunnel` for network accessibility
- **Dating Domain**: Minor type error still being fixed
- **Authentication**: Demo token system working with production API