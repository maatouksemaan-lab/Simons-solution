# Simon's Solutions — Production Deployment Guide

> **Last updated:** September 2026  
> This guide covers deploying Simon's Solutions to production with a custom domain, and building/publishing the Android and iOS apps.

---

## Legend
- ✅ **AUTOMATICALLY CONFIGURED** — Already set up in the project code
- 🔧 **MANUAL STEP REQUIRED** — You must do this outside Rocket.new

---

## Table of Contents
1. [Custom Domain Setup](#1-custom-domain-setup)
2. [Web Production Deployment](#2-web-production-deployment)
3. [Supabase Production Configuration](#3-supabase-production-configuration)
4. [Environment Variables](#4-environment-variables)
5. [Authentication Configuration](#5-authentication-configuration)
6. [Email Configuration](#6-email-configuration)
7. [Payment Configuration](#7-payment-configuration)
8. [Android Build & Google Play](#8-android-build--google-play)
9. [iOS Build & Apple App Store](#9-ios-build--apple-app-store)
10. [Post-Launch Checklist](#10-post-launch-checklist)

---

## 1. Custom Domain Setup

### 1.1 Buy a Domain
🔧 **MANUAL STEP:** Purchase `simonssolutions.com` (or your chosen domain) from a registrar:
- Namecheap: https://www.namecheap.com
- Google Domains: https://domains.google
- Cloudflare: https://www.cloudflare.com/products/registrar/

### 1.2 DNS Configuration
🔧 **MANUAL STEP:** Add these DNS records at your registrar/DNS provider:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `[Your host's IP]` | 3600 |
| CNAME | www | `[Your host's domain]` | 3600 |
| CNAME | www | `simonssolu1089.builtwithrocket.new` | 3600 |

**If using Netlify (current host):**
| Type | Name | Value |
|------|------|-------|
| CNAME | www | `[your-site].netlify.app` |
| A | @ | `75.2.60.5` |

### 1.3 HTTPS / SSL
✅ **AUTOMATICALLY CONFIGURED** — Netlify and most modern hosts provision SSL automatically via Let's Encrypt when you connect a custom domain.

🔧 **MANUAL STEP:** In your hosting dashboard, add the custom domain and wait for SSL provisioning (usually 5–30 minutes).

### 1.4 WWW vs Non-WWW
✅ **AUTOMATICALLY CONFIGURED** — The app uses `NEXT_PUBLIC_SITE_URL` for all URL generation. Set this to your canonical domain.

🔧 **MANUAL STEP:** Configure a redirect in your hosting dashboard:
- Redirect `simonssolutions.com` → `https://www.simonssolutions.com` (or vice versa)

---

## 2. Web Production Deployment

### Current Hosting
The app is currently deployed on Rocket.new / Netlify at:
`https://simonssolu1089.builtwithrocket.new`

### 2.1 Environment Variables for Production
🔧 **MANUAL STEP:** In your hosting dashboard (Netlify/Vercel), set:

```
NEXT_PUBLIC_SITE_URL=https://www.simonssolutions.com
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-key
RESEND_API_KEY=your-resend-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
```

### 2.2 Build Command
✅ **AUTOMATICALLY CONFIGURED**
```bash
npm run build
```

### 2.3 Output Directory
✅ **AUTOMATICALLY CONFIGURED** — `.next`

### 2.4 Node Version
✅ **AUTOMATICALLY CONFIGURED** — Node 18+

---

## 3. Supabase Production Configuration

### 3.1 Supabase Project
✅ **AUTOMATICALLY CONFIGURED** — Supabase project already exists and is connected.

### 3.2 Site URL in Supabase
🔧 **MANUAL STEP:**
1. Go to https://supabase.com/dashboard → Your Project → Authentication → URL Configuration
2. Set **Site URL** to: `https://www.simonssolutions.com`
3. Add to **Redirect URLs**:
   ```
   https://www.simonssolutions.com/auth/callback
   https://simonssolu1089.builtwithrocket.new/auth/callback
   simonssolutions://auth/callback
   ```

### 3.3 Email Templates
🔧 **MANUAL STEP:**
1. Go to Authentication → Email Templates
2. Update the **Confirm signup** template redirect URL to:
   `https://www.simonssolutions.com/auth/callback`
3. Update the **Reset password** template redirect URL to:
   `https://www.simonssolutions.com/reset-password`

### 3.4 Database Migrations
✅ **AUTOMATICALLY CONFIGURED** — All migrations are in `supabase/migrations/` and have been applied.

### 3.5 Row Level Security
✅ **AUTOMATICALLY CONFIGURED** — RLS policies are defined in the migration files.

---

## 4. Environment Variables

### 4.1 Reference File
✅ **AUTOMATICALLY CONFIGURED** — See `.env.production.example` in the project root for all required variables.

### 4.2 Required Variables Summary
| Variable | Where to Get |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |
| `OPENAI_API_KEY` | https://platform.openai.com/api-keys |
| `RESEND_API_KEY` | https://resend.com/api-keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | https://dashboard.stripe.com/apikeys |
| `STRIPE_SECRET_KEY` | https://dashboard.stripe.com/apikeys |
| `NEXT_PUBLIC_SITE_URL` | Your production domain |

### 4.3 Security Rules
✅ **AUTOMATICALLY CONFIGURED** — Secret keys (`OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY`) are server-side only (no `NEXT_PUBLIC_` prefix). They are never exposed to the browser or mobile app.

---

## 5. Authentication Configuration

### 5.1 Supabase Auth
✅ **AUTOMATICALLY CONFIGURED** — Supabase Auth is fully implemented with:
- Email/password registration and login
- Email verification
- Password reset
- Session persistence
- Protected routes via middleware

### 5.2 Auth Callback Route
✅ **AUTOMATICALLY CONFIGURED** — `/auth/callback` handles the OAuth code exchange.

### 5.3 Production Redirect URLs
🔧 **MANUAL STEP:** Add to Supabase → Authentication → URL Configuration → Redirect URLs:
```
https://www.simonssolutions.com/auth/callback
simonssolutions://auth/callback
```

### 5.4 Mobile Auth Deep Links
✅ **AUTOMATICALLY CONFIGURED** — Capacitor config and Android manifest include the `simonssolutions://` URL scheme for auth redirects.

---

## 6. Email Configuration

### 6.1 Resend
✅ **AUTOMATICALLY CONFIGURED** — Email sending is implemented via Resend in `src/lib/email.ts`.

🔧 **MANUAL STEP:**
1. Create account at https://resend.com
2. Add and verify your domain: `simonssolutions.com`
3. Add DNS records provided by Resend (SPF, DKIM, DMARC)
4. Get your API key and set `RESEND_API_KEY` in production environment

### 6.2 Email From Address
🔧 **MANUAL STEP:** Update the `from` address in `src/lib/email.ts` from the placeholder to:
`noreply@simonssolutions.com` (or your verified domain)

### 6.3 Supabase Email Templates
🔧 **MANUAL STEP:** Update email template URLs in Supabase Dashboard → Authentication → Email Templates to use your production domain.

---

## 7. Payment Configuration

### 7.1 Current Payment System
✅ **AUTOMATICALLY CONFIGURED** — Payment flow (bank transfer + Whish) is implemented with proof upload to Supabase Storage.

### 7.2 Stripe (if applicable)
🔧 **MANUAL STEP:** If activating Stripe:
1. Create account at https://stripe.com
2. Get publishable and secret keys from https://dashboard.stripe.com/apikeys
3. Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY`
4. Configure webhook endpoint: `https://www.simonssolutions.com/api/stripe/webhook`
5. Set `STRIPE_WEBHOOK_SECRET` from the webhook dashboard

### 7.3 Payment Return URLs
✅ **AUTOMATICALLY CONFIGURED** — Payment pages use `NEXT_PUBLIC_SITE_URL` for return URLs.

---

## 8. Android Build & Google Play

### 8.1 What's Automatically Configured
✅ **Package ID:** `com.simonssolutions.app`  
✅ **App name:** Simon's Solutions  
✅ **Capacitor config:** `capacitor.config.ts`  
✅ **Deep link scheme:** `simonssolutions://`  
✅ **Android App Links:** `public/assetlinks.json`  
✅ **Manifest reference:** `android/app/src/main/AndroidManifest.xml.reference`  
✅ **Build config reference:** `android/app/build.gradle.reference`  
✅ **Brand colors:** `#0f172a` background, `#6366f1` primary  
✅ **Splash screen config:** Capacitor SplashScreen plugin configured  

### 8.2 Manual Steps Required

**Step 1 — Install Android Studio**
🔧 Download from https://developer.android.com/studio

**Step 2 — Add Android platform**
🔧 Run in project root:
```bash
npm install
npx cap add android
```

**Step 3 — Sync web assets**
🔧 After every web build:
```bash
npm run build
npx cap sync android
```

**Step 4 — Add app icons**
🔧 Place icon files in `android/app/src/main/res/mipmap-*/`:
- `ic_launcher.png` (standard icon)
- `ic_launcher_round.png` (round icon)
- `ic_launcher_foreground.png` (adaptive foreground)

Use Android Studio's **Image Asset Studio** (right-click `res` → New → Image Asset) to generate all sizes from your 1024×1024 master icon.

**Step 5 — Generate release keystore**
🔧 Run once and store securely:
```bash
keytool -genkey -v \
  -keystore release.keystore \
  -alias simonssolutions \
  -keyalg RSA -keysize 2048 -validity 10000
```

**Step 6 — Configure signing**
🔧 Apply the signing config from `android/app/build.gradle.reference` to the generated `android/app/build.gradle`.

**Step 7 — Generate AAB**
🔧 In Android Studio: Build → Generate Signed Bundle/APK → Android App Bundle

**Step 8 — Update assetlinks.json**
🔧 Get your SHA-256 fingerprint:
```bash
keytool -list -v -keystore release.keystore -alias simonssolutions
```
Update `public/assetlinks.json` with the fingerprint, then deploy.

**Step 9 — Google Play Console**
🔧 
1. Create developer account ($25): https://play.google.com/console
2. Create new app
3. Upload AAB to internal testing
4. Complete store listing (see `APP_STORE_RELEASE_GUIDE.md`)
5. Submit for review

---

## 9. iOS Build & Apple App Store

### 9.1 What's Automatically Configured
✅ **Bundle ID:** `com.simonssolutions.app`  
✅ **App name:** Simon's Solutions  
✅ **Capacitor config:** `capacitor.config.ts`  
✅ **Deep link scheme:** `simonssolutions://`  
✅ **Universal Links:** `public/apple-app-site-association.json`  
✅ **Info.plist reference:** `ios/App/App/Info.plist.reference`  
✅ **Brand colors:** Configured in Capacitor SplashScreen plugin  

### 9.2 Manual Steps Required

**Step 1 — macOS + Xcode**
🔧 Install Xcode 15+ from the Mac App Store. Install CocoaPods:
```bash
sudo gem install cocoapods
```

**Step 2 — Add iOS platform**
🔧 Run in project root:
```bash
npm install
npx cap add ios
cd ios/App && pod install
```

**Step 3 — Sync web assets**
🔧 After every web build:
```bash
npm run build
npx cap sync ios
```

**Step 4 — Configure Info.plist**
🔧 Merge keys from `ios/App/App/Info.plist.reference` into the generated `ios/App/App/Info.plist`.

**Step 5 — Add app icons**
🔧 In Xcode, open `ios/App/App/Assets.xcassets/AppIcon.appiconset/` and add all required icon sizes. Use a tool like https://appicon.co to generate all sizes from your 1024×1024 master.

**Step 6 — Configure signing**
🔧 In Xcode → App target → Signing & Capabilities:
- Select your Apple Developer Team
- Enable Automatic signing
- Add Associated Domains: `applinks:simonssolutions.com`, `applinks:www.simonssolutions.com`

**Step 7 — Update apple-app-site-association.json**
🔧 Replace `TEAMID` in `public/apple-app-site-association.json` with your Apple Team ID (found at https://developer.apple.com/account → Membership Details).

**Step 8 — Archive & Upload**
🔧 In Xcode: Product → Archive → Distribute App → App Store Connect → Upload

**Step 9 — App Store Connect**
🔧
1. Create developer account ($99/year): https://developer.apple.com/programs/
2. Register Bundle ID: `com.simonssolutions.app`
3. Create app in App Store Connect
4. Select uploaded build
5. Complete store listing (see `APP_STORE_RELEASE_GUIDE.md`)
6. Submit for review

---

## 10. Post-Launch Checklist

### Web
- [ ] Custom domain resolves correctly
- [ ] HTTPS certificate is active
- [ ] `NEXT_PUBLIC_SITE_URL` set to production domain
- [ ] Supabase Site URL updated
- [ ] Supabase redirect URLs updated
- [ ] Email templates updated with production URLs
- [ ] Test registration → email verification flow
- [ ] Test password reset flow
- [ ] Test solver (Math, Physics, Chemistry)
- [ ] Test payment flow
- [ ] Test admin dashboard
- [ ] Test subscription management

### Android
- [ ] AAB generated and signed
- [ ] App icon added (all densities)
- [ ] Splash screen displays correctly
- [ ] Deep links work (email verification, password reset)
- [ ] Solver works on Android
- [ ] Credits sync with web account
- [ ] Subscription status syncs
- [ ] History syncs
- [ ] `assetlinks.json` hosted and verified

### iOS
- [ ] Archive built and uploaded
- [ ] App icon added (all sizes)
- [ ] Launch screen displays correctly
- [ ] Deep links work (Universal Links)
- [ ] Solver works on iOS
- [ ] Credits sync with web account
- [ ] Subscription status syncs
- [ ] History syncs
- [ ] `apple-app-site-association` hosted and verified

### Stores
- [ ] Google Play store listing complete
- [ ] Apple App Store listing complete
- [ ] Privacy Policy URL live: `https://www.simonssolutions.com/privacy`
- [ ] Screenshots uploaded (both stores)
- [ ] Content rating completed
- [ ] Both apps submitted for review

---

## Summary: What Was Automatically Configured vs Manual

| Item | Status |
|------|--------|
| Capacitor integration (`capacitor.config.ts`) | ✅ Auto |
| Package ID: `com.simonssolutions.app` | ✅ Auto |
| Bundle ID: `com.simonssolutions.app` | ✅ Auto |
| Deep link scheme: `simonssolutions://` | ✅ Auto |
| Android App Links (`assetlinks.json`) | ✅ Auto (needs SHA-256 fingerprint) |
| iOS Universal Links (`apple-app-site-association.json`) | ✅ Auto (needs Team ID) |
| Android manifest reference | ✅ Auto |
| iOS Info.plist reference | ✅ Auto |
| Android build.gradle reference | ✅ Auto |
| Splash screen config (brand colors) | ✅ Auto |
| Production env template | ✅ Auto |
| Next.js rewrites for well-known paths | ✅ Auto |
| Supabase auth — existing | ✅ Preserved |
| Solver — existing | ✅ Preserved |
| Credits system — existing | ✅ Preserved |
| Admin dashboard — existing | ✅ Preserved |
| Payment system — existing | ✅ Preserved |
| Google Play developer account | 🔧 Manual ($25) |
| Apple Developer account | 🔧 Manual ($99/year) |
| Release keystore generation | 🔧 Manual |
| App icon artwork | 🔧 Manual |
| Splash screen artwork | 🔧 Manual |
| DNS configuration | 🔧 Manual |
| Supabase URL configuration | 🔧 Manual |
| Store listing content/screenshots | 🔧 Manual |
| App review submission | 🔧 Manual |

*For detailed store submission steps, see `APP_STORE_RELEASE_GUIDE.md`.*
