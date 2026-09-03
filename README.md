# Warframe World View

A real-time dashboard for [Warframe](https://www.warframe.com/)'s world state — open world cycles, sorties, Archon Hunts, void fissures, alerts, invasions, and Baro Ki'Teer's inventory — built with React, Vite, Tailwind CSS, and Firebase.

## Features

- **World Overview** (`/`) — live status for the Cetus (day/night), Orb Vallis (warm/cold), Cambion Drift (fass/vome), and Duviri cycles, plus the current Sortie, Archon Hunt, Darvo deal, faction relay construction progress, and active invasions.
- **Alerts & Fissures** (`/dashboard`) — active events, alerts with reward breakdowns, and void fissures grouped by Normal / Steel Path / Railjack, sorted by relic tier.
- **Baro Ki'Teer** (`/baro`) — arrival/departure countdown and current inventory.
- **Open world pages** (`/cetus`, `/vallis`, `/cambion`, `/duviri`) — per-location cycle state and bounty details. that forwards messages via [Web3Forms](https://web3forms.com/).

All countdowns tick live in the UI, and world state updates in real time via Firestore snapshot listeners — there's no manual refresh needed.

## Tech stack

- [React 19](https://react.dev/) + [React Router 7](https://reactrouter.com/)
- [Vite](https://vite.dev/) for dev/build tooling
- [Tailwind CSS 4](https://tailwindcss.com/) for styling
- [Firebase](https://firebase.google.com/) — Firestore (world state data), Authentication, App Check (reCAPTCHA v3)
- [hCaptcha](https://www.hcaptcha.com/) + [Web3Forms](https://web3forms.com/) for the feedback form

> The Firestore `worldState/latest` document that powers this app is populated by a separate backend process (not part of this repo) that syncs from the Warframe world state API.

## Getting started

**Prerequisites:** Node.js 22+ and npm.

```bash
npm install
npm run dev
```

The app will be available at the printed local URL (typically `http://localhost:5173`).

### Other scripts

```bash
npm run build    # Production build to dist/
npm run preview  # Preview the production build locally
npm run lint     # Run ESLint
```

## Deployment

This project ships with two deployment paths:

- **Firebase Hosting** — configured via [firebase.json](firebase.json) / [.firebaserc](.firebaserc). Deploy with `firebase deploy` after running `npm run build`.
- **Docker** — the included [Dockerfile](Dockerfile) builds the app and serves the static output with Nginx:

  ```bash
  docker build -t warframe-web-app .
  docker run -p 8080:80 warframe-web-app
  ```

## Project structure

```
src/
├── components/     # Page components (World, Dashboard, Baro, Cetus, Vallis, Cambion, Duviri, Login, Support, Sidebar, BountyModal)
├── firebase.js      # Firebase app initialization (Firestore, Auth, App Check)
├── App.jsx          # Router and layout shell
└── main.jsx         # Entry point
```
