# Capturing a code-only product into Figma (mode C)

The teammate creates an **empty Figma design file** in the team's Figma project and gives you its link. You put the captured screens and the presentation into that file. Never create Figma files yourself.

The product's code folder contains everything needed to run it (environment, demo data). Read how to run it from the README, `package.json` scripts, `Makefile`, `docker-compose.yml` or the stack's usual commands. If a step fails, fix what is clearly local (install dependencies, run migrations and seeders) and ask the teammate only when you are stuck.

## 1. Run the app

| Stack | Typical run |
|---|---|
| Next / React / Vue / Angular / Nuxt | install with the lock file's package manager, then `dev` or `start` script |
| Laravel | `composer install`, `php artisan migrate --seed` (only against the local demo DB in the code's `.env`), `php artisan serve`; plus `npm run dev` if it has a front end |
| Flutter | `flutter pub get`, then `flutter run -d chrome --web-port 8080` if web is enabled; otherwise an Android emulator |
| React Native / Expo | `npx expo start --web` if web works; otherwise an emulator |
| Android / iOS native | emulator or simulator |
| Django | `pip install -r requirements.txt`, `python manage.py migrate`, `runserver` |

Run long-running servers in the background. Stop them when capture is done.

## 2. Map the screens

Walk every route found by `analyse-code.py` plus everything reachable from the menus. Log in with the demo account from the seeders or README. Make a capture list: flow, screen name, URL or navigation steps, viewport.

Viewports: **390 × 844** for mobile apps (including Flutter/RN web builds), **1440 × 900** for web apps and admin panels. Capture full-page height for scrolling screens.

## 3. Privacy check before anything goes to Figma

The final presentation images are public. Before capturing, look at each screen with real data in mind: real customer names, emails, phone numbers, addresses, payment details, API keys or tokens must not appear. If the demo data has any, stop and tell the teammate.

## 4. Capture into the teammate's Figma file

- **Web-rendered screens** (web apps, admin panels, Flutter/RN web builds): `generate_figma_design` with the teammate's `fileKey`, one call per screen, polled until complete. Screens arrive as editable layers. Move each capture into the `📱 Captured Screens` page, inside a section per flow, and name the frame after the screen.
- **Mobile-only apps** (no web build): take emulator screenshots (`adb exec-out screencap -p` for Android, `xcrun simctl io booted screenshot` for iOS), then place them with `upload_assets` onto frames you created on `📱 Captured Screens` (one 390-wide frame per screen, `nodeIds` mapping). Check one screenshot in Figma first: if images don't render, stop and tell the teammate.

Never upload captured screens to GitHub. They live only in the Figma file and in the session scratchpad.

## 5. Design system in the new file

Run `scripts/theme-to-figma.js` with the theme JSON from `analyse-code.py`. It creates a "Product Colors" variable collection (Light, plus Dark if the code has a dark theme), primary/neutral scales and text styles with the product's font. The deck then binds to these variables exactly like mode A.

## 6. Continue as normal

Analyse the new file with `analyse-page.js` (the captured-screens page), then plan, build, review and export as in modes A and B.
