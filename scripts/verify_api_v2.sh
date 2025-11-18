#!/bin/bash

# Load environment variables
source contracts/.env

API_KEY="${CELOSCAN_API_KEY}"
API_URL="https://api-sepolia.celoscan.io/v2/api"

echo "🔍 Verifying contracts on CeloScan using API V2..."
echo ""

# Function to verify a contract using API V2
verify_contract_v2() {
    local contract_name=$1
    local contract_address=$2
    local source_file=$3
    local constructor_args=$4

    echo "📝 Verifying $contract_name at $contract_address..."

    # Read the flattened source code and URL encode it
    local source_code=$(cat "$source_file" | jq -sRr @uri)

    # Prepare the API request with V2 format
    response=$(curl -s -X POST "$API_URL" \
        --data-urlencode "module=contract" \
        --data-urlencode "action=verifysourcecode" \
        --data-urlencode "apikey=$API_KEY" \
        --data-urlencode "contractaddress=$contract_address" \
        --data-urlencode "sourceCode@$source_file" \
        --data-urlencode "codeformat=solidity-single-file" \
        --data-urlencode "contractname=$contract_name" \
        --data-urlencode "compilerversion=v0.8.22+commit.4fc1097e" \
        --data-urlencode "optimizationUsed=0" \
        --data-urlencode "runs=200" \
        --data-urlencode "constructorArguements=$constructor_args" \
        --data-urlencode "evmversion=paris" \
        --data-urlencode "licenseType=3")

    echo "Response: $response"
    echo ""
    sleep 3
}

# Verify GameLifecycleNative
verify_contract_v2 "GameLifecycleNative" "0x3B30c61e00E848e9cFc990687b743FD118E9C503" "GameLifecycleNative_flat.sol" ""

# Verify OptimizedQuizGame
verify_contract_v2 "OptimizedQuizGame" "0x122f95938706f3A973204b37543a7430A8F9121c" "OptimizedQuizGame_flat.sol" ""

# Verify NFTStaking (with constructor args)
verify_contract_v2 "NFTStaking" "0x5E1a8f5E7F480B8976129d5c79C5990daeEC6252" "NFTStaking_flat.sol" "000000000000000000000000d138b32a0f66e2891d6f7f33b576f9917f657c99000000000000000000000000f2f773753cebefaf9b68b841d80c083b18c69311"

echo "✨ All verification requests submitted!"
echo "📍 View your verified contracts:"
echo "   https://sepolia.celoscan.io/address/0x3B30c61e00E848e9cFc990687b743FD118E9C503"
echo "   https://sepolia.celoscan.io/address/0x122f95938706f3A973204b37543a7430A8F9121c"
echo "   https://sepolia.celoscan.io/address/0x5E1a8f5E7F480B8976129d5c79C5990daeEC6252"
