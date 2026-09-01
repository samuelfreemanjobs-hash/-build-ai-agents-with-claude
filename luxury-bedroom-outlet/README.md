# Luxury Bedroom Outlet

Curated underpriced luxury bedroom furniture aggregator — real Macy's clearance and Great Home Values deals with live product links.

## Quick start

```bash
cd luxury-bedroom-outlet
npm install
npm run dev
```

Open **http://localhost:5180**

## What's included

- 16 real Macy's bedroom products (beds, sets, dressers, nightstands)
- Live affiliate/product links to macys.com product pages
- Filter by category, search, minimum discount %
- Sort by discount, price, or name
- Product detail modal with full specs

## Data refresh

Product data lives in `src/data/products.js`. A Python scraper (`macys_scraper.py`) can be added to auto-refresh clearance feeds.

## Deploy

```bash
npm run build
npm run preview
```

Deploy `dist/` to Vercel, Netlify, or GitHub Pages.
