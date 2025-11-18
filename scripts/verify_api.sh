#!/bin/bash

# Load environment variables
source contracts/.env

API_KEY="${CELOSCAN_API_KEY}"
API_URL="https://api-sepolia.celoscan.io/api"

echo "🔍 Verifying contracts on CeloScan..."

# Function to verify a contract
verify_contract() {
    local contract_name=$1
    local contract_address=$2
    local source_file=$3
    local constructor_args=$4

    echo "📝 Verifying $contract_name at $contract_address..."

    # Read the flattened source code
    local source_code=$(cat "$source_file")

    # Prepare the API request
    curl -X POST "$API_URL" \
        -d "module=contract" \
        -d "action=verifysourcecode" \
        -d "apikey=$API_KEY" \
        -d "contractaddress=$contract_address" \
        -d "sourceCode=$source_code" \
        -d "codeformat=solidity-single-file" \
        -d "contractname=$contract_name" \
        -d "compilerversion=v0.8.22+commit.4fc1097e" \
        -d "optimizationUsed=0" \
        -d "runs=200" \
        -d "constructorArguements=$constructor_args" \
        -d "evmversion=paris" \
        -d "licenseType=1"

    echo ""
    echo "✅ Verification request submitted for $contract_name"
    echo ""
    sleep 5
}

# Verify GameLifecycleNative
verify_contract "GameLifecycleNative" "0x3B30c61e00E848e9cFc990687b743FD118E9C503" "GameLifecycleNative_flat.sol" ""

# Verify OptimizedQuizGame
verify_contract "OptimizedQuizGame" "0x122f95938706f3A973204b37543a7430A8F9121c" "OptimizedQuizGame_flat.sol" ""

# Verify NFTStaking (with constructor args)
verify_contract "NFTStaking" "0x5E1a8f5E7F480B8976129d5c79C5990daeEC6252" "NFTStaking_flat.sol" "000000000000000000000000D138b32A0f66E2891D6F7f33B576f9917f657C99000000000000000000000000F2F773753cEbEFaF9b68b841d80C083b18C69311"

echo "✨ All verification requests submitted!"
echo "📍 Check status on CeloScan: https://sepolia.celoscan.io/"
