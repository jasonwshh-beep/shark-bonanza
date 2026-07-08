# Shark Bonanza Slot Prototype

Original friendly shark-themed play-money slot prototype.

## Features

- 5 reels x 3 rows
- Regular spins
- Extra Chance spin option at 3x bet with boosted scatter odds
- Bonus Buy at 100x bet for 10 free spins
- Wild symbol, scatter trigger, simple paytable, play-money balance
- Node/Express static server ready for Railway

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## Deploy to Railway

1. Push this folder to a GitHub repo.
2. Create a new Railway project from the repo.
3. Railway should detect Node from `package.json`.
4. The start command is already set: `npm start`.
5. Railway provides `PORT`; `server.js` uses it automatically.

## Notes

This is a demo/prototype only. It uses simulated play-money and has no casino backend, real-money payments, account system, provably-fair verifier, compliance controls, or Stake integration.
