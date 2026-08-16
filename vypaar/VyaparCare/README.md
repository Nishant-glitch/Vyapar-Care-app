# Vyapar Care — React Native CLI

Bare React Native (0.87) app. Pehle ye Expo project tha; ab Expo ke bina
React Native CLI pe chalta hai. Saari screens ka UI aur logic waisa hi hai.

## Setup

```sh
npm install

# iOS ke liye ek baar
cd ios && bundle install && bundle exec pod install && cd ..
```

### .env

```sh
cp .env.example .env
```

`.env` me apne Supabase project ke values daaliye:

```ini
SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
```

`react-native-dotenv` in values ko build time pe `@env` module me inline karta
hai (`lib/supabase.js` dekhiye). **`.env` badalne ke baad Metro cache clear
karna zaroori hai:**

```sh
npm start -- --reset-cache
```

Jab tak asli keys set nahi hain, app demo mode me chalta hai — koi network call
nahi jaata aur screens apne mock data pe rehte hain.

## Chalane ke liye

```sh
npm start          # Metro
npm run android    # ya: npx react-native run-android
npm run ios        # ya: npx react-native run-ios
```

## Expo se kya badla

| Pehle (Expo)                     | Ab (RN CLI)                        |
| -------------------------------- | ---------------------------------- |
| `registerRootComponent` (`expo`) | `AppRegistry.registerComponent`    |
| `expo-document-picker`           | `@react-native-documents/picker`   |
| `process.env.EXPO_PUBLIC_*`      | `react-native-dotenv` → `@env`     |
| `app.json` (expo config)         | native `android/` + `ios/` folders |

`expo-status-bar` aur `expo-linking` kahin use nahi ho rahe the — screens pehle
se hi React Native ka `StatusBar` aur `Linking` use karte hain, isliye wahan
koi change nahi hua. `useSafeAreaInsets` bhi wahi
`react-native-safe-area-context` se aata hai.

## Baaki

- `supabase/` folder me schema/seed/storage SQL hai (Supabase SQL editor me chalaayein).
- App icon aur splash abhi RN ke default hain — `assets/` me source images padi
  hain, native icon set karna baaki hai.
