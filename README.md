# Jason LTL &bull; Open Platform Load Board & Freight Quoting

Production-ready full-stack LTL freight load board and rate quoting web application optimized for deployment on **Render.com** (Free / Starter tier) with server-side authentication to `https://myportal.goglt.com` and custom markup rules.

---

## 🚀 Key Features

1. **Server-Side Authentication to GLT Portal**:
   - Credentials stored strictly in `.env` (`EMAIL=Jason@cylltd.com`, `PASS=from env`).
   - Secrets are **never** exposed to the client or frontend.
   - Automatically signs in to `https://myportal.goglt.com` using email + password + Login button automation on app startup or first quote request.
   - Navigates to `/quote-book/all-options` and maintains persistent cookies/session in memory and on disk (`storage/glt-session.json`).

2. **User-Facing Quote Experience**:
   - Live location & ZIP autocomplete for Pickup and Delivery locations.
   - Common accessorials quick toggles + expandable full accessorial catalog:
     - **General**: Air Ride truck, Bonded, Bonded + Form 7512, Double Blind, Envelope(s), Guaranteed transit time, Guns handling license, Hazmat 2.3, Hazmat Explosives 1.4, Hazmat Toxic or Poison 6.1, Household Goods, Liquids, Liquor Handling License, Loose Boxes, Packaging type: Bundle(s)/Roll(s)/Tube(s), Pallets-Crates-Skids, Protect From Freezing, Tobacco handling license, TSA Approved carrier, Dock Height, Free Insurance coverage, Lock Bars, Loose Cargo, Straps, TWIC Card, Non Hazmat, One day chassis discount, Seafood, Binders, Tarp 4/6/8 ft, Overweight, Reefer, Hazardous Material Handling.
     - **Origin**: Airport Pick Up, Blind Pick Up, Distribution Center Pickup, Inside Pick Up, Jacinto Port Pickup, Limited access Pick Up, Lumper Loading Assistance, Port Pick Up, Pickup Appointment, Wash out.
     - **Delivery**: Adult Signature Required (Parcel), Airport Delivery, Amazon Warehouse Delivery, Blind Delivery, Costco Delivery, Curbside Delivery, Delivery Appointment, Distribution Center Delivery, Inside Delivery, Jacinto Port Delivery, Limited Access Delivery, Lumper Unloading Assistance, Pick Up at Carrier Destination Terminal, Port Delivery, Signature Required (Parcel), Threshold Delivery, Trade Show Delivery, Walmart Delivery, Airport delivery (TSA).
   - Multi-line item editor with Units, Packaging Type, Weight (lbs/kg), Dimensions (L × W × H in/cm), NMFC Class dropdown, and Commodity description with live density (pcf) calculations.
   - Optional Declared Cargo Value and Shipper Reference.

3. **Carrier Selection & Dispatch Page**:
   - Token-based URL pattern (`#quote=JLT-XXXX`) for direct bookmarking and sharing.
   - Carrier cards displaying:
     - Carrier logo / badge
     - Service Class (Standard LTL, Guaranteed A.M., Expedited)
     - Transit time & Estimated delivery date
     - Liability policy ($/lb)
     - On-time performance ratings (Pickup % / Delivery %)
     - Quote expiration date
     - Terminal & pickup notes
     - **BOOK** button with price
     - **BOOK WITH INSURANCE** button with price

4. **Mandatory Server-Side Rate Markup**:
   - Rates are marked up strictly on the server before being sent to the customer:
     - If original rate < $100 &rarr; add random $50–$70
     - If original rate < $500 &rarr; add random $70–$90
     - If original rate < $1000 &rarr; add random $100–$150
     - If original rate < $2000 &rarr; add random $200–300
     - If original rate > $2600 &rarr; add $400 (scaled progressively for higher amounts)
   - Applied to both standard rate and insurance rate.
   - Original wholesale rates are kept internal for server logging and never transmitted to the browser.

---

## 🛠️ Local Development & Quick Start

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### 2. Environment Setup
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Fill in your credentials:
```env
EMAIL=Jason@cylltd.com
PASS=YourGLTPasswordHere
PORT=3000
NODE_ENV=development
```

### 3. Install & Start
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build & Run Locally
```bash
npm run build
npm start
```

---

## 🌐 Render.com Deployment Steps

Jason LTL is optimized for Render's **Web Service** hosting on the **Free** or **Starter** tier.

### Option A: Standard Node Web Service on Render

1. Log in to [Render.com](https://dashboard.render.com).
2. Click **New +** &rarr; **Web Service**.
3. Connect your GitHub repository containing this codebase.
4. Configure the service settings:
   - **Name**: `jason-ltl`
   - **Region**: Choose the region closest to your traffic (e.g., US East / Oregon)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Plan**: `Free` or `Starter` ($7/mo)

5. Configure **Environment Variables** in the Render Dashboard:
   | Key | Value | Notes |
   |---|---|---|
   | `EMAIL` | `Jason@cylltd.com` | GLT Portal Login Email |
   | `PASS` | `<your-glt-password>` | GLT Portal Password (Secret) |
   | `NODE_ENV` | `production` | Enables production bundle |
   | `PORT` | `3000` | Render injects `PORT` automatically |

6. Click **Create Web Service**. Render will install, build the Vite frontend, bundle the Express server with esbuild into `dist/server.cjs`, and launch.

---

## 🔒 Security Architecture

- **Credentials Isolation**: The client application only communicates with `/api/*` endpoints. It has no knowledge of GLT passwords or raw internal session tokens.
- **Rate Concealment**: Original carrier rates are stripped on the server; the client payload only contains the final marked-up retail pricing.
- **Resource Efficient**: Puppeteer is pre-configured with flags (`--no-sandbox`, `--disable-dev-shm-usage`, `--single-process`) to operate within the 512MB RAM ceiling of Render's free tier.
