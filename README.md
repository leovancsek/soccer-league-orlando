# Soccer League Orlando — Mobile App

A React Native (Expo) app for both iOS and Android, built from the same design
tokens and screen structure as the web prototype: browse pickup games, view
game details, book, message organizers, and (as admin) manage games, rosters,
users, and platform features.

## Backend setup (Supabase + Stripe)

This app now requires a real backend. It uses **Supabase** for auth,
database, and Row Level Security, and **Stripe Checkout** for payment.

### 1. Create a Supabase project
1. Go to [supabase.com](https://supabase.com) → New Project.
2. In **SQL Editor**, run `supabase/migrations/0001_init.sql` — this creates
   all tables (profiles, games, rosters, bookings, conversations, messages,
   feature flags) with Row Level Security policies already applied.
3. In **Authentication → Providers**, email/password is enabled by default.
   Under **Authentication → URL Configuration**, add a Redirect URL:
   `soccerleagueorlando://reset-password` (needed for the password-reset
   deep link — see below).
4. Copy your **Project URL** and **anon public key** from
   Project Settings → API.

### 2. Configure the app
```bash
cp .env.example .env
# fill in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
npm install
```

### 3. Authentication requirements (implemented)
- **Registration**: full name, email, password (min. 8 characters), with
  password confirmation. A `profiles` row is auto-created via a Postgres
  trigger on sign-up.
- **Login**: email + password via Supabase Auth (`signInWithPassword`).
- **Auto password reset**: "Forgot password" sends a reset-link email
  (`resetPasswordForEmail`); tapping it deep-links back into the app's
  `ResetPasswordScreen`, which calls `updateUser({ password })` to complete
  the reset. No manual token handling needed — Supabase manages the
  short-lived reset token.
- All screens are in `src/screens/auth/` and `src/context/AuthContext.js`.
  Until a session exists, `RootNavigator` shows the Auth stack instead of
  the main tabs.

### 4. Stripe payment redirect (implemented)
1. Create a [Stripe](https://stripe.com) account, grab your **secret key**
   from the Dashboard (test mode is fine to start).
2. Install the Supabase CLI, then deploy the Edge Function that creates the
   Checkout session:
   ```bash
   npm install -g supabase
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase secrets set STRIPE_SECRET_KEY=sk_test_...
   supabase functions deploy create-checkout-session
   ```
3. In the app, tapping **"Book this slot — pay $X"** on the game detail
   screen calls this function, gets back a Stripe Checkout URL, and opens it
   with `expo-web-browser`. On success, Stripe redirects back into the app
   via the `soccerleagueorlando://payment-success` deep link.
4. **Important**: also set up a Stripe **webhook** (a second Edge Function,
   `stripe-webhook`, listening for `checkout.session.completed`) to flip the
   booking's status to `confirmed` server-side. The in-app redirect is a
   nice UX signal, but shouldn't be trusted alone — a user can close the
   browser before it fires, so the webhook is the actual source of truth for
   "was this paid for." This function isn't scaffolded yet; happy to add it.

## Run it

```bash
npm install
npx expo start
```

Then either:
- Press `i` to open in the iOS Simulator (Mac + Xcode required), or
- Press `a` to open in an Android Emulator (Android Studio required), or
- Scan the QR code with the **Expo Go** app on a physical iPhone or Android
  phone — no build step needed to try it out.

## What's included

- **Bottom tab navigation**: Games, Bookings, Messages, Admin, Profile
- **Games tab** — search, format filter chips, paginated ticket cards (3 at a
  time), tap through to a full game detail screen with booking
- **Game detail** — venue/date/price info, a "Player costs" breakdown by
  listing type (League vs Casual), organizer contact, player roster, and a
  sticky Book button
- **Bookings** — manage booked games, cancel, message the organizer
- **Messages** — conversation list + live chat thread per organizer
- **Admin** — Games / Users / Features segmented sections:
  - **Games**: create or edit listings, upload a field photo from the device
    camera roll (`expo-image-picker`), toggle League vs Casual, manage the
    relevant roster type (League players/Substitutes or Drop-ins/Regulars)
    with per-type pricing, see a live slots-filled progress bar
  - **Users**: enable/disable accounts
  - **Features**: toggle platform features on/off
- **Profile** — view and edit player info, stats scoreboard

## Architecture notes

- **Auth is real**: `src/context/AuthContext.js` talks directly to Supabase
  Auth (register, login, logout, password reset). `RootNavigator` gates the
  whole app on session state.
- **Games/bookings/messages data is still client-side state** in
  `src/context/AppContext.js` (seeded from `src/data/seedData.js`), same
  in-memory approach as the web prototype. The `games`, `game_rosters`,
  `bookings`, `conversations`, and `messages` tables + RLS policies already
  exist in `supabase/migrations/0001_init.sql` — the next step is swapping
  `AppContext`'s local `useState` calls for Supabase queries
  (`supabase.from('games').select()`, etc.) so this data actually persists
  and is shared across devices/users instead of resetting on app restart.
- **Payment is real**: booking a slot calls the `create-checkout-session`
  Edge Function and redirects to Stripe Checkout (see setup above). The
  `bookings` table already tracks `pending_payment` → `confirmed` status —
  wire up the Stripe webhook (see step 4 above) to complete that loop.
- Design tokens (colors, spacing, radius) are centralized in
  `src/theme/theme.js` so the visual language stays consistent with the web
  version and is easy to re-skin.
- Photo upload uses `expo-image-picker` to pull from the device's photo
  library. For camera capture, swap in `ImagePicker.launchCameraAsync()`.
  Uploaded photos are currently local file URIs — wire them to Supabase
  Storage (`supabase.storage.from('field-photos').upload(...)`) so they
  persist and are visible to other users, rather than only on the admin's
  own device.
- The Android "Add player" prompt in Admin currently shows a placeholder
  alert — `Alert.prompt` (text input in an alert) is iOS-only. For Android,
  replace the prompt in `AdminScreen.js` with a small `Modal` + `TextInput`,
  reusing the same `addRosterPlayer()` call.

## Before shipping to the App Store / Play Store

- Add real app icons and splash screens (`app.json` → `icon`, `splash.image`)
- Finish wiring `AppContext` to Supabase tables (see note above) so game
  listings, bookings, and messages persist server-side
- Deploy the Stripe `stripe-webhook` Edge Function to confirm bookings
  server-side (don't rely on the in-app redirect alone)
- Add the Android "add player" modal mentioned above
- In Supabase Auth settings, decide whether to require email confirmation
  before first login (recommended) and customize the reset-password email
  template
- Configure EAS Build (`npx eas build`) to produce signed `.ipa`/`.aab`
  binaries for store submission
