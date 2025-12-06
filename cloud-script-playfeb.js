///////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Welcome to your first Cloud Script revision!
//
// Cloud Script runs in the PlayFab cloud and has full access to the PlayFab Game Server API 
// (https://api.playfab.com/Documentation/Server), and it runs in the context of a securely
// authenticated player, so you can use it to implement logic for your game that is safe from
// client-side exploits. 
//
// Cloud Script functions can also make web requests to external HTTPS
// endpoints, such as a database or private API for your title, which makes them a flexible
// way to integrate with your existing backend systems.
//
// There are several different options for calling Cloud Script functions:
//
// 1) Your game client calls them directly using the "ExecuteCloudScript" API,
// passing in the function name and arguments in the request and receiving the 
// function return result in the response.
// (https://api.playfab.com/Documentation/Client/method/ExecuteCloudScript)
// 
// 2) You create PlayStream event actions that call them when a particular 
// event occurs, passing in the event and associated player profile data.
// (https://api.playfab.com/playstream/docs)
// 
// 3) For titles using the Photon Add-on (https://playfab.com/marketplace/photon/),
// Photon room events trigger webhooks which call corresponding Cloud Script functions.
// 
// The following examples demonstrate all three options.
//
///////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////
//
// NETWORK CONFIGURATION - TESTNET AND MAINNET
//
// This section defines configuration variables for both testnet and mainnet environments.
// You can switch between environments by passing 'network' parameter in function calls,
// or by setting it in PlayFab Title Data.
//
///////////////////////////////////////////////////////////////////////////////////////////////////////

// Network Configuration Object
var NETWORK_CONFIG = {
    testnet: {
        SUI_NETWORK: "https://fullnode.testnet.sui.io:443",
        PACKAGE_ID: "",  // Add your testnet package ID
        PUBLISHER_ID: "",  // Add your testnet publisher ID
        TRANSFER_POLICY_ID: "",  // Add your testnet transfer policy ID
        TRANSFER_POLICY_CAP_ID: "",  // Add your testnet transfer policy cap ID
        COLLECTION_ID: "",  // Add your testnet collection ID
        KIOSK_ID: "",  // Add your testnet kiosk ID
        KIOSK_OWNER_CAP_ID: "",  // Add your testnet kiosk owner cap ID
        SUPPLY_CAP_ID: "",  // Add your testnet supply cap ID
        COUNTER_ID: "",  // Add your testnet counter ID
        BLASTWHEELZ_TYPE: "",  // Add your testnet blastwheelz type (e.g., "0x...::blastwheelz::Mustang")
        LISTING_PRICE_MIST: 100000000,  // Default listing price in MIST
        MINT_SUPPLY: 10,  // Default mint supply
        NEW_SUPPLY_LIMIT: 500,  // Default supply limit
        ENVIRONMENT: "testnet"
    },
    mainnet: {
        SUI_NETWORK: "https://fullnode.mainnet.sui.io:443",
        PACKAGE_ID: "",  // Add your mainnet package ID
        PUBLISHER_ID: "",  // Add your mainnet publisher ID
        TRANSFER_POLICY_ID: "",  // Add your mainnet transfer policy ID
        TRANSFER_POLICY_CAP_ID: "",  // Add your mainnet transfer policy cap ID
        COLLECTION_ID: "",  // Add your mainnet collection ID
        KIOSK_ID: "",  // Add your mainnet kiosk ID
        KIOSK_OWNER_CAP_ID: "",  // Add your mainnet kiosk owner cap ID
        SUPPLY_CAP_ID: "",  // Add your mainnet supply cap ID
        COUNTER_ID: "",  // Add your mainnet counter ID
        BLASTWHEELZ_TYPE: "",  // Add your mainnet blastwheelz type (e.g., "0x...::blastwheelz::Mustang")
        LISTING_PRICE_MIST: 100000000,  // Default listing price in MIST
        MINT_SUPPLY: 10,  // Default mint supply
        NEW_SUPPLY_LIMIT: 500,  // Default supply limit
        ENVIRONMENT: "mainnet"
    }
};

// Helper function to get current network configuration
// Priority: 1) args.network parameter, 2) Title Data, 3) Default to testnet
function getNetworkConfig(args) {
    var network = "testnet"; // Default to testnet for safety
    
    // Check if network is passed in args
    if (args && args.network) {
        network = args.network.toLowerCase();
    } else {
        // Try to get from Title Data (recommended approach)
        try {
            var titleData = server.GetTitleData({ Keys: ["NETWORK_ENVIRONMENT"] });
            if (titleData.Data && titleData.Data["NETWORK_ENVIRONMENT"]) {
                network = titleData.Data["NETWORK_ENVIRONMENT"].toLowerCase();
            }
        } catch (e) {
            log.debug("Could not fetch network from Title Data, using default: " + network);
        }
    }
    
    // Validate network
    if (network !== "testnet" && network !== "mainnet") {
        log.warning("Invalid network specified: " + network + ". Defaulting to testnet.");
        network = "testnet";
    }
    
    var config = NETWORK_CONFIG[network];
    if (!config) {
        log.error("Network config not found for: " + network);
        config = NETWORK_CONFIG.testnet; // Fallback to testnet
    }
    
    log.debug("Using network configuration: " + network);
    return {
        config: config,
        network: network
    };
}

// Helper function to get a specific config value
function getConfigValue(args, key) {
    var networkInfo = getNetworkConfig(args);
    return networkInfo.config[key];
}


///////////////////////////////////////////////////////////////////////////////////////////////////////
//
// TESTING AND UTILITY FUNCTIONS
//
///////////////////////////////////////////////////////////////////////////////////////////////////////

// Test function to display all network configuration variables
// Usage: Call with { network: "testnet" } or { network: "mainnet" }
handlers.getNetworkConfig = function (args, context) {
    var networkInfo = getNetworkConfig(args);
    
    log.info("Network Configuration Requested", {
        network: networkInfo.network,
        playerId: currentPlayerId
    });
    
    // Return config (excluding sensitive data if needed)
    return {
        network: networkInfo.network,
        config: networkInfo.config,
        message: "Network configuration retrieved successfully"
    };
};

// Function to validate network configuration
// Checks if all required variables are set
handlers.validateNetworkConfig = function (args, context) {
    var networkInfo = getNetworkConfig(args);
    var config = networkInfo.config;
    var missing = [];
    var warnings = [];
    
    // Required fields
    var requiredFields = [
        "SUI_NETWORK",
        "PACKAGE_ID",
        "PUBLISHER_ID"
    ];
    
    // Important but not always required
    var importantFields = [
        "COLLECTION_ID",
        "TRANSFER_POLICY_ID"
    ];
    
    // Check required fields
    for (var i = 0; i < requiredFields.length; i++) {
        if (!config[requiredFields[i]] || config[requiredFields[i]] === "") {
            missing.push(requiredFields[i]);
        }
    }
    
    // Check important fields
    for (var j = 0; j < importantFields.length; j++) {
        if (!config[importantFields[j]] || config[importantFields[j]] === "") {
            warnings.push(importantFields[j]);
        }
    }
    
    var isValid = missing.length === 0;
    
    if (!isValid) {
        log.error("Network configuration validation failed", {
            network: networkInfo.network,
            missing: missing,
            warnings: warnings
        });
    } else {
        log.info("Network configuration validated successfully", {
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

// Example function using network configuration
// This demonstrates how to use the config in your functions
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

// Function to list all variables for a specific network
// Parameters:
//   - network: "testnet" or "mainnet" (optional, uses Title Data if not provided)
//   - format: "detailed" (default) or "simple" - controls output format
handlers.listNetworkVariables = function (args, context) {
    try {
        var networkInfo = getNetworkConfig(args);
        var config = networkInfo.config;
        var format = (args && args.format) ? args.format.toLowerCase() : "detailed";
        
        log.info("Listing network variables", {
            network: networkInfo.network,
            format: format,
            playerId: currentPlayerId
        });
        
        // Check which variables are set vs empty
        var variables = {
            network: networkInfo.network,
            environment: config.ENVIRONMENT,
            variables: {}
        };
        
        // List all variables with their values and status
        var allVariables = [
            { key: "SUI_NETWORK", name: "Sui Network RPC URL", required: true },
            { key: "PACKAGE_ID", name: "Package ID", required: true },
            { key: "PUBLISHER_ID", name: "Publisher ID", required: true },
            { key: "TRANSFER_POLICY_ID", name: "Transfer Policy ID", required: true },
            { key: "TRANSFER_POLICY_CAP_ID", name: "Transfer Policy Cap ID", required: false },
            { key: "COLLECTION_ID", name: "Collection ID", required: true },
            { key: "KIOSK_ID", name: "Kiosk ID", required: false },
            { key: "KIOSK_OWNER_CAP_ID", name: "Kiosk Owner Cap ID", required: false },
            { key: "SUPPLY_CAP_ID", name: "Supply Cap ID", required: false },
            { key: "COUNTER_ID", name: "Counter ID", required: false },
            { key: "BLASTWHEELZ_TYPE", name: "Blastwheelz Type", required: false },
            { key: "LISTING_PRICE_MIST", name: "Listing Price (MIST)", required: false },
            { key: "MINT_SUPPLY", name: "Mint Supply", required: false },
            { key: "NEW_SUPPLY_LIMIT", name: "New Supply Limit", required: false }
        ];
        
        var missingRequired = [];
        var missingOptional = [];
        var configured = [];
        
        for (var i = 0; i < allVariables.length; i++) {
            var variable = allVariables[i];
            var value = config[variable.key];
            var isSet = value !== "" && value !== null && value !== undefined;
            
            var variableInfo = {
                key: variable.key,
                name: variable.name,
                value: isSet ? value : "",
                isSet: isSet,
                required: variable.required,
                type: typeof value
            };
            
            if (format === "detailed") {
                variables.variables[variable.key] = variableInfo;
            } else {
                // Simple format - just key-value pairs
                variables.variables[variable.key] = isSet ? value : "";
            }
            
            if (variable.required && !isSet) {
                missingRequired.push(variable.key);
            } else if (!variable.required && !isSet) {
                missingOptional.push(variable.key);
            } else {
                configured.push(variable.key);
            }
        }
        
        // Summary statistics
        var summary = {
            total: allVariables.length,
            configured: configured.length,
            missingRequired: missingRequired.length,
            missingOptional: missingOptional.length,
            configuredList: configured,
            missingRequiredList: missingRequired,
            missingOptionalList: missingOptional,
            isComplete: missingRequired.length === 0
        };
        
        var result = {
            success: true,
            network: networkInfo.network,
            format: format,
            summary: summary,
            variables: variables.variables,
            message: missingRequired.length === 0 
                ? "All required variables are configured" 
                : "Some required variables are missing"
        };
        
        if (format === "detailed") {
            result.detailedInfo = {
                configured: configured,
                missingRequired: missingRequired,
                missingOptional: missingOptional
            };
        }
        
        return result;
        
    } catch (error) {
        log.error("Error in listNetworkVariables", {
            error: error.message,
            playerId: currentPlayerId
        });
        
        return {
            success: false,
            error: error.message,
            message: "Failed to list network variables"
        };
    }
};

// Function to list variables for both networks (comparison)
handlers.listAllNetworkVariables = function (args, context) {
    try {
        var format = (args && args.format) ? args.format.toLowerCase() : "detailed";
        
        log.info("Listing all network variables", {
            format: format,
            playerId: currentPlayerId
        });
        
        // Get testnet variables
        var testnetResult = handlers.listNetworkVariables({ network: "testnet", format: format }, context);
        var mainnetResult = handlers.listNetworkVariables({ network: "mainnet", format: format }, context);
        
        return {
            success: true,
            format: format,
            testnet: {
                network: testnetResult.network,
                summary: testnetResult.summary,
                variables: testnetResult.variables
            },
            mainnet: {
                network: mainnetResult.network,
                summary: mainnetResult.summary,
                variables: mainnetResult.variables
            },
            comparison: {
                testnetConfigured: testnetResult.summary.configured,
                mainnetConfigured: mainnetResult.summary.configured,
                testnetComplete: testnetResult.summary.isComplete,
                mainnetComplete: mainnetResult.summary.isComplete
            },
            message: "Network variables listed for both testnet and mainnet"
        };
        
    } catch (error) {
        log.error("Error in listAllNetworkVariables", {
            error: error.message,
            playerId: currentPlayerId
        });
        
        return {
            success: false,
            error: error.message,
            message: "Failed to list all network variables"
        };
    }
};

///////////////////////////////////////////////////////////////////////////////////////////////////////
//
// NFT MINTING AND TRANSFER FUNCTIONS
//
// These functions handle minting and transferring NFTs on the Sui blockchain.
// They use the network configuration to determine testnet vs mainnet.
//
// Note: PlayFab Cloud Script cannot directly sign blockchain transactions.
// These functions prepare transaction data and can optionally call a backend service
// that handles the actual transaction signing and execution.
//
///////////////////////////////////////////////////////////////////////////////////////////////////////

// Mint NFT Function
// Parameters:
//   - network: "testnet" or "mainnet" (optional, uses Title Data if not provided)
//   - name: NFT name (required)
//   - imageUrl: NFT image URL (required)
//   - projectUrl: Project URL (required)
//   - alloyRim: Alloy rim description (required)
//   - frontBonnet: Front bonnet description (required)
//   - backBonnet: Back bonnet description (required)
//   - backendServiceUrl: Optional URL to backend service that executes the transaction
//   - playerSuiAddress: Optional Sui address of the player (for tracking)
handlers.mintNFT = function (args, context) {
    try {
        // Get network configuration
        var networkInfo = getNetworkConfig(args);
        var config = networkInfo.config;
        
        // Validate required configuration
        if (!config.PACKAGE_ID || config.PACKAGE_ID === "") {
            throw new Error("PACKAGE_ID not configured for " + networkInfo.network);
        }
        if (!config.COLLECTION_ID || config.COLLECTION_ID === "") {
            throw new Error("COLLECTION_ID not configured for " + networkInfo.network);
        }
        if (!config.TRANSFER_POLICY_ID || config.TRANSFER_POLICY_ID === "") {
            throw new Error("TRANSFER_POLICY_ID not configured for " + networkInfo.network);
        }
        
        // Validate required parameters
        if (!args.name) {
            throw new Error("name parameter is required");
        }
        if (!args.imageUrl) {
            throw new Error("imageUrl parameter is required");
        }
        if (!args.projectUrl) {
            throw new Error("projectUrl parameter is required");
        }
        if (!args.alloyRim) {
            throw new Error("alloyRim parameter is required");
        }
        if (!args.frontBonnet) {
            throw new Error("frontBonnet parameter is required");
        }
        if (!args.backBonnet) {
            throw new Error("backBonnet parameter is required");
        }
        
        // Get or construct BLASTWHEELZ_TYPE
        var blastwheelzType = config.BLASTWHEELZ_TYPE;
        if (!blastwheelzType || blastwheelzType === "") {
            // Construct default type if not set
            blastwheelzType = config.PACKAGE_ID + "::blastwheelz::Mustang";
        }
        
        // Prepare transaction data
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
            gasBudget: 150000000, // 0.15 SUI
            playerId: currentPlayerId,
            playerSuiAddress: args.playerSuiAddress || null,
            timestamp: new Date().toISOString()
        };
        
        log.info("Mint NFT Request", {
            playerId: currentPlayerId,
            network: networkInfo.network,
            nftName: args.name
        });
        
        // Store mint request in player data for tracking
        server.UpdateUserInternalData({
            PlayFabId: currentPlayerId,
            Data: {
                lastMintRequest: JSON.stringify({
                    timestamp: transactionData.timestamp,
                    network: networkInfo.network,
                    nftName: args.name,
                    status: "pending"
                })
            }
        });
        
        // If backend service URL is provided, call it to execute the transaction
        if (args.backendServiceUrl) {
            try {
                var backendRequest = {
                    action: "mint",
                    transactionData: transactionData,
                    playerId: currentPlayerId
                };
                
                var backendResponse = http.request(
                    args.backendServiceUrl,
                    "post",
                    JSON.stringify(backendRequest),
                    "application/json",
                    {
                        "Content-Type": "application/json"
                    }
                );
                
                log.info("Backend service called for mint", {
                    statusCode: backendResponse.Code,
                    playerId: currentPlayerId
                });
                
                return {
                    success: true,
                    network: networkInfo.network,
                    transactionData: transactionData,
                    backendResponse: JSON.parse(backendResponse.Data || "{}"),
                    message: "Mint request sent to backend service"
                };
            } catch (httpError) {
                log.error("Error calling backend service", {
                    error: httpError.message,
                    playerId: currentPlayerId
                });
                
                // Return transaction data even if backend call fails
                return {
                    success: true,
                    network: networkInfo.network,
                    transactionData: transactionData,
                    backendError: httpError.message,
                    message: "Transaction data prepared, but backend service call failed"
                };
            }
        }
        
        // Return transaction data for client/backend to execute
        return {
            success: true,
            network: networkInfo.network,
            transactionData: transactionData,
            message: "Mint transaction data prepared. Execute using a backend service or Sui client."
        };
        
    } catch (error) {
        log.error("Error in mintNFT", {
            error: error.message,
            playerId: currentPlayerId
        });
        
        return {
            success: false,
            error: error.message,
            message: "Failed to prepare mint transaction"
        };
    }
};

// Transfer NFT Function
// Parameters:
//   - network: "testnet" or "mainnet" (optional, uses Title Data if not provided)
//   - nftObjectId: The NFT object ID to transfer (required)
//   - recipient: Recipient Sui address (required)
//   - backendServiceUrl: Optional URL to backend service that executes the transaction
//   - playerSuiAddress: Optional Sui address of the sender (for validation)
handlers.transferNFT = function (args, context) {
    try {
        // Get network configuration
        var networkInfo = getNetworkConfig(args);
        var config = networkInfo.config;
        
        // Validate required parameters
        if (!args.nftObjectId) {
            throw new Error("nftObjectId parameter is required");
        }
        if (!args.recipient) {
            throw new Error("recipient parameter is required (Sui address)");
        }
        
        // Basic validation of Sui address format
        if (!args.recipient.startsWith("0x") || args.recipient.length < 40) {
            throw new Error("Invalid recipient address format. Must be a valid Sui address starting with 0x");
        }
        
        // Get or construct BLASTWHEELZ_TYPE
        var blastwheelzType = config.BLASTWHEELZ_TYPE;
        if (!blastwheelzType || blastwheelzType === "") {
            // Construct default type if not set
            blastwheelzType = config.PACKAGE_ID + "::blastwheelz::Mustang";
        }
        
        // Prepare transaction data
        var transactionData = {
            network: networkInfo.network,
            suiNetworkUrl: config.SUI_NETWORK,
            function: "transfer",
            nftObjectId: args.nftObjectId,
            recipient: args.recipient,
            gasBudget: 10000000, // 0.01 SUI
            playerId: currentPlayerId,
            playerSuiAddress: args.playerSuiAddress || null,
            timestamp: new Date().toISOString()
        };
        
        log.info("Transfer NFT Request", {
            playerId: currentPlayerId,
            network: networkInfo.network,
            nftObjectId: args.nftObjectId,
            recipient: args.recipient
        });
        
        // Store transfer request in player data for tracking
        server.UpdateUserInternalData({
            PlayFabId: currentPlayerId,
            Data: {
                lastTransferRequest: JSON.stringify({
                    timestamp: transactionData.timestamp,
                    network: networkInfo.network,
                    nftObjectId: args.nftObjectId,
                    recipient: args.recipient,
                    status: "pending"
                })
            }
        });
        
        // If backend service URL is provided, call it to execute the transaction
        if (args.backendServiceUrl) {
            try {
                var backendRequest = {
                    action: "transfer",
                    transactionData: transactionData,
                    playerId: currentPlayerId
                };
                
                var backendResponse = http.request(
                    args.backendServiceUrl,
                    "post",
                    JSON.stringify(backendRequest),
                    "application/json",
                    {
                        "Content-Type": "application/json"
                    }
                );
                
                log.info("Backend service called for transfer", {
                    statusCode: backendResponse.Code,
                    playerId: currentPlayerId
                });
                
                return {
                    success: true,
                    network: networkInfo.network,
                    transactionData: transactionData,
                    backendResponse: JSON.parse(backendResponse.Data || "{}"),
                    message: "Transfer request sent to backend service"
                };
            } catch (httpError) {
                log.error("Error calling backend service", {
                    error: httpError.message,
                    playerId: currentPlayerId
                });
                
                // Return transaction data even if backend call fails
                return {
                    success: true,
                    network: networkInfo.network,
                    transactionData: transactionData,
                    backendError: httpError.message,
                    message: "Transaction data prepared, but backend service call failed"
                };
            }
        }
        
        // Return transaction data for client/backend to execute
        return {
            success: true,
            network: networkInfo.network,
            transactionData: transactionData,
            message: "Transfer transaction data prepared. Execute using a backend service or Sui client."
        };
        
    } catch (error) {
        log.error("Error in transferNFT", {
            error: error.message,
            playerId: currentPlayerId
        });
        
        return {
            success: false,
            error: error.message,
            message: "Failed to prepare transfer transaction"
        };
    }
};

// Get Mint History Function
// Returns the minting history for the current player
handlers.getMintHistory = function (args, context) {
    try {
        var playerData = server.GetUserInternalData({
            PlayFabId: currentPlayerId,
            Keys: ["lastMintRequest"]
        });
        
        var mintHistory = [];
        if (playerData.Data && playerData.Data["lastMintRequest"]) {
            try {
                var lastMint = JSON.parse(playerData.Data["lastMintRequest"].Value);
                mintHistory.push(lastMint);
            } catch (e) {
                log.debug("Could not parse lastMintRequest", { error: e.message });
            }
        }
        
        return {
            success: true,
            playerId: currentPlayerId,
            mintHistory: mintHistory,
            count: mintHistory.length
        };
    } catch (error) {
        log.error("Error in getMintHistory", {
            error: error.message,
            playerId: currentPlayerId
        });
        
        return {
            success: false,
            error: error.message
        };
    }
};

// Get Transfer History Function
// Returns the transfer history for the current player
handlers.getTransferHistory = function (args, context) {
    try {
        var playerData = server.GetUserInternalData({
            PlayFabId: currentPlayerId,
            Keys: ["lastTransferRequest"]
        });
        
        var transferHistory = [];
        if (playerData.Data && playerData.Data["lastTransferRequest"]) {
            try {
                var lastTransfer = JSON.parse(playerData.Data["lastTransferRequest"].Value);
                transferHistory.push(lastTransfer);
            } catch (e) {
                log.debug("Could not parse lastTransferRequest", { error: e.message });
            }
        }
        
        return {
            success: true,
            playerId: currentPlayerId,
            transferHistory: transferHistory,
            count: transferHistory.length
        };
    } catch (error) {
        log.error("Error in getTransferHistory", {
            error: error.message,
            playerId: currentPlayerId
        });
        
        return {
            success: false,
            error: error.message
        };
    }
};

///////////////////////////////////////////////////////////////////////////////////////////////////////
//
// ORIGINAL EXAMPLE FUNCTIONS
//
///////////////////////////////////////////////////////////////////////////////////////////////////////

// This is a Cloud Script function. "args" is set to the value of the "FunctionParameter" 
// parameter of the ExecuteCloudScript API.
// (https://api.playfab.com/Documentation/Client/method/ExecuteCloudScript)
// "context" contains additional information when the Cloud Script function is called from a PlayStream action.
handlers.helloWorld = function (args, context) {
    
    // The pre-defined "currentPlayerId" variable is initialized to the PlayFab ID of the player logged-in on the game client. 
    // Cloud Script handles authenticating the player automatically.
    var message = "Hello " + currentPlayerId + "!";

    // You can use the "log" object to write out debugging statements. It has
    // three functions corresponding to logging level: debug, info, and error. These functions
    // take a message string and an optional object.
    log.info(message);
    var inputValue = null;
    if (args && args.inputValue)
        inputValue = args.inputValue;
    log.debug("helloWorld:", { input: args.inputValue });

    // The value you return from a Cloud Script function is passed back 
    // to the game client in the ExecuteCloudScript API response, along with any log statements
    // and additional diagnostic information, such as any errors returned by API calls or external HTTP
    // requests. They are also included in the optional player_executed_cloudscript PlayStream event 
    // generated by the function execution.
    // (https://api.playfab.com/playstream/docs/PlayStreamEventModels/player/player_executed_cloudscript)
    return { messageValue: message };
};

// This is a simple example of making a PlayFab server API call
handlers.makeAPICall = function (args, context) {
    var request = {
        PlayFabId: currentPlayerId, Statistics: [{
                StatisticName: "Level",
                Value: 2
            }]
    };
    // The pre-defined "server" object has functions corresponding to each PlayFab server API 
    // (https://api.playfab.com/Documentation/Server). It is automatically 
    // authenticated as your title and handles all communication with 
    // the PlayFab API, so you don't have to write extra code to issue HTTP requests. 
    var playerStatResult = server.UpdatePlayerStatistics(request);
};

// This an example of a function that calls a PlayFab Entity API. The function is called using the 
// 'ExecuteEntityCloudScript' API (https://api.playfab.com/documentation/CloudScript/method/ExecuteEntityCloudScript).
handlers.makeEntityAPICall = function (args, context) {

    // The profile of the entity specified in the 'ExecuteEntityCloudScript' request.
    // Defaults to the authenticated entity in the X-EntityToken header.
    var entityProfile = context.currentEntity;

    // The pre-defined 'entity' object has functions corresponding to each PlayFab Entity API,
    // including 'SetObjects' (https://api.playfab.com/documentation/Data/method/SetObjects).
    var apiResult = entity.SetObjects({
        Entity: entityProfile.Entity,
        Objects: [
            {
                ObjectName: "obj1",
                DataObject: {
                    foo: "some server computed value",
                    prop1: args.prop1
                }
            }
        ]
    });

    return {
        profile: entityProfile,
        setResult: apiResult.SetResults[0].SetResult
    };
};

// This is a simple example of making a web request to an external HTTP API.
handlers.makeHTTPRequest = function (args, context) {
    var headers = {
        "X-MyCustomHeader": "Some Value"
    };
    
    var body = {
        input: args,
        userId: currentPlayerId,
        mode: "foobar"
    };

    var url = "http://httpbin.org/status/200";
    var content = JSON.stringify(body);
    var httpMethod = "post";
    var contentType = "application/json";

    // The pre-defined http object makes synchronous HTTP requests
    var response = http.request(url, httpMethod, content, contentType, headers);
    return { responseContent: response };
};

// This is a simple example of a function that is called from a
// PlayStream event action. (https://playfab.com/introducing-playstream/)
handlers.handlePlayStreamEventAndProfile = function (args, context) {
    
    // The event that triggered the action 
    // (https://api.playfab.com/playstream/docs/PlayStreamEventModels)
    var psEvent = context.playStreamEvent;
    
    // The profile data of the player associated with the event
    // (https://api.playfab.com/playstream/docs/PlayStreamProfileModels)
    var profile = context.playerProfile;
    
    // Post data about the event to an external API
    var content = JSON.stringify({ user: profile.PlayerId, event: psEvent.EventName });
    var response = http.request('https://httpbin.org/status/200', 'post', content, 'application/json', null);

    return { externalAPIResponse: response };
};


// Below are some examples of using Cloud Script in slightly more realistic scenarios

// This is a function that the game client would call whenever a player completes
// a level. It updates a setting in the player's data that only game server
// code can write - it is read-only on the client - and it updates a player
// statistic that can be used for leaderboards. 
//
// A funtion like this could be extended to perform validation on the 
// level completion data to detect cheating. It could also do things like 
// award the player items from the game catalog based on their performance.
handlers.completedLevel = function (args, context) {
    var level = args.levelName;
    var monstersKilled = args.monstersKilled;
    
    var updateUserDataResult = server.UpdateUserInternalData({
        PlayFabId: currentPlayerId,
        Data: {
            lastLevelCompleted: level
        }
    });

    log.debug("Set lastLevelCompleted for player " + currentPlayerId + " to " + level);
    var request = {
        PlayFabId: currentPlayerId, Statistics: [{
                StatisticName: "level_monster_kills",
                Value: monstersKilled
            }]
    };
    server.UpdatePlayerStatistics(request);
    log.debug("Updated level_monster_kills stat for player " + currentPlayerId + " to " + monstersKilled);
};


// In addition to the Cloud Script handlers, you can define your own functions and call them from your handlers. 
// This makes it possible to share code between multiple handlers and to improve code organization.
handlers.updatePlayerMove = function (args) {
    var validMove = processPlayerMove(args);
    return { validMove: validMove };
};


// This is a helper function that verifies that the player's move wasn't made
// too quickly following their previous move, according to the rules of the game.
// If the move is valid, then it updates the player's statistics and profile data.
// This function is called from the "UpdatePlayerMove" handler above and also is 
// triggered by the "RoomEventRaised" Photon room event in the Webhook handler
// below. 
//
// For this example, the script defines the cooldown period (playerMoveCooldownInSeconds)
// as 15 seconds. A recommended approach for values like this would be to create them in Title
// Data, so that they can be queries in the script with a call to GetTitleData
// (https://api.playfab.com/Documentation/Server/method/GetTitleData). This would allow you to
// make adjustments to these values over time, without having to edit, test, and roll out an
// updated script.
function processPlayerMove(playerMove) {
    var now = Date.now();
    var playerMoveCooldownInSeconds = 15;

    var playerData = server.GetUserInternalData({
        PlayFabId: currentPlayerId,
        Keys: ["last_move_timestamp"]
    });

    var lastMoveTimestampSetting = playerData.Data["last_move_timestamp"];

    if (lastMoveTimestampSetting) {
        var lastMoveTime = Date.parse(lastMoveTimestampSetting.Value);
        var timeSinceLastMoveInSeconds = (now - lastMoveTime) / 1000;
        log.debug("lastMoveTime: " + lastMoveTime + " now: " + now + " timeSinceLastMoveInSeconds: " + timeSinceLastMoveInSeconds);

        if (timeSinceLastMoveInSeconds < playerMoveCooldownInSeconds) {
            log.error("Invalid move - time since last move: " + timeSinceLastMoveInSeconds + "s less than minimum of " + playerMoveCooldownInSeconds + "s.");
            return false;
        }
    }

    var playerStats = server.GetPlayerStatistics({
        PlayFabId: currentPlayerId
    }).Statistics;
    var movesMade = 0;
    for (var i = 0; i < playerStats.length; i++)
        if (playerStats[i].StatisticName === "")
            movesMade = playerStats[i].Value;
    movesMade += 1;
    var request = {
        PlayFabId: currentPlayerId, Statistics: [{
                StatisticName: "movesMade",
                Value: movesMade
            }]
    };
    server.UpdatePlayerStatistics(request);
    server.UpdateUserInternalData({
        PlayFabId: currentPlayerId,
        Data: {
            last_move_timestamp: new Date(now).toUTCString(),
            last_move: JSON.stringify(playerMove)
        }
    });

    return true;
}

// This is an example of using PlayStream real-time segmentation to trigger
// game logic based on player behavior. (https://playfab.com/introducing-playstream/)
// The function is called when a player_statistic_changed PlayStream event causes a player 
// to enter a segment defined for high skill players. It sets a key value in
// the player's internal data which unlocks some new content for the player.
handlers.unlockHighSkillContent = function (args, context) {
    var playerStatUpdatedEvent = context.playStreamEvent;
    var request = {
        PlayFabId: currentPlayerId,
        Data: {
            "HighSkillContent": "true",
            "XPAtHighSkillUnlock": playerStatUpdatedEvent.StatisticValue.toString()
        }
    };
    var playerInternalData = server.UpdateUserInternalData(request);
    log.info('Unlocked HighSkillContent for ' + context.playerProfile.DisplayName);
    return { profile: context.playerProfile };
};

// Photon Webhooks Integration
//
// The following functions are examples of Photon Cloud Webhook handlers. 
// When you enable the Photon Add-on (https://playfab.com/marketplace/photon/)
// in the Game Manager, your Photon applications are automatically configured
// to authenticate players using their PlayFab accounts and to fire events that 
// trigger your Cloud Script Webhook handlers, if defined. 
// This makes it easier than ever to incorporate multiplayer server logic into your game.


// Triggered automatically when a Photon room is first created
handlers.RoomCreated = function (args) {
    log.debug("Room Created - Game: " + args.GameId + " MaxPlayers: " + args.CreateOptions.MaxPlayers);
};

// Triggered automatically when a player joins a Photon room
handlers.RoomJoined = function (args) {
    log.debug("Room Joined - Game: " + args.GameId + " PlayFabId: " + args.UserId);
};

// Triggered automatically when a player leaves a Photon room
handlers.RoomLeft = function (args) {
    log.debug("Room Left - Game: " + args.GameId + " PlayFabId: " + args.UserId);
};

// Triggered automatically when a Photon room closes
// Note: currentPlayerId is undefined in this function
handlers.RoomClosed = function (args) {
    log.debug("Room Closed - Game: " + args.GameId);
};

// Triggered automatically when a Photon room game property is updated.
// Note: currentPlayerId is undefined in this function
handlers.RoomPropertyUpdated = function (args) {
    log.debug("Room Property Updated - Game: " + args.GameId);
};

// Triggered by calling "OpRaiseEvent" on the Photon client. The "args.Data" property is 
// set to the value of the "customEventContent" HashTable parameter, so you can use
// it to pass in arbitrary data.
handlers.RoomEventRaised = function (args) {
    var eventData = args.Data;
    log.debug("Event Raised - Game: " + args.GameId + " Event Type: " + eventData.eventType);

    switch (eventData.eventType) {
        case "playerMove":
            processPlayerMove(eventData);
            break;

        default:
            break;
    }
};
