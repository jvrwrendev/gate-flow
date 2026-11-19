# GATEGUARD User Mobile App

A professional, minimalist AI Automatic Barrier Gate user mobile application prototype built with **React Native**, **Expo**, **TypeScript**, **NativeWind (Tailwind CSS)**, and shadcn/ui-inspired reusable components.

> **Mock-only mode** — This prototype uses in-memory mock data and simulated network delays. No real backend, authentication provider, database, AI model, or hardware is integrated.

## Features

- Authentication (login, register, forgot password)
- Dashboard with vehicle overview, recent activity, stats, and quick actions
- My Vehicles (register, view, manage) with approval tracking
- Visitor Access (request temporary passes, list, detail)
- Access History with entry/exit filters
- Notifications feed with read/unread states
- Profile & Settings (personal info, notification preferences, logout)

## Tech stack

- Expo SDK 58 + Expo Router (file-based routing)
- React Native 0.88 + React 19
- TypeScript (strict)
- NativeWind v4 + Tailwind CSS 3
- React Native Reusables-style primitives (custom `ui/` kit with `class-variance-authority`)
- Lucide icons (`lucide-react-native`)
- Form handling: `react-hook-form` + `zod`
- Date formatting: `date-fns`

## Getting started

```bash
npm install
npx expo start
```

Then scan the QR code with the Expo Go app, or run:

```bash
npx expo start --android
npx expo start --ios
```

## Demo account

- **Email:** `demo@gateguard.app`
- **Password:** `password`

You can also register a new mock account.

## Project structure

```
app/                 # Expo Router screens
  (auth)/            # Login, register, forgot password
  (app)/             # Protected app shell
    (tabs)/          # Bottom tabs (Dashboard, Vehicles, History, Notifications, Profile)
    visitor/         # Visitor pass stack
    settings/        # Settings stack
src/
  components/ui/     # Reusable shadcn-inspired primitives
  components/layout/ # Screen, empty/error/loading states, form field
  components/shared/ # Vehicle card, access log item, notification item, etc.
  context/           # Auth context (mock session)
  data/mocks/        # Seed mock data
  hooks/             # Async data hook
  lib/               # Utils, formatters, constants, schemas
  services/          # Mock API services
  types/             # TypeScript domain types
```

## Notes

- All state resets on app reload because data is kept in memory.
- The architecture separates mock services behind clear interfaces, making future real API integration straightforward.
