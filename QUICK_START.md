# Quick Start - Make Mint Function Execute on Blockchain

## The Problem
PlayFab Cloud Script **CANNOT** execute Sui transactions directly because it can't:
- Import npm packages (`@mysten/sui`)
- Sign transactions (needs private key)
- Use TypeScript/Node.js features

## The Solution
Use a backend service that executes the transaction.

## Setup (5 minutes)

### Step 1: Start Backend Service

```bash
cd playfeb
npm install express @mysten/sui dotenv
npm install -D ts-node typescript @types/express @types/node

# Create .env file
echo "PRIVATE_KEY=suiprivkey1qpqvahn5pprg8w7hqve5n5k4q2vp932pwgu3nwl9d6792jrx0rxh2wcknyz" > .env
echo "PORT=3000" >> .env

# Run backend
npm start
```

### Step 2: Set Backend URL in PlayFab

**Option A: In Title Data (Recommended)**
1. Go to PlayFab Game Manager
2. Navigate to **Content** > **Title Data**
3. Add key: `BACKEND_SERVICE_URL`
4. Value: `http://your-server.com:3000/mint`

**Option B: In Function Call**
Just add to your arguments:
```json
{
    "backendServiceUrl": "http://your-server.com:3000/mint",
    ...other args...
}
```

### Step 3: Test

Call `mintNFT` in PlayFab - it will automatically execute on the blockchain!

## What Happens Now

1. PlayFab prepares transaction data ✅
2. PlayFab automatically calls your backend service ✅
3. Backend signs and executes on Sui blockchain ✅
4. Returns transaction digest, NFT ID, etc. ✅

## Deploy Backend

Deploy `backend-service-example.ts` to:
- Heroku (free tier works)
- AWS Lambda
- Google Cloud Functions
- Your own server

Then update `BACKEND_SERVICE_URL` in PlayFab Title Data.

That's it! Your mint function will now actually mint on the blockchain! 🚀

