#!/bin/bash

# Quick test script for donation flow
# Make sure all services are running before executing

echo "🚀 Testing Donation Flow..."
echo ""

# Test campaign data
CAMPAIGN_ID="campaign_education_001"
AMOUNT=100

echo "📝 Step 1: Creating donation session..."
echo "Campaign ID: $CAMPAIGN_ID"
echo "Amount: \$$AMOUNT"
echo ""

# Make donation request
RESPONSE=$(curl -s -X POST "http://localhost:8004/payment/process" \
  -H "Content-Type: application/json" \
  -d "{\"campaignId\":\"$CAMPAIGN_ID\",\"amount\":$AMOUNT}")

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Extract redirect URL
REDIRECT_URL=$(echo "$RESPONSE" | jq -r '.redirectUrl' 2>/dev/null)

if [ "$REDIRECT_URL" != "null" ] && [ -n "$REDIRECT_URL" ]; then
    echo "✅ Success! Payment session created"
    echo "🔗 Payment URL: $REDIRECT_URL"
    echo ""
    echo "Next steps:"
    echo "1. Open this URL in browser: $REDIRECT_URL"
    echo "2. Enter phone: 1234567890"
    echo "3. Enter PIN: 1234"
    echo "4. Complete payment"
else
    echo "❌ Failed to create payment session"
    echo "Make sure payment service is running on port 8004"
fi
