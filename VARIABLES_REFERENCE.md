# Network Configuration Variables Reference

## Complete List of Variables

### For Both Testnet and Mainnet

You need to fill in these variables in the `NETWORK_CONFIG` object in `cloud-script-playfeb.js`:

| Variable Name | Description | Example Value |
|--------------|-------------|---------------|
| `SUI_NETWORK` | Sui network RPC URL | `"https://fullnode.testnet.sui.io:443"` |
| `PACKAGE_ID` | Your deployed package ID | `"0x1234567890abcdef..."` |
| `PUBLISHER_ID` | Your publisher object ID | `"0xabcdef1234567890..."` |
| `TRANSFER_POLICY_ID` | Transfer policy object ID | `"0x9876543210fedcba..."` |
| `TRANSFER_POLICY_CAP_ID` | Transfer policy cap object ID | `"0xfedcba0987654321..."` |
| `COLLECTION_ID` | Collection object ID | `"0x1111111111111111..."` |
| `KIOSK_ID` | Kiosk object ID | `"0x2222222222222222..."` |
| `KIOSK_OWNER_CAP_ID` | Kiosk owner cap object ID | `"0x3333333333333333..."` |
| `SUPPLY_CAP_ID` | Supply cap object ID | `"0x4444444444444444..."` |
| `COUNTER_ID` | Counter object ID | `"0x5555555555555555..."` |
| `BLASTWHEELZ_TYPE` | Blastwheelz type string | `"0x...::blastwheelz::Mustang"` |
| `LISTING_PRICE_MIST` | Default listing price in MIST | `100000000` |
| `MINT_SUPPLY` | Default mint supply | `10` |
| `NEW_SUPPLY_LIMIT` | Default supply limit | `500` |
| `ENVIRONMENT` | Environment identifier | `"testnet"` or `"mainnet"` |

## Required vs Optional

### Required Variables (Validation will fail if missing)
- ✅ `SUI_NETWORK`
- ✅ `PACKAGE_ID`
- ✅ `PUBLISHER_ID`

### Important Variables (Warnings if missing)
- ⚠️ `COLLECTION_ID`
- ⚠️ `TRANSFER_POLICY_ID`

### Optional Variables (No validation)
- `TRANSFER_POLICY_CAP_ID`
- `KIOSK_ID`
- `KIOSK_OWNER_CAP_ID`
- `SUPPLY_CAP_ID`
- `COUNTER_ID`
- `BLASTWHEELZ_TYPE`
- `LISTING_PRICE_MIST`
- `MINT_SUPPLY`
- `NEW_SUPPLY_LIMIT`

## Quick Setup Checklist

### Step 1: Open the Script
```bash
open playfeb/cloud-script-playfeb.js
```

### Step 2: Find NETWORK_CONFIG (around line 50)
Look for:
```javascript
var NETWORK_CONFIG = {
    testnet: { ... },
    mainnet: { ... }
};
```

### Step 3: Fill in Testnet Values
Replace empty strings with your actual testnet values:
```javascript
testnet: {
    SUI_NETWORK: "https://fullnode.testnet.sui.io:443",
    PACKAGE_ID: "0xYourTestnetPackageId",
    PUBLISHER_ID: "0xYourTestnetPublisherId",
    // ... etc
}
```

### Step 4: Fill in Mainnet Values
Replace empty strings with your actual mainnet values:
```javascript
mainnet: {
    SUI_NETWORK: "https://fullnode.mainnet.sui.io:443",
    PACKAGE_ID: "0xYourMainnetPackageId",
    PUBLISHER_ID: "0xYourMainnetPublisherId",
    // ... etc
}
```

### Step 5: Test Locally
```bash
cd playfeb
node test-cloud-script.js
```

### Step 6: Validate Configuration
Test the validation function:
```javascript
// In PlayFab or test script
handlers.validateNetworkConfig({ network: "testnet" }, {});
handlers.validateNetworkConfig({ network: "mainnet" }, {});
```

## Usage Examples

### Get All Config Values
```javascript
var networkInfo = getNetworkConfig(args);
var config = networkInfo.config;
// Now use: config.PACKAGE_ID, config.COLLECTION_ID, etc.
```

### Get Single Value
```javascript
var packageId = getConfigValue(args, "PACKAGE_ID");
```

### Use in Function
```javascript
handlers.myFunction = function (args, context) {
    var networkInfo = getNetworkConfig(args);
    var config = networkInfo.config;
    
    // Use config values
    var result = {
        network: networkInfo.network,
        packageId: config.PACKAGE_ID,
        collectionId: config.COLLECTION_ID
    };
    
    return result;
};
```

## Network Selection Priority

1. **Function Parameter** (`args.network`) - Highest priority
2. **Title Data** (`NETWORK_ENVIRONMENT` key) - Medium priority
3. **Default** (`testnet`) - Fallback

## Testing Commands

### Test Testnet Config
```javascript
handlers.getNetworkConfig({ network: "testnet" }, {});
```

### Test Mainnet Config
```javascript
handlers.getNetworkConfig({ network: "mainnet" }, {});
```

### Validate Config
```javascript
handlers.validateNetworkConfig({ network: "testnet" }, {});
```

## Notes

- All object IDs should be strings starting with `"0x"`
- MIST values are numbers (not strings)
- Environment should be exactly `"testnet"` or `"mainnet"` (lowercase)
- Empty strings will trigger validation warnings/errors
- You can leave optional fields as empty strings if not needed

