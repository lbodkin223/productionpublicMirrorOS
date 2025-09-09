const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export default {
  expo: {
    name: "MirrorOS",
    slug: "mirroros", 
    owner: "lbodkin",
    version: "4.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    description: "AI-powered future prediction with live economic data. Get personalized success probabilities for your goals.",
    privacy: "public",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#007AFF"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.mirroros.app",
      buildNumber: "10",
      infoPlist: {
        NSCameraUsageDescription: "This app does not use the camera.",
        NSMicrophoneUsageDescription: "This app does not use the microphone."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.mirroros.app",
      versionCode: 1,
      edgeToEdgeEnabled: true
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "630516d2-60a4-42ec-9511-de0a7fe01d70"
      },
      // Always use production API for testing
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://yyk4197cr6.execute-api.us-east-2.amazonaws.com/prod/api",
      environment: process.env.EXPO_PUBLIC_ENVIRONMENT || (IS_DEVELOPMENT ? "development" : "production"),
      demoMode: process.env.EXPO_PUBLIC_DEMO_MODE === "true" || IS_DEVELOPMENT,
      debugMode: process.env.EXPO_PUBLIC_DEBUG_MODE === "true" || IS_DEVELOPMENT
    },
    plugins: [
      // Add environment-aware plugins here
    ]
  }
};