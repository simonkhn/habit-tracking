export default {
  expo: {
    name: "75-Day Challenge",
    slug: "habit-tracking",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    scheme: "habit-tracking",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#FAFAFA",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FAFAFA",
      },
      edgeToEdgeEnabled: true,
      package: "com.simonkahan.habittracking",
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON || "./google-services.json",
    },
    plugins: [
      "expo-router",
      "expo-font",
      "@react-native-firebase/app",
      [
        "expo-notifications",
        {
          icon: "./assets/icon.png",
          color: "#1A1A2E",
        },
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/splash-icon.png",
          imageResizeMode: "contain",
          backgroundColor: "#FAFAFA",
        },
      ],
    ],
    extra: {
      router: {},
      eas: {
        projectId: "83d8b2dc-e996-4fad-aaa1-aabdf11391b6",
      },
    },
    owner: "simonsaysbuild",
  },
};
