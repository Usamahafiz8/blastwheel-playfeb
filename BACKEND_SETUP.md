# Backend Service Setup

To make the `mintNFT` function actually execute on the blockchain, you need a backend service.

## Quick Setup

### 1. Install Dependencies

```bash
cd playfeb
npm install express @mysten/sui dotenv
npm install -D @types/express @types/node ts-node typescript
```

### 2. Create `.env` file

```bash
PRIVATE_KEY=suiprivkey1qpqvahn5pprg8w7hqve5n5k4q2vp932pwgu3nwl9d6792jrx0rxh2wcknyz
# OR
# MNEMONIC=your mnemonic phrase here
PORT=3000
```

### 3. Run the Service

```bash
npm start
```

### 4. Use in PlayFab

In your PlayFab `mintNFT` function call, add:

```json
{
    "network": "testnet",
    "name": "Mustang NFT #1",
    "imageUrl": "https://example.com/image.jpg",
    "projectUrl": "https://blastwheelz.io",
    "alloyRim": "Chrome Alloy Rims",
    "frontBonnet": "Carbon Fiber Front Bonnet",
    "backBonnet": "Carbon Fiber Back Bonnet",
    "backendServiceUrl": "http://your-server.com:3000/mint"
}
```

## How It Works

1. PlayFab prepares transaction data
2. PlayFab calls your backend service with the data
3. Backend signs and executes the transaction
4. Backend returns the result (transaction digest, NFT ID, etc.)

## Deploy

Deploy to:
- Heroku
- AWS Lambda
- Google Cloud Functions
- Your own server

Then update `backendServiceUrl` in PlayFab to point to your deployed service.

