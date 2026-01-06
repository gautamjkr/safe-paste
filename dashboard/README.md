# SafePaste Dashboard

An elegant, real-time dashboard for viewing SafePaste redaction statistics. Matches the cyber-security aesthetic of the SafePaste extension.

## Features

- **Real-time Updates**: Auto-refreshes every 5 seconds
- **Beautiful UI**: Dark theme with glassmorphism effects matching the extension
- **Statistics**: Total redactions, entity types, and most redacted entities
- **Detailed Table**: Breakdown of all entity types with counts and percentages
- **Visual Progress Bars**: Gradient bars showing relative distribution

## Prerequisites

- Node.js 18+ and npm
- Gateway service running on `http://localhost:8080`

## Setup

```powershell
cd dashboard
npm install
```

## Running

```powershell
npm run dev
```

The dashboard will open at `http://localhost:3000` (or the next available port).

## Environment Variables

Create a `.env` file (optional):

```dotenv
VITE_GATEWAY_URL=http://localhost:8080
```

If not set, defaults to `http://localhost:8080`.

## Build for Production

```powershell
npm run build
```

The built files will be in the `dist` folder.

## Design

The dashboard uses the same design language as the SafePaste extension:
- Dark background (`#050816`)
- Green accent color (`#22c55e`) for primary elements
- Purple accent (`#a855f7`) for secondary elements
- Glassmorphism effects with backdrop blur
- Pulsing glow animations
- Cyber-security aesthetic

