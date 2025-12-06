# NFT Minting and Transfer Guide

This guide explains how to use the `mintNFT` and `transferNFT` functions in your PlayFab Cloud Script.

## Overview

The PlayFab Cloud Script includes two main functions for NFT operations:
1. **`mintNFT`** - Mints a new NFT on the Sui blockchain
2. **`transferNFT`** - Transfers an existing NFT to another address

Both functions use the network configuration (testnet/mainnet) and prepare transaction data that can be executed by a backend service or Sui client.

## Mint NFT Function

### Function: `mintNFT`

Mints a new BlastWheelz NFT directly into a new kiosk with the transfer policy attached.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `network` | string | No | Network to use: `"testnet"` or `"mainnet"`. Defaults to Title Data or testnet |
| `name` | string | **Yes** | NFT name |
| `imageUrl` | string | **Yes** | URL to the NFT image |
| `projectUrl` | string | **Yes** | Project website URL |
| `alloyRim` | string | **Yes** | Alloy rim description |
| `frontBonnet` | string | **Yes** | Front bonnet description |
| `backBonnet` | string | **Yes** | Back bonnet description |
| `backendServiceUrl` | string | No | Optional URL to backend service that executes the transaction |
| `playerSuiAddress` | string | No | Optional Sui address of the player (for tracking) |

### Example Usage

#### From Game Client (JavaScript/TypeScript)

```javascript
// Using PlayFab Client SDK
PlayFabClientSDK.ExecuteCloudScript({
    FunctionName: "mintNFT",
    FunctionParameter: {
        network: "testnet", // or "mainnet"
        name: "Mustang NFT #1",
        imageUrl: "https://example.com/mustang.jpg",
        projectUrl: "https://blastwheelz.io",
        alloyRim: "Chrome Alloy Rims",
        frontBonnet: "Carbon Fiber Front Bonnet",
        backBonnet: "Carbon Fiber Back Bonnet",
        playerSuiAddress: "0xYourSuiAddress..." // Optional
    }
}, (result) => {
    if (result.data.FunctionResult.success) {
        console.log("Mint transaction prepared:", result.data.FunctionResult.transactionData);
        // Send transactionData to your backend service to execute
    } else {
        console.error("Error:", result.data.FunctionResult.error);
    }
});
```

#### Response Format

**Success Response:**
```json
{
    "success": true,
    "network": "testnet",
    "transactionData": {
        "network": "testnet",
        "suiNetworkUrl": "https://fullnode.testnet.sui.io:443",
        "function": "mint",
        "packageId": "0x...",
        "module": "blastwheelz",
        "functionName": "mint",
        "typeArguments": ["0x...::blastwheelz::Mustang"],
        "arguments": {
            "collection": "0x...",
            "policy": "0x...",
            "name": "Mustang NFT #1",
            "imageUrl": "https://example.com/mustang.jpg",
            "projectUrl": "https://blastwheelz.io",
            "alloyRim": "Chrome Alloy Rims",
            "frontBonnet": "Carbon Fiber Front Bonnet",
            "backBonnet": "Carbon Fiber Back Bonnet"
        },
        "gasBudget": 150000000,
        "playerId": "PLAYER_ID",
        "timestamp": "2024-01-01T00:00:00.000Z"
    },
    "message": "Mint transaction data prepared. Execute using a backend service or Sui client."
}
```

**Error Response:**
```json
{
    "success": false,
    "error": "name parameter is required",
    "message": "Failed to prepare mint transaction"
}
```

### What Happens

1. **Validation**: Validates network configuration and all required parameters
2. **Transaction Preparation**: Creates transaction data with all necessary information
3. **Player Data Storage**: Stores the mint request in PlayFab player data for tracking
4. **Backend Service Call** (if provided): Optionally calls your backend service to execute the transaction
5. **Response**: Returns transaction data that can be executed by a backend service

### Important Notes

- The function **does not** directly execute the blockchain transaction
- It prepares the transaction data that must be executed by:
  - A backend service (if `backendServiceUrl` is provided)
  - Your game client using Sui SDK
  - A separate transaction execution service
- The transaction requires gas fees (approximately 0.15 SUI)
- The minted NFT will be locked in a shared kiosk with transfer policy attached

---

## Transfer NFT Function

### Function: `transferNFT`

Transfers an existing NFT to another Sui address.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `network` | string | No | Network to use: `"testnet"` or `"mainnet"`. Defaults to Title Data or testnet |
| `nftObjectId` | string | **Yes** | The NFT object ID to transfer |
| `recipient` | string | **Yes** | Recipient Sui address (must start with `0x` and be valid) |
| `backendServiceUrl` | string | No | Optional URL to backend service that executes the transaction |
| `playerSuiAddress` | string | No | Optional Sui address of the sender (for validation) |

### Example Usage

#### From Game Client (JavaScript/TypeScript)

```javascript
// Using PlayFab Client SDK
PlayFabClientSDK.ExecuteCloudScript({
    FunctionName: "transferNFT",
    FunctionParameter: {
        network: "testnet", // or "mainnet"
        nftObjectId: "0x1234567890abcdef1234567890abcdef12345678",
        recipient: "0xabcdef1234567890abcdef1234567890abcdef12",
        playerSuiAddress: "0xYourSuiAddress..." // Optional
    }
}, (result) => {
    if (result.data.FunctionResult.success) {
        console.log("Transfer transaction prepared:", result.data.FunctionResult.transactionData);
        // Send transactionData to your backend service to execute
    } else {
        console.error("Error:", result.data.FunctionResult.error);
    }
});
```

#### Response Format

**Success Response:**
```json
{
    "success": true,
    "network": "testnet",
    "transactionData": {
        "network": "testnet",
        "suiNetworkUrl": "https://fullnode.testnet.sui.io:443",
        "function": "transfer",
        "nftObjectId": "0x1234567890abcdef1234567890abcdef12345678",
        "recipient": "0xabcdef1234567890abcdef1234567890abcdef12",
        "gasBudget": 10000000,
        "playerId": "PLAYER_ID",
        "timestamp": "2024-01-01T00:00:00.000Z"
    },
    "message": "Transfer transaction data prepared. Execute using a backend service or Sui client."
}
```

**Error Response:**
```json
{
    "success": false,
    "error": "nftObjectId parameter is required",
    "message": "Failed to prepare transfer transaction"
}
```

### What Happens

1. **Validation**: Validates network configuration, NFT object ID, and recipient address
2. **Transaction Preparation**: Creates transaction data for the transfer
3. **Player Data Storage**: Stores the transfer request in PlayFab player data for tracking
4. **Backend Service Call** (if provided): Optionally calls your backend service to execute the transaction
5. **Response**: Returns transaction data that can be executed by a backend service

### Important Notes

- The function **does not** directly execute the blockchain transaction
- It prepares the transaction data that must be executed by a backend service or Sui client
- The transaction requires gas fees (approximately 0.01 SUI)
- The recipient address must be a valid Sui address (starts with `0x`, at least 40 characters)

---

## Additional Functions

### Get Mint History

Retrieves the minting history for the current player.

```javascript
PlayFabClientSDK.ExecuteCloudScript({
    FunctionName: "getMintHistory",
    FunctionParameter: {}
}, (result) => {
    console.log("Mint History:", result.data.FunctionResult.mintHistory);
});
```

### Get Transfer History

Retrieves the transfer history for the current player.

```javascript
PlayFabClientSDK.ExecuteCloudScript({
    FunctionName: "getTransferHistory",
    FunctionParameter: {}
}, (result) => {
    console.log("Transfer History:", result.data.FunctionResult.transferHistory);
});
```

---

## Backend Service Integration

If you provide a `backendServiceUrl`, the Cloud Script will automatically call your backend service with the transaction data. Your backend service should:

1. Receive the transaction data
2. Sign the transaction using a wallet (with private key/mnemonic)
3. Execute the transaction on the Sui blockchain
4. Return the transaction result

### Backend Service Request Format

```json
{
    "action": "mint", // or "transfer"
    "transactionData": {
        // ... transaction data from Cloud Script
    },
    "playerId": "PLAYER_ID"
}
```

### Backend Service Response Format

Your backend should return a JSON response with the transaction result:

```json
{
    "success": true,
    "transactionDigest": "0x...",
    "nftObjectId": "0x...", // For mint operations
    "kioskId": "0x...", // For mint operations
    "kioskOwnerCapId": "0x..." // For mint operations
}
```

---

## Error Handling

All functions return a `success` boolean and an `error` message if something goes wrong. Common errors:

- **Configuration Errors**: Missing PACKAGE_ID, COLLECTION_ID, or TRANSFER_POLICY_ID
- **Parameter Errors**: Missing required parameters
- **Validation Errors**: Invalid recipient address format
- **Network Errors**: Backend service call failures

Always check the `success` field before processing the response.

---

## Testing

Before publishing, test your functions locally:

```bash
cd playfeb
node test-cloud-script.js
```

This will run all tests including mint and transfer function tests.

---

## Security Considerations

1. **Never expose private keys** in Cloud Script or client code
2. **Validate all inputs** on the backend service
3. **Use backend service** for actual transaction execution
4. **Store sensitive data** in PlayFab Secret Keys or Title Data
5. **Rate limit** mint and transfer operations to prevent abuse
6. **Validate player ownership** of NFTs before allowing transfers

---

## Next Steps

1. Fill in your network configuration variables in `cloud-script-playfeb.js`
2. Set up a backend service to execute transactions (or use Sui client directly)
3. Test functions locally using `test-cloud-script.js`
4. Test in PlayFab using ExecuteCloudScript API
5. Integrate with your game client

