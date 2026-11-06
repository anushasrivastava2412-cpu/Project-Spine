# Project SPINE

A responsive adolescent spinal-health education app for students aged 10–16 and their families. Source lives directly in this repository root.

## Run locally

```sh
npm ci
npm run dev
```

```sh
npm run build
npm test
firebase emulators:exec --only firestore --project demo-spine-tests 'npm test'
npx playwright install chromium
npx playwright test
```

Browser tests require the dev server on port 5173. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` only if using an existing browser; otherwise Playwright uses its installed Chromium.

## Features

- Responsive landing page, custom animated spine illustration, locally served fonts, reduced-motion support.
- Five-step assessment, input validation, transparent exploratory scoring, urgent-symptom override, age-dependent sleep guidance.
- Personalized dashboard, 24-check-in history, three habit actions, 90-day habit log, local-calendar tracking, focus timer.
- Searchable six-article learning library with primary-source links.
- Firebase parent email/password accounts, verification, password reset, owner-only Firestore records.
- Guest session storage, data export, record/account deletion.
- Guidance drafts and a service-gated question queue, with a custom-claim-restricted professional response workspace.

## Firebase

Project: `project-spine-42497`. Firestore: `(default)` in `asia-south1` (Mumbai). Public client configuration is in `src/lib/firebase-config.json`; it is not a service credential. No private credentials are committed. The app does not initialize Analytics.

Firebase Authentication must first be initialized using **Authentication → Get started → Sign-in method → Email/Password** in the Firebase console. The standard free-tier initialization is not exposed by the public Identity Platform API (which requires billing). After initialization, email/password sign-in must be enabled. Authorized Firebase Hosting domains are provided by Firebase; add other deployed origins if using email action redirects or additional providers.

Deploy:

```sh
npm run build
firebase deploy --only firestore:rules,hosting --project project-spine-42497
```

The website is educational and publicly reachable; family records are private under Firestore rules. Authentication uses session persistence. Guest records never upload. Verification is mandatory for cloud health records. Parent status is self-attested, not an independently verified legal-consent system.

## Professional onboarding

The service intentionally remains closed: no doctors or clinical availability are fabricated. Missing `service/guidance` means closed. Before opening, establish qualified staff, guardian consent, safeguarding, response-time expectations, and clinical responsibility. An authorized Firebase administrator can assign a `professional: true` custom claim to the actual verified clinician account. Only after onboarding, set the admin-only document `service/guidance` to `{ enabled: true, name: "<actual service name>" }`. Client users cannot change this document or assign themselves claims. Clinicians see explicitly submitted questions, not family assessment records.

`/professional` provides the response workspace. This is not an emergency service; no guaranteed response or appointment booking is claimed. Email notifications are not implemented; parents view replies in-app.

## Clinical and research limitations

`src/lib/model.ts` contains the versioned **SPINE exploratory v1.0** heuristic. It is not clinically validated, a diagnosis, a disease probability, or an exercise prescription. The app explains its thresholds on `/about`. Research enrollment is not part of this release. Supervised clinical validation and a separate approved consent protocol are needed before medical or research claims.

## Privacy and operations

Profile records are under `families/{uid}`; submitted questions are under `questions/{id}`. Access rules deny unauthenticated/unverified reads and cross-family access. Professional replies are restricted to a server-issued claim. Data deletion clears live records; exports and provider operational retention are outside that operation. Review `/settings` and the project’s actual organizational policies before inviting real students into a supervised pilot.

Font families DM Sans and Manrope are open-source Google Fonts, served locally under the SIL Open Font License. Fonts: https://github.com/google/fonts/tree/main/ofl/dmsans and https://github.com/google/fonts/tree/main/ofl/manrope.
