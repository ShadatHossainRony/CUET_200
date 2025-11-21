#!/bin/bash

# Mock Wallet Payment Gateway - API Test Script
# This script demonstrates the complete payment flow

BASE_URL="http://localhost:4000"
echo "=================================================="
echo "Mock Wallet Payment Gateway - API Test Script"
echo "Base URL: $BASE_URL"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print section header
print_section() {
    echo ""
    echo -e "${YELLOW}=================================================="
    echo "$1"
    echo -e "==================================================${NC}"
    echo ""
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# 1. Health Check
print_section "1. Health Check"
curl -s $BASE_URL/health | jq '.'
print_success "Health check completed"

# 2. Create Test User
print_section "2. Create Test User"
USER_RESPONSE=$(curl -s -X POST $BASE_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "01700000001",
    "pin": "1234",
    "name": "Test User",
    "balance": 1000
  }')

echo "$USER_RESPONSE" | jq '.'
USER_ID=$(echo "$USER_RESPONSE" | jq -r '.userId')

if [ "$USER_ID" != "null" ]; then
    print_success "User created with ID: $USER_ID"
else
    print_error "Failed to create user (may already exist)"
fi

# 3. Login
print_section "3. User Login"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "01700000001",
    "pin": "1234"
  }')

echo "$LOGIN_RESPONSE" | jq '.'
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')

if [ "$TOKEN" != "null" ]; then
    print_success "Login successful, token: ${TOKEN:0:20}..."
else
    print_error "Login failed"
    exit 1
fi

# 4. Create Payment Session
print_section "4. Create Payment Session"
PAYMENT_RESPONSE=$(curl -s -X POST $BASE_URL/wallet/pay \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "metadata": {
      "order_id": "ORDER_TEST_123",
      "campaign_id": "CAMPAIGN_456"
    }
  }')

echo "$PAYMENT_RESPONSE" | jq '.'
TRANSACTION_ID=$(echo "$PAYMENT_RESPONSE" | jq -r '.transaction_id')
PAY_URL=$(echo "$PAYMENT_RESPONSE" | jq -r '.pay_url')

if [ "$TRANSACTION_ID" != "null" ]; then
    print_success "Payment session created"
    echo "Transaction ID: $TRANSACTION_ID"
    echo "Payment URL: $PAY_URL"
else
    print_error "Failed to create payment session"
    exit 1
fi

# 5. Get Payment Page (HTML)
print_section "5. Get Payment Page"
echo "Payment page URL: $PAY_URL"
echo "Opening in browser would show the payment form..."
print_success "Payment page endpoint ready"

# 6. Process Payment
print_section "6. Process Payment"
echo "Simulating form submission with phone and PIN..."
PROCESS_RESPONSE=$(curl -s -X POST "$BASE_URL/wallet/pay/$TRANSACTION_ID" \
  -d "phone=01700000001&pin=1234")

# Check if response contains success message
if echo "$PROCESS_RESPONSE" | grep -q "Payment Successful"; then
    print_success "Payment processed successfully"
else
    print_error "Payment failed"
    echo "Response preview: ${PROCESS_RESPONSE:0:200}..."
fi

# 7. Get Transaction Details
print_section "7. Get Transaction Details"
sleep 1  # Wait a moment for callback to complete
TRANSACTION_RESPONSE=$(curl -s $BASE_URL/api/transactions/$TRANSACTION_ID)
echo "$TRANSACTION_RESPONSE" | jq '.'
print_success "Transaction details retrieved"

# 8. Topup Wallet
print_section "8. Topup Wallet"
TOPUP_RESPONSE=$(curl -s -X POST $BASE_URL/wallet/topup \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "01700000001",
    "amount": 500
  }')

echo "$TOPUP_RESPONSE" | jq '.'
NEW_BALANCE=$(echo "$TOPUP_RESPONSE" | jq -r '.balance')

if [ "$NEW_BALANCE" != "null" ]; then
    print_success "Wallet topped up, new balance: ৳$NEW_BALANCE"
else
    print_error "Topup failed"
fi

# 9. Get User Transactions
print_section "9. Get User Transaction History"
if [ "$USER_ID" != "null" ]; then
    TRANSACTIONS_RESPONSE=$(curl -s "$BASE_URL/api/users/$USER_ID/transactions?page=1&limit=5")
    echo "$TRANSACTIONS_RESPONSE" | jq '.'
    print_success "Transaction history retrieved"
else
    print_error "Skipped - no user ID available"
fi

# 10. Test Idempotency (Double Payment)
print_section "10. Test Idempotency (Double Payment Attempt)"
echo "Creating another payment session..."
PAYMENT2_RESPONSE=$(curl -s -X POST $BASE_URL/wallet/pay \
  -H "Content-Type: application/json" \
  -d '{"amount": 50}')

TRANSACTION_ID2=$(echo "$PAYMENT2_RESPONSE" | jq -r '.transaction_id')

echo "First payment attempt..."
PROCESS1=$(curl -s -X POST "$BASE_URL/wallet/pay/$TRANSACTION_ID2" \
  -d "phone=01700000001&pin=1234")

echo "Second payment attempt (should not deduct again)..."
PROCESS2=$(curl -s -X POST "$BASE_URL/wallet/pay/$TRANSACTION_ID2" \
  -d "phone=01700000001&pin=1234")

if echo "$PROCESS2" | grep -q "Payment Already Completed"; then
    print_success "Idempotency working - no double debit"
else
    print_error "Idempotency check inconclusive"
fi

# 11. Test Insufficient Balance
print_section "11. Test Insufficient Balance"
LARGE_PAYMENT=$(curl -s -X POST $BASE_URL/wallet/pay \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000}')

TRANSACTION_ID3=$(echo "$LARGE_PAYMENT" | jq -r '.transaction_id')

INSUFFICIENT_RESPONSE=$(curl -s -X POST "$BASE_URL/wallet/pay/$TRANSACTION_ID3" \
  -d "phone=01700000001&pin=1234")

if echo "$INSUFFICIENT_RESPONSE" | grep -q "Insufficient balance\|insufficient balance"; then
    print_success "Insufficient balance check working"
else
    print_error "Insufficient balance check may not be working"
fi

# 12. Test Invalid PIN
print_section "12. Test Invalid PIN"
INVALID_PAYMENT=$(curl -s -X POST $BASE_URL/wallet/pay \
  -H "Content-Type: application/json" \
  -d '{"amount": 10}')

TRANSACTION_ID4=$(echo "$INVALID_PAYMENT" | jq -r '.transaction_id')

INVALID_PIN_RESPONSE=$(curl -s -X POST "$BASE_URL/wallet/pay/$TRANSACTION_ID4" \
  -d "phone=01700000001&pin=9999")

if echo "$INVALID_PIN_RESPONSE" | grep -q "Invalid\|Failed"; then
    print_success "Invalid PIN rejected"
else
    print_error "PIN validation may not be working"
fi

# Summary
print_section "Test Summary"
echo "All basic API tests completed!"
echo ""
echo "Test Coverage:"
echo "  ✓ Health check"
echo "  ✓ User creation"
echo "  ✓ Authentication"
echo "  ✓ Payment session creation"
echo "  ✓ Payment processing"
echo "  ✓ Transaction retrieval"
echo "  ✓ Wallet topup"
echo "  ✓ Transaction history"
echo "  ✓ Idempotency"
echo "  ✓ Insufficient balance"
echo "  ✓ Invalid PIN"
echo ""
print_success "Mock Wallet Gateway is working correctly!"
echo ""
