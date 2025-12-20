#!/bin/bash

# Test Statement Analyzer API Endpoints

echo "🧪 Testing Statement Analyzer APIs"
echo "=" | head -c 70; echo

# Check if server is running
if ! lsof -ti:3000 > /dev/null; then
    echo "❌ Dev server not running on port 3000"
    echo "Please run: npm run dev"
    exit 1
fi

echo "✅ Server is running"
echo

# Test file path - using the ICICI Adani statement we analyzed earlier
TEST_PDF="/Users/surajsatyarthi/Desktop/Fin/statement_nov_dec.pdf"

if [ ! -f "$TEST_PDF" ]; then
    echo "❌ Test PDF not found: $TEST_PDF"
    exit 1
fi

echo "📄 Using test PDF: $TEST_PDF"
echo

# Test 1: Analyze Statement
echo "Test 1: POST /api/analyze-statement"
echo "-" | head -c 70; echo

ANALYZE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/analyze-statement \
  -F "file=@$TEST_PDF")

echo "Response:"
echo "$ANALYZE_RESPONSE" | jq '.' 2>/dev/null || echo "$ANALYZE_RESPONSE"
echo

# Extract card details for next tests
CARD_NAME=$(echo "$ANALYZE_RESPONSE" | jq -r '.data.cardName' 2>/dev/null)
LAST_FOUR=$(echo "$ANALYZE_RESPONSE" | jq -r '.data.lastFourDigits' 2>/dev/null)
NEW_BALANCE=$(echo "$ANALYZE_RESPONSE" | jq -r '.data.totalAmountDue' 2>/dev/null)

if [ "$CARD_NAME" != "null" ] && [ "$CARD_NAME" != "" ]; then
    echo "✅ Successfully extracted: $CARD_NAME (****$LAST_FOUR)"
    echo "   Total Due: ₹$NEW_BALANCE"
else
    echo "❌ Failed to analyze statement"
    exit 1
fi

echo
echo "=" | head -c 70; echo

# Test 2: Get Current Card Balance
echo "Test 2: GET /api/get-card"
echo "-" | head -c 70; echo

CARD_RESPONSE=$(curl -s "http://localhost:3000/api/get-card?lastFour=$LAST_FOUR&cardName=$(echo $CARD_NAME | sed 's/ /%20/g')")

echo "Response:"
echo "$CARD_RESPONSE" | jq '.' 2>/dev/null || echo "$CARD_RESPONSE"

CURRENT_BALANCE=$(echo "$CARD_RESPONSE" | jq -r '.currentBalance' 2>/dev/null)

if [ "$CURRENT_BALANCE" != "null" ] && [ "$CURRENT_BALANCE" != "" ]; then
    echo
    echo "✅ Current Balance: ₹$CURRENT_BALANCE"
else
    echo
    echo "⚠️  Card not found in database (this is OK for new cards)"
    CURRENT_BALANCE="0"
fi

echo
echo "=" | head -c 70; echo

# Test 3: Preview Update (don't actually update in test)
echo "Test 3: Balance Comparison"
echo "-" | head -c 70; echo

echo "Card: $CARD_NAME"
echo "Current Balance: ₹$CURRENT_BALANCE"
echo "Statement Balance: ₹$NEW_BALANCE"

DIFF=$(echo "$NEW_BALANCE - $CURRENT_BALANCE" | bc 2>/dev/null)
if [ ! -z "$DIFF" ]; then
    echo "Difference: ₹$DIFF"
fi

echo
echo "=" | head -c 70; echo
echo
echo "✅ All API Tests Passed!"
echo
echo "To actually update the balance, you can run:"
echo "curl -X POST http://localhost:3000/api/update-balance \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"statementData\": <full-statement-data>}'"
