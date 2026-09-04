# Simon's Solutions — App Store Release Guide

> **Last updated:** September 2026  
> This guide covers every manual step required outside of Rocket.new to publish Simon's Solutions on Google Play and the Apple App Store.

---

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Build the Mobile App](#2-build-the-mobile-app)
3. [Android — Google Play Store](#3-android--google-play-store)
4. [iOS — Apple App Store](#4-ios--apple-app-store)
5. [App Branding Assets Required](#5-app-branding-assets-required)
6. [Store Listing Content](#6-store-listing-content)
7. [Deep Links & Universal Links](#7-deep-links--universal-links)
8. [In-App Purchases Note](#8-in-app-purchases-note)

---

## 1. Prerequisites

### Tools Required (install on your machine)
| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18+ | https://nodejs.org |
| Android Studio | Latest | https://developer.android.com/studio |
| Java JDK | 17+ | https://adoptium.net |
| Xcode | 15+ | Mac App Store (macOS only) |
| CocoaPods | Latest | `sudo gem install cocoapods` |

### Accounts Required
| Account | Cost | URL |
|---------|------|-----|
| Google Play Developer | $25 one-time | https://play.google.com/console |
| Apple Developer Program | $99/year | https://developer.apple.com/programs/ |

---

## 2. Build the Mobile App

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Add Capacitor platforms (first time only)
```bash
npx cap add android
npx cap add ios
```

### Step 3 — Build the Next.js web app as a static export
```bash
# Add to next.config.mjs: output: 'export'
npm run build
```

### Step 4 — Sync web assets into native projects
```bash
npx cap sync
```

### Step 5 — Open native IDE
```bash
# Android
npx cap open android

# iOS (macOS only)
npx cap open ios
```

---

## 3. Android — Google Play Store

### 3.1 Configure next.config.mjs for Static Export
Add `output: 'export'` to `next.config.mjs` before building for mobile:
```js
const nextConfig = {
  output: 'export',
  // ... rest of config
};
```

### 3.2 Generate a Release Keystore (ONE TIME — store securely)
```bash
keytool -genkey -v \
  -keystore release.keystore \
  -alias simonssolutions \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```
⚠️ **NEVER commit `release.keystore` to version control.**  
Store it in a secure location (password manager, encrypted drive).

### 3.3 Configure Signing in Android Studio
1. Open `android/app/build.gradle`
2. Add the `signingConfigs` block (see `android/app/build.gradle.reference` in this project)
3. Set environment variables or use `local.properties`:
   ```
   KEYSTORE_PATH=../release.keystore
   KEYSTORE_PASSWORD=your-keystore-password
   KEY_ALIAS=simonssolutions
   KEY_PASSWORD=your-key-password
   ```

### 3.4 Generate the AAB (Android App Bundle)
In Android Studio:
1. **Build** → **Generate Signed Bundle / APK**
2. Select **Android App Bundle**
3. Select your keystore file
4. Enter passwords and alias
5. Select **release** build variant
6. Click **Finish**

Output: `android/app/release/app-release.aab`

### 3.5 Google Play Console Setup
1. Go to https://play.google.com/console
2. Create a new app
3. Fill in:
   - **App name:** Simon's Solutions
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** Free (or Paid)
4. Complete the **Store listing** (see Section 6)
5. Upload the `.aab` file to **Internal testing** first
6. Promote to **Production** after testing

### 3.6 App Icon Requirements (Android)
| Size | Usage |
|------|-------|
| 512×512 px | Google Play Store listing |
| 48×48 dp | mdpi launcher icon |
| 72×72 dp | hdpi launcher icon |
| 96×96 dp | xhdpi launcher icon |
| 144×144 dp | xxhdpi launcher icon |
| 192×192 dp | xxxhdpi launcher icon |

**Adaptive Icon:** Provide foreground (108×108 dp) + background layers.  
Place in `android/app/src/main/res/mipmap-*/ic_launcher.png`

### 3.7 Android App Links (Deep Links)
1. Get your SHA-256 certificate fingerprint:
   ```bash
   keytool -list -v -keystore release.keystore -alias simonssolutions
   ```
2. Update `public/assetlinks.json` with your fingerprint
3. Host at: `https://www.simonssolutions.com/.well-known/assetlinks.json`
4. Verify at: https://developers.google.com/digital-asset-links/tools/generator

### 3.8 Google Play Store Requirements
- **Privacy Policy URL:** Required — host at `https://www.simonssolutions.com/privacy`
- **Screenshots:** Minimum 2, maximum 8 per device type
  - Phone: 1080×1920 px minimum
  - 7-inch tablet (optional)
  - 10-inch tablet (optional)
- **Feature graphic:** 1024×500 px
- **Short description:** Max 80 characters
- **Full description:** Max 4000 characters
- **Content rating:** Complete the questionnaire (likely PEGI 3 / Everyone)
- **Target audience:** 13+ (educational app)

---

## 4. iOS — Apple App Store

### 4.1 Apple Developer Account Setup
1. Enroll at https://developer.apple.com/programs/
2. Wait for approval (usually instant for individuals, up to 2 weeks for organizations)

### 4.2 Register App ID
1. Go to https://developer.apple.com/account/resources/identifiers/list
2. Click **+** → **App IDs** → **App**
3. **Bundle ID:** `com.simonssolutions.app` (Explicit)
4. Enable capabilities:
   - **Associated Domains** (for Universal Links)
   - **Push Notifications** (if needed later)

### 4.3 Create App in App Store Connect
1. Go to https://appstoreconnect.apple.com
2. **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform:** iOS
   - **Name:** Simon's Solutions
   - **Primary Language:** English
   - **Bundle ID:** com.simonssolutions.app
   - **SKU:** simonssolutions-ios-001

### 4.4 Configure Signing in Xcode
1. Open `ios/App/App.xcworkspace` in Xcode
2. Select the **App** target → **Signing & Capabilities**
3. Select your **Team**
4. Xcode will automatically manage provisioning profiles
5. Add **Associated Domains** capability:
   - `applinks:simonssolutions.com`
   - `applinks:www.simonssolutions.com`

### 4.5 Configure Info.plist
Merge the keys from `ios/App/App/Info.plist.reference` into the generated `Info.plist`:
- Camera usage description
- Photo library usage description
- URL scheme: `simonssolutions`

### 4.6 Build & Archive
1. In Xcode: **Product** → **Archive**
2. In the Organizer: **Distribute App** → **App Store Connect**
3. Select **Upload**
4. Follow the wizard

### 4.7 App Store Connect Submission
1. Go to your app in App Store Connect
2. Under **iOS App**, select the uploaded build
3. Fill in:
   - **What's New in This Version**
   - **Screenshots** (see below)
   - **App Preview** (optional video)
4. Submit for **App Review**

### 4.8 App Icon Requirements (iOS)
| Size | Usage |
|------|-------|
| 1024×1024 px | App Store listing (no alpha/transparency) |
| 180×180 px | iPhone @3x |
| 120×120 px | iPhone @2x |
| 167×167 px | iPad Pro @2x |
| 152×152 px | iPad @2x |

Place in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### 4.9 Screenshot Requirements (iOS)
| Device | Size |
|--------|------|
| iPhone 6.7" (required) | 1290×2796 px |
| iPhone 6.5" (required) | 1242×2688 px |
| iPad Pro 12.9" (optional) | 2048×2732 px |

### 4.10 Apple App Store Requirements
- **Privacy Policy URL:** Required — `https://www.simonssolutions.com/privacy`
- **Support URL:** `https://www.simonssolutions.com`
- **Marketing URL:** `https://www.simonssolutions.com`
- **Content rating:** 4+ (educational)
- **Age rating:** Complete the questionnaire

### 4.11 Apple Universal Links
1. Host `apple-app-site-association.json` at:
   `https://www.simonssolutions.com/.well-known/apple-app-site-association`
   (The Next.js rewrite in `next.config.mjs` handles this automatically)
2. Replace `TEAMID` in `public/apple-app-site-association.json` with your Apple Team ID
   (Find it at: https://developer.apple.com/account → Membership)

---

## 5. App Branding Assets Required

### What to Create
| Asset | Size | Format | Notes |
|-------|------|--------|-------|
| App icon (master) | 1024×1024 | PNG | No transparency, no rounded corners |
| Android adaptive icon foreground | 108×108 dp | PNG | Safe zone: 72×72 dp center |
| Android adaptive icon background | 108×108 dp | PNG | Solid color or pattern |
| Splash screen | 2732×2732 | PNG | Center-safe design |
| Feature graphic (Play) | 1024×500 | PNG/JPG | Google Play banner |

### Brand Colors (already in project)
- **Primary:** `#6366f1` (Indigo)
- **Background:** `#0f172a` (Dark Navy)
- **Accent:** `#818cf8` (Light Indigo)

### Where to Place Icons
**Android:** `android/app/src/main/res/mipmap-*/ic_launcher.png`  
**iOS:** `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

---

## 6. Store Listing Content

### App Name
**Simon's Solutions**

### Short Description (80 chars max)
```
AI-powered Math, Physics & Chemistry solver with step-by-step solutions.
```

### Full Description
```
Simon's Solutions is your intelligent academic companion for solving complex 
problems in Mathematics, Physics, and Chemistry.

KEY FEATURES:
• AI-powered step-by-step solutions
• Camera/image input — photograph your problem and get instant answers
• Mathematics: algebra, calculus, trigonometry, statistics, and more
• Physics: mechanics, thermodynamics, electromagnetism, optics
• Chemistry: stoichiometry, reactions, molecular diagrams, equations
• Interactive visualizations and graphs
• Solution history — review past problems anytime
• Credits system — flexible usage-based pricing
• Subscription plans for unlimited access
• Bilingual support: English and French
• Secure cloud sync across all your devices

PERFECT FOR:
• Students at all levels
• Teachers and tutors
• Anyone who needs reliable academic problem-solving

Your account, credits, history, and subscription sync seamlessly between 
web and mobile.
```

### Keywords (iOS — 100 chars max)
```
math solver,physics,chemistry,homework,AI tutor,step by step,calculator,science
```

### Category
- **Primary:** Education
- **Secondary:** Productivity

---

## 7. Deep Links & Universal Links

### Supported Deep Link Paths
| Path | Trigger |
|------|---------|
| `/auth/callback` | Supabase email verification |
| `/reset-password` | Password reset email |
| `/forgot-password` | Forgot password flow |
| `/solver-screen` | Direct to solver |
| `/user-dashboard` | User dashboard |
| `/subscription` | Subscription management |
| `/payment` | Payment page |

### URL Scheme
- **Custom scheme:** `simonssolutions://`
- **Universal/App Links:** `https://www.simonssolutions.com/`

### Supabase Auth Redirect URLs to Configure
In Supabase Dashboard → Authentication → URL Configuration:
```
https://www.simonssolutions.com/auth/callback
simonssolutions://auth/callback
```

---

## 8. In-App Purchases Note

⚠️ **Important for App Store / Google Play compliance:**

The current Simon's Solutions payment system uses **web-based payments** (bank transfer + Whish). 

**Apple App Store Policy:** If the app sells digital content/subscriptions to iOS users, Apple requires in-app purchases through their system (30% commission). Web-only payment flows may be rejected.

**Google Play Policy:** Similar requirements apply for digital subscriptions sold to Android users.

**Options:**
1. **Web-only purchases** — Direct users to `simonssolutions.com` to purchase (allowed but may limit discoverability)
2. **Implement Apple/Google IAP** — Requires additional development work with `@capacitor-community/in-app-purchases` or similar
3. **Freemium model** — Offer free tier in-app, paid features via web

**Recommendation:** Consult Apple/Google guidelines before submitting. The current architecture supports option 1 (web purchases) as a starting point.

---

*This guide covers everything that must be done outside Rocket.new. All project-level configuration has been automatically set up.*
