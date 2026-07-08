# Shark Bonanza — Railway-ready slot prototype

A browser-playable, play-money slot prototype with a brighter beach/shark UI, smooth reel animations, regular spins, Extra Chance, and Bonus Buy.

## Run locally
```bash
npm install
npm start
```
Open `http://localhost:8080`.

## Railway
Deploy this folder or ZIP to Railway. Generate the public domain using port `8080`.

## RTP
`public/script.js` includes `RTP_TARGET = 0.975`. The base-spin payout distribution is tuned so the theoretical base-spin EV equals 97.5% before real-world certification, RNG audits, jurisdiction rules, volatility review, and bonus-buy math certification.

This is a play-money test build only. It does not include Stake branding, copyrighted slot assets, payment processing, real-money wagering, or production compliance controls.
