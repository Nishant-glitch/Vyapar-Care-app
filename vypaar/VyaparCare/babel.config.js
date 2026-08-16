module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // .env ke values build time pe `@env` module me inline ho jaate hain.
    // (Expo ke EXPO_PUBLIC_ prefix ki jagah — ab plain naam chalte hain.)
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        // .env na ho to variables undefined aayen, build fail na ho
        allowUndefined: true,
      },
    ],
  ],
};
