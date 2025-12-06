///////////////////////////////////////////////////////////////////////////////////////////////////////
//
// LOCAL TESTING SCRIPT FOR PLAYFAB CLOUD SCRIPT
//
// This script allows you to test your Cloud Script functions locally before publishing.
// It simulates the PlayFab Cloud Script environment.
//
// Usage: node test-cloud-script.js
//
///////////////////////////////////////////////////////////////////////////////////////////////////////

// Mock PlayFab objects
var mockServer = {
    GetTitleData: function(request) {
        // Simulate Title Data - you can modify this for testing
        return {
            Data: {
                "NETWORK_ENVIRONMENT": "testnet" // Change to "mainnet" to test mainnet config
            }
        };
    },
    GetUserInternalData: function(request) {
        return {
            Data: {}
        };
    },
    UpdateUserInternalData: function(request) {
        return { Success: true };
    },
    GetPlayerStatistics: function(request) {
        return {
            Statistics: []
        };
    },
    UpdatePlayerStatistics: function(request) {
        return { Success: true };
    }
};

var mockLog = {
    debug: function(msg, data) {
        console.log("[DEBUG]", msg, data || "");
    },
    info: function(msg, data) {
        console.log("[INFO]", msg, data || "");
    },
    warning: function(msg, data) {
        console.warn("[WARNING]", msg, data || "");
    },
    error: function(msg, data) {
        console.error("[ERROR]", msg, data || "");
    }
};

var mockHttp = {
    request: function(url, method, content, contentType, headers) {
        return {
            Code: 200,
            Status: "OK",
            Data: JSON.parse(content || "{}")
        };
    }
};

// Mock currentPlayerId
var currentPlayerId = "TEST_PLAYER_123";

// Mock handlers object
var handlers = {};

// Load the actual cloud script
// Note: In a real scenario, you would need to parse and execute the cloud script
// For now, we'll create a test structure

// Network Configuration (same as in cloud script)
var NETWORK_CONFIG = {
    testnet: {
        SUI_NETWORK: "https://fullnode.testnet.sui.io:443",
        PACKAGE_ID: "TESTNET_PACKAGE_ID",
        PUBLISHER_ID: "TESTNET_PUBLISHER_ID",
        TRANSFER_POLICY_ID: "TESTNET_TRANSFER_POLICY_ID",
        TRANSFER_POLICY_CAP_ID: "TESTNET_TRANSFER_POLICY_CAP_ID",
        COLLECTION_ID: "TESTNET_COLLECTION_ID",
        KIOSK_ID: "TESTNET_KIOSK_ID",
        KIOSK_OWNER_CAP_ID: "TESTNET_KIOSK_OWNER_CAP_ID",
        SUPPLY_CAP_ID: "TESTNET_SUPPLY_CAP_ID",
        COUNTER_ID: "TESTNET_COUNTER_ID",
        BLASTWHEELZ_TYPE: "TESTNET_BLASTWHEELZ_TYPE",
        LISTING_PRICE_MIST: 100000000,
        MINT_SUPPLY: 10,
        NEW_SUPPLY_LIMIT: 500,
        ENVIRONMENT: "testnet"
    },
    mainnet: {
        SUI_NETWORK: "https://fullnode.mainnet.sui.io:443",
        PACKAGE_ID: "MAINNET_PACKAGE_ID",
        PUBLISHER_ID: "MAINNET_PUBLISHER_ID",
        TRANSFER_POLICY_ID: "MAINNET_TRANSFER_POLICY_ID",
        TRANSFER_POLICY_CAP_ID: "MAINNET_TRANSFER_POLICY_CAP_ID",
        COLLECTION_ID: "MAINNET_COLLECTION_ID",
        KIOSK_ID: "MAINNET_KIOSK_ID",
        KIOSK_OWNER_CAP_ID: "MAINNET_KIOSK_OWNER_CAP_ID",
        SUPPLY_CAP_ID: "MAINNET_SUPPLY_CAP_ID",
        COUNTER_ID: "MAINNET_COUNTER_ID",
        BLASTWHEELZ_TYPE: "MAINNET_BLASTWHEELZ_TYPE",
        LISTING_PRICE_MIST: 100000000,
        MINT_SUPPLY: 10,
        NEW_SUPPLY_LIMIT: 500,
        ENVIRONMENT: "mainnet"
    }
};

function getNetworkConfig(args) {
    var network = "testnet";
    
    if (args && args.network) {
        network = args.network.toLowerCase();
    } else {
        try {
            var titleData = mockServer.GetTitleData({ Keys: ["NETWORK_ENVIRONMENT"] });
            if (titleData.Data && titleData.Data["NETWORK_ENVIRONMENT"]) {
                network = titleData.Data["NETWORK_ENVIRONMENT"].toLowerCase();
            }
        } catch (e) {
            mockLog.debug("Could not fetch network from Title Data, using default: " + network);
        }
    }
    
    if (network !== "testnet" && network !== "mainnet") {
        mockLog.warning("Invalid network specified: " + network + ". Defaulting to testnet.");
        network = "testnet";
    }
    
    var config = NETWORK_CONFIG[network];
    if (!config) {
        mockLog.error("Network config not found for: " + network);
        config = NETWORK_CONFIG.testnet;
    }
    
    mockLog.debug("Using network configuration: " + network);
    return {
        config: config,
        network: network
    };
}

// Test handlers
handlers.getNetworkConfig = function (args, context) {
    var networkInfo = getNetworkConfig(args);
    
    mockLog.info("Network Configuration Requested", {
        network: networkInfo.network,
        playerId: currentPlayerId
    });
    
    return {
        network: networkInfo.network,
        config: networkInfo.config,
        message: "Network configuration retrieved successfully"
    };
};

handlers.validateNetworkConfig = function (args, context) {
    var networkInfo = getNetworkConfig(args);
    var config = networkInfo.config;
    var missing = [];
    var warnings = [];
    
    var requiredFields = [
        "SUI_NETWORK",
        "PACKAGE_ID",
        "PUBLISHER_ID"
    ];
    
    var importantFields = [
        "COLLECTION_ID",
        "TRANSFER_POLICY_ID"
    ];
    
    for (var i = 0; i < requiredFields.length; i++) {
        if (!config[requiredFields[i]] || config[requiredFields[i]] === "") {
            missing.push(requiredFields[i]);
        }
    }
    
    for (var j = 0; j < importantFields.length; j++) {
        if (!config[importantFields[j]] || config[importantFields[j]] === "") {
            warnings.push(importantFields[j]);
        }
    }
    
    var isValid = missing.length === 0;
    
    if (!isValid) {
        mockLog.error("Network configuration validation failed", {
            network: networkInfo.network,
            missing: missing,
            warnings: warnings
        });
    } else {
        mockLog.info("Network configuration validated successfully", {
            network: networkInfo.network,
            warnings: warnings
        });
    }
    
    return {
        network: networkInfo.network,
        isValid: isValid,
        missing: missing,
        warnings: warnings,
        message: isValid ? "Configuration is valid" : "Configuration has missing required fields"
    };
};

handlers.getSuiNetworkInfo = function (args, context) {
    var networkInfo = getNetworkConfig(args);
    var config = networkInfo.config;
    
    return {
        network: networkInfo.network,
        suiNetworkUrl: config.SUI_NETWORK,
        packageId: config.PACKAGE_ID,
        collectionId: config.COLLECTION_ID,
        message: "Sui network information retrieved"
    };
};

// Add mint and transfer handlers to test script
handlers.mintNFT = function (args, context) {
    try {
        var networkInfo = getNetworkConfig(args);
        var config = networkInfo.config;
        
        if (!config.PACKAGE_ID || config.PACKAGE_ID === "") {
            throw new Error("PACKAGE_ID not configured for " + networkInfo.network);
        }
        if (!config.COLLECTION_ID || config.COLLECTION_ID === "") {
            throw new Error("COLLECTION_ID not configured for " + networkInfo.network);
        }
        if (!config.TRANSFER_POLICY_ID || config.TRANSFER_POLICY_ID === "") {
            throw new Error("TRANSFER_POLICY_ID not configured for " + networkInfo.network);
        }
        
        if (!args.name) throw new Error("name parameter is required");
        if (!args.imageUrl) throw new Error("imageUrl parameter is required");
        if (!args.projectUrl) throw new Error("projectUrl parameter is required");
        if (!args.alloyRim) throw new Error("alloyRim parameter is required");
        if (!args.frontBonnet) throw new Error("frontBonnet parameter is required");
        if (!args.backBonnet) throw new Error("backBonnet parameter is required");
        
        var blastwheelzType = config.BLASTWHEELZ_TYPE || (config.PACKAGE_ID + "::blastwheelz::Mustang");
        
        var transactionData = {
            network: networkInfo.network,
            suiNetworkUrl: config.SUI_NETWORK,
            function: "mint",
            packageId: config.PACKAGE_ID,
            module: "blastwheelz",
            functionName: "mint",
            typeArguments: [blastwheelzType],
            arguments: {
                collection: config.COLLECTION_ID,
                policy: config.TRANSFER_POLICY_ID,
                name: args.name,
                imageUrl: args.imageUrl,
                projectUrl: args.projectUrl,
                alloyRim: args.alloyRim,
                frontBonnet: args.frontBonnet,
                backBonnet: args.backBonnet
            },
            gasBudget: 150000000,
            playerId: currentPlayerId,
            timestamp: new Date().toISOString()
        };
        
        mockLog.info("Mint NFT Request", {
            playerId: currentPlayerId,
            network: networkInfo.network,
            nftName: args.name
        });
        
        return {
            success: true,
            network: networkInfo.network,
            transactionData: transactionData,
            message: "Mint transaction data prepared"
        };
    } catch (error) {
        mockLog.error("Error in mintNFT", { error: error.message });
        return {
            success: false,
            error: error.message,
            message: "Failed to prepare mint transaction"
        };
    }
};

handlers.transferNFT = function (args, context) {
    try {
        var networkInfo = getNetworkConfig(args);
        var config = networkInfo.config;
        
        if (!args.nftObjectId) throw new Error("nftObjectId parameter is required");
        if (!args.recipient) throw new Error("recipient parameter is required");
        
        if (!args.recipient.startsWith("0x") || args.recipient.length < 40) {
            throw new Error("Invalid recipient address format");
        }
        
        var transactionData = {
            network: networkInfo.network,
            suiNetworkUrl: config.SUI_NETWORK,
            function: "transfer",
            nftObjectId: args.nftObjectId,
            recipient: args.recipient,
            gasBudget: 10000000,
            playerId: currentPlayerId,
            timestamp: new Date().toISOString()
        };
        
        mockLog.info("Transfer NFT Request", {
            playerId: currentPlayerId,
            network: networkInfo.network,
            nftObjectId: args.nftObjectId,
            recipient: args.recipient
        });
        
        return {
            success: true,
            network: networkInfo.network,
            transactionData: transactionData,
            message: "Transfer transaction data prepared"
        };
    } catch (error) {
        mockLog.error("Error in transferNFT", { error: error.message });
        return {
            success: false,
            error: error.message,
            message: "Failed to prepare transfer transaction"
        };
    }
};

///////////////////////////////////////////////////////////////////////////////////////////////////////
//
// TEST RUNNER
//
///////////////////////////////////////////////////////////////////////////////////////////////////////

function runTests() {
    console.log("=".repeat(60));
    console.log("PLAYFAB CLOUD SCRIPT LOCAL TESTING");
    console.log("=".repeat(60));
    console.log("");
    
    // Test 1: Get testnet config
    console.log("TEST 1: Get Testnet Configuration");
    console.log("-".repeat(60));
    var result1 = handlers.getNetworkConfig({ network: "testnet" }, {});
    console.log(JSON.stringify(result1, null, 2));
    console.log("");
    
    // Test 2: Get mainnet config
    console.log("TEST 2: Get Mainnet Configuration");
    console.log("-".repeat(60));
    var result2 = handlers.getNetworkConfig({ network: "mainnet" }, {});
    console.log(JSON.stringify(result2, null, 2));
    console.log("");
    
    // Test 3: Get config from Title Data (default)
    console.log("TEST 3: Get Configuration from Title Data (Default)");
    console.log("-".repeat(60));
    var result3 = handlers.getNetworkConfig({}, {});
    console.log(JSON.stringify(result3, null, 2));
    console.log("");
    
    // Test 4: Validate testnet config
    console.log("TEST 4: Validate Testnet Configuration");
    console.log("-".repeat(60));
    var result4 = handlers.validateNetworkConfig({ network: "testnet" }, {});
    console.log(JSON.stringify(result4, null, 2));
    console.log("");
    
    // Test 5: Validate mainnet config
    console.log("TEST 5: Validate Mainnet Configuration");
    console.log("-".repeat(60));
    var result5 = handlers.validateNetworkConfig({ network: "mainnet" }, {});
    console.log(JSON.stringify(result5, null, 2));
    console.log("");
    
    // Test 6: Get Sui network info
    console.log("TEST 6: Get Sui Network Info (Testnet)");
    console.log("-".repeat(60));
    var result6 = handlers.getSuiNetworkInfo({ network: "testnet" }, {});
    console.log(JSON.stringify(result6, null, 2));
    console.log("");
    
    // Test 7: Invalid network (should default to testnet)
    console.log("TEST 7: Invalid Network (Should Default to Testnet)");
    console.log("-".repeat(60));
    var result7 = handlers.getNetworkConfig({ network: "invalid" }, {});
    console.log(JSON.stringify(result7, null, 2));
    console.log("");
    
    // Test 8: Mint NFT (testnet)
    console.log("TEST 8: Mint NFT (Testnet)");
    console.log("-".repeat(60));
    var result8 = handlers.mintNFT({
        network: "testnet",
        name: "Test Mustang NFT",
        imageUrl: "https://example.com/image.jpg",
        projectUrl: "https://blastwheelz.io",
        alloyRim: "Chrome Alloy Rims",
        frontBonnet: "Carbon Fiber Front Bonnet",
        backBonnet: "Carbon Fiber Back Bonnet"
    }, {});
    console.log(JSON.stringify(result8, null, 2));
    console.log("");
    
    // Test 9: Transfer NFT (testnet)
    console.log("TEST 9: Transfer NFT (Testnet)");
    console.log("-".repeat(60));
    var result9 = handlers.transferNFT({
        network: "testnet",
        nftObjectId: "0x1234567890abcdef1234567890abcdef12345678",
        recipient: "0xabcdef1234567890abcdef1234567890abcdef12"
    }, {});
    console.log(JSON.stringify(result9, null, 2));
    console.log("");
    
    // Test 10: Mint NFT Validation (missing parameters)
    console.log("TEST 10: Mint NFT Validation (Missing Parameters)");
    console.log("-".repeat(60));
    var result10 = handlers.mintNFT({
        network: "testnet",
        name: "Test NFT"
        // Missing other required parameters
    }, {});
    console.log(JSON.stringify(result10, null, 2));
    console.log("");
    
    // Test 11: Transfer NFT Validation (invalid address)
    console.log("TEST 11: Transfer NFT Validation (Invalid Address)");
    console.log("-".repeat(60));
    var result11 = handlers.transferNFT({
        network: "testnet",
        nftObjectId: "0x1234567890abcdef1234567890abcdef12345678",
        recipient: "invalid-address"
    }, {});
    console.log(JSON.stringify(result11, null, 2));
    console.log("");
    
    console.log("=".repeat(60));
    console.log("ALL TESTS COMPLETED");
    console.log("=".repeat(60));
}

// Run tests
runTests();

