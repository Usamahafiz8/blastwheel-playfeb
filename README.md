# PlayFab Cloud Script - Network Configuration Guide

This guide explains how to use the testnet and mainnet configuration variables in your PlayFab Cloud Script.

## Overview

The Cloud Script now includes a network configuration system that allows you to:
- Define separate variables for testnet and mainnet
- Switch between environments dynamically
- Test configurations before publishing

## Configuration Variables

### Testnet Variables
- `SUI_NETWORK`: Sui testnet RPC URL
- `PACKAGE_ID`: Your testnet package ID
- `PUBLISHER_ID`: Your testnet publisher ID
- `TRANSFER_POLICY_ID`: Your testnet transfer policy ID
- `TRANSFER_POLICY_CAP_ID`: Your testnet transfer policy cap ID
- `COLLECTION_ID`: Your testnet collection ID
- `KIOSK_ID`: Your testnet kiosk ID
- `KIOSK_OWNER_CAP_ID`: Your testnet kiosk owner cap ID
- `SUPPLY_CAP_ID`: Your testnet supply cap ID
- `COUNTER_ID`: Your testnet counter ID
- `BLASTWHEELZ_TYPE`: Your testnet blastwheelz type
- `LISTING_PRICE_MIST`: Default listing price in MIST
- `MINT_SUPPLY`: Default mint supply
- `NEW_SUPPLY_LIMIT`: Default supply limit

### Mainnet Variables
Same variables as testnet, but with mainnet values.

## How to Set Variables

### Method 1: Edit the Script Directly (Recommended for Testing)

1. Open `cloud-script-playfeb.js`
2. Find the `NETWORK_CONFIG` object (around line 50)
3. Fill in your testnet and mainnet values:

```javascript
var NETWORK_CONFIG = {
    testnet: {
        SUI_NETWORK: "https://fullnode.testnet.sui.io:443",
        PACKAGE_ID: "0xYourTestnetPackageId",
        PUBLISHER_ID: "0xYourTestnetPublisherId",
        // ... fill in all other values
    },
    mainnet: {
        SUI_NETWORK: "https://fullnode.mainnet.sui.io:443",
        PACKAGE_ID: "0xYourMainnetPackageId",
        PUBLISHER_ID: "0xYourMainnetPublisherId",
        // ... fill in all other values
    }
};
```

### Method 2: Use PlayFab Title Data (Recommended for Production)

1. Go to PlayFab Game Manager
2. Navigate to **Content** > **Title Data**
3. Add a key: `NETWORK_ENVIRONMENT` with value: `testnet` or `mainnet`
4. The script will automatically use this value

## How to Use in Functions

### Example 1: Get Network Configuration

```javascript
handlers.myFunction = function (args, context) {
    // Get network config (will use args.network or Title Data)
    var networkInfo = getNetworkConfig(args);
    var config = networkInfo.config;
    
    // Use the config values
    var packageId = config.PACKAGE_ID;
    var suiNetwork = config.SUI_NETWORK;
    
    return {
        packageId: packageId,
        network: networkInfo.network
    };
};
```

### Example 2: Specify Network in Function Call

When calling from your game client:

```javascript
// Testnet
PlayFabClientSDK.ExecuteCloudScript({
    FunctionName: "myFunction",
    FunctionParameter: {
        network: "testnet",
        // other parameters
    }
});

// Mainnet
PlayFabClientSDK.ExecuteCloudScript({
    FunctionName: "myFunction",
    FunctionParameter: {
        network: "mainnet",
        // other parameters
    }
});
```

### Example 3: Get Specific Config Value

```javascript
handlers.getPackageId = function (args, context) {
    var packageId = getConfigValue(args, "PACKAGE_ID");
    return { packageId: packageId };
};
```

## Testing Functions

### Available Test Functions

1. **`getNetworkConfig`**: Returns the current network configuration
   ```javascript
   { network: "testnet" } // or "mainnet"
   ```

2. **`validateNetworkConfig`**: Validates that all required fields are set
   ```javascript
   { network: "testnet" }
   ```

3. **`getSuiNetworkInfo`**: Returns Sui network information
   ```javascript
   { network: "testnet" }
   ```

### Local Testing

Before publishing to PlayFab, you can test locally:

```bash
cd playfeb
node test-cloud-script.js
```

This will run all test functions and show you the results.

## Testing Checklist

Before publishing your Cloud Script:

- [ ] Fill in all testnet variables in `NETWORK_CONFIG.testnet`
- [ ] Fill in all mainnet variables in `NETWORK_CONFIG.mainnet`
- [ ] Run local tests: `node test-cloud-script.js`
- [ ] Test `getNetworkConfig` with both networks
- [ ] Test `validateNetworkConfig` to ensure all required fields are set
- [ ] Test your custom functions that use the network config
- [ ] Publish to PlayFab
- [ ] Test in PlayFab using ExecuteCloudScript API

## Priority Order

The script determines which network to use in this order:

1. **Function Parameter**: If `args.network` is provided, use that
2. **Title Data**: If `NETWORK_ENVIRONMENT` is set in Title Data, use that
3. **Default**: Falls back to `testnet` for safety

## Security Notes

- Never hardcode sensitive keys or private keys in the script
- Use PlayFab Title Data for sensitive configuration
- Consider using PlayFab Secret Keys for highly sensitive data
- Always validate network values before using them

## Example: Complete Function Using Network Config

```javascript
handlers.mintNFT = function (args, context) {
    // Get network configuration
    var networkInfo = getNetworkConfig(args);
    var config = networkInfo.config;
    
    // Validate required fields
    if (!config.PACKAGE_ID || !config.COLLECTION_ID) {
        return {
            success: false,
            error: "Network configuration incomplete"
        };
    }
    
    // Use config values
    var mintRequest = {
        network: networkInfo.network,
        packageId: config.PACKAGE_ID,
        collectionId: config.COLLECTION_ID,
        suiNetwork: config.SUI_NETWORK,
        // ... other parameters
    };
    
    // Make API call or process minting logic
    // ...
    
    return {
        success: true,
        network: networkInfo.network,
        result: mintRequest
    };
};
```

## Troubleshooting

### Issue: Wrong network being used
- Check if `args.network` is being passed correctly
- Verify Title Data `NETWORK_ENVIRONMENT` value
- Check logs for network selection messages

### Issue: Missing configuration values
- Run `validateNetworkConfig` function to see what's missing
- Ensure all required fields are filled in `NETWORK_CONFIG`

### Issue: Function not working
- Test locally first with `test-cloud-script.js`
- Check PlayFab Cloud Script logs
- Verify network configuration is correct

## Next Steps

1. Fill in your actual testnet and mainnet values
2. Test locally using the test script
3. Add your custom functions that use the network config
4. Test in PlayFab
5. Deploy to production

