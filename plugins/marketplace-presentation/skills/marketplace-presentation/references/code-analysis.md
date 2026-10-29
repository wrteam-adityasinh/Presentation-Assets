# Reading a product's code (modes B and C)

Products can be built on any stack. Run `scripts/analyse-code.py <code folder>` first: it detects the stack from manifest files, lists routes and modules where it can, finds integrations, languages and theme tokens, and prints JSON. Then read the files it points to and fill the gaps by hand. Always say in the plan which numbers came from the script and which you counted by reading.

## Detect the stack

| Manifest file | Stack | Routes / screens usually in |
|---|---|---|
| `pubspec.yaml` | Flutter | `lib/**/routes*.dart`, `GoRoute(`, `MaterialPageRoute`, `lib/screens`, `lib/pages`, `lib/views` |
| `package.json` with `next` | Next.js | `app/**/page.(tsx|jsx|js)`, `pages/**` |
| `package.json` with `react-router` | React | `<Route path=`, `createBrowserRouter`, `src/pages` |
| `package.json` with `vue` / `nuxt` | Vue / Nuxt | `router/index`, `pages/**` (Nuxt) |
| `package.json` with `@angular/core` | Angular | `*-routing.module.ts`, `routes:` arrays |
| `package.json` with `react-native` / `expo` | React Native | `app/**` (Expo Router), `Stack.Screen name=` |
| `composer.json` with `laravel/framework` | Laravel | `routes/web.php`, `routes/api.php`, `resources/views/**` |
| `build.gradle(.kts)` + `AndroidManifest.xml` | Android native | `<activity`, `composable(`, `res/layout/*.xml` |
| `*.xcodeproj` / `Package.swift` | iOS native | `struct * : View`, storyboards |
| `requirements.txt` / `pyproject.toml` with `django` | Django | `urls.py`, `templates/**` |
| other | Unknown | Read `README`, the start script and the top-level folders; ask the teammate only if you can't find how to run it |

A product folder often holds several apps (customer app, provider app, admin panel, backend). Treat each app with screens as its own flow group.

## What to extract

- **Platforms**: Android, iOS, Web, Admin panel, API.
- **Modules**: feature folders and route groups (booking, wallet, chat…). These become flow slides and features.
- **Integrations**: payment (Stripe, Razorpay, PayPal…), maps, auth providers, push (FCM, OneSignal), analytics, AI SDKs, storage. Read dependency names and config keys, never values.
- **Languages**: locale files (`l10n`, `lang/`, `locales/`, `assets/translations`), RTL support.
- **Theme** (mode C): primary/secondary/neutral colours, dark theme, font families and sizes from Tailwind config, CSS variables, theme files or Flutter `ThemeData`.

## Features from code

Every feature on `03-features` must have both a code module and a screen (Figma in mode B, captured in mode C). In mode B, list mismatches for the teammate:

- a module in code with no Figma screen ("Wallet top-up exists in code, no Figma screen found")
- a Figma screen with no code behind it

## Rules

- Never print, copy or upload secret values from `.env`, config or keys files. Only note which services are configured.
- Never commit or push anything from the code folder. See `publish-pipeline.md`.
