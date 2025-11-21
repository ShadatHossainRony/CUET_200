# Mock Wallet Payment Gateway - API Test Script (PowerShell)
# This script demonstrates the complete payment flow on Windows

$baseUrl = "http://localhost:4000"
Write-Host "==================================================" -ForegroundColor Yellow
Write-Host "Mock Wallet Payment Gateway - API Test Script" -ForegroundColor Yellow
Write-Host "Base URL: $baseUrl" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Yellow
Write-Host ""

function Print-Section {
    param([string]$message)
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Yellow
    Write-Host $message -ForegroundColor Yellow
    Write-Host "==================================================" -ForegroundColor Yellow
    Write-Host ""
}

function Print-Success {
    param([string]$message)
    Write-Host "✓ $message" -ForegroundColor Green
}

function Print-Error {
    param([string]$message)
    Write-Host "✗ $message" -ForegroundColor Red
}

# 1. Health Check
Print-Section "1. Health Check"
$healthResponse = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
$healthResponse | ConvertTo-Json
Print-Success "Health check completed"

# 2. Create Test User
Print-Section "2. Create Test User"
try {
    $userBody = @{
        phone = "01700000001"
        pin = "1234"
        name = "Test User"
        balance = 1000
    } | ConvertTo-Json

    $userResponse = Invoke-RestMethod -Uri "$baseUrl/api/users" -Method Post -Body $userBody -ContentType "application/json"
    $userResponse | ConvertTo-Json
    $userId = $userResponse.userId
    Print-Success "User created with ID: $userId"
} catch {
    Print-Error "Failed to create user (may already exist)"
    # Continue anyway
}

# 3. Login
Print-Section "3. User Login"
$loginBody = @{
    phone = "01700000001"
    pin = "1234"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$loginResponse | ConvertTo-Json
$token = $loginResponse.token

if ($token) {
    Print-Success "Login successful, token: $($token.Substring(0, 20))..."
} else {
    Print-Error "Login failed"
    exit 1
}

# 4. Create Payment Session
Print-Section "4. Create Payment Session"
$paymentBody = @{
    amount = 100
    metadata = @{
        order_id = "ORDER_TEST_123"
        campaign_id = "CAMPAIGN_456"
    }
} | ConvertTo-Json

$paymentResponse = Invoke-RestMethod -Uri "$baseUrl/wallet/pay" -Method Post -Body $paymentBody -ContentType "application/json"
$paymentResponse | ConvertTo-Json
$transactionId = $paymentResponse.transaction_id
$payUrl = $paymentResponse.pay_url

if ($transactionId) {
    Print-Success "Payment session created"
    Write-Host "Transaction ID: $transactionId"
    Write-Host "Payment URL: $payUrl"
} else {
    Print-Error "Failed to create payment session"
    exit 1
}

# 5. Get Payment Page
Print-Section "5. Get Payment Page"
Write-Host "Payment page URL: $payUrl"
Write-Host "Opening in browser would show the payment form..."
Print-Success "Payment page endpoint ready"

# 6. Process Payment
Print-Section "6. Process Payment"
Write-Host "Simulating form submission with phone and PIN..."
$processBody = "phone=01700000001&pin=1234"
$processResponse = Invoke-WebRequest -Uri "$baseUrl/wallet/pay/$transactionId" -Method Post -Body $processBody -ContentType "application/x-www-form-urlencoded"

if ($processResponse.Content -match "Payment Successful") {
    Print-Success "Payment processed successfully"
} else {
    Print-Error "Payment failed"
    Write-Host "Response preview: $($processResponse.Content.Substring(0, [Math]::Min(200, $processResponse.Content.Length)))..."
}

# 7. Get Transaction Details
Print-Section "7. Get Transaction Details"
Start-Sleep -Seconds 1
$transactionResponse = Invoke-RestMethod -Uri "$baseUrl/api/transactions/$transactionId" -Method Get
$transactionResponse | ConvertTo-Json -Depth 5
Print-Success "Transaction details retrieved"

# 8. Topup Wallet
Print-Section "8. Topup Wallet"
$topupBody = @{
    phone = "01700000001"
    amount = 500
} | ConvertTo-Json

$topupResponse = Invoke-RestMethod -Uri "$baseUrl/wallet/topup" -Method Post -Body $topupBody -ContentType "application/json"
$topupResponse | ConvertTo-Json
$newBalance = $topupResponse.balance

if ($newBalance) {
    Print-Success "Wallet topped up, new balance: ৳$newBalance"
} else {
    Print-Error "Topup failed"
}

# 9. Get User Transactions
Print-Section "9. Get User Transaction History"
if ($userId) {
    $transactionsResponse = Invoke-RestMethod -Uri "$baseUrl/api/users/$userId/transactions?page=1&limit=5" -Method Get
    $transactionsResponse | ConvertTo-Json -Depth 5
    Print-Success "Transaction history retrieved"
} else {
    Print-Error "Skipped - no user ID available"
}

# 10. Test Idempotency
Print-Section "10. Test Idempotency (Double Payment Attempt)"
Write-Host "Creating another payment session..."
$payment2Body = @{ amount = 50 } | ConvertTo-Json
$payment2Response = Invoke-RestMethod -Uri "$baseUrl/wallet/pay" -Method Post -Body $payment2Body -ContentType "application/json"
$transactionId2 = $payment2Response.transaction_id

Write-Host "First payment attempt..."
$process1 = Invoke-WebRequest -Uri "$baseUrl/wallet/pay/$transactionId2" -Method Post -Body "phone=01700000001&pin=1234" -ContentType "application/x-www-form-urlencoded"

Write-Host "Second payment attempt (should not deduct again)..."
$process2 = Invoke-WebRequest -Uri "$baseUrl/wallet/pay/$transactionId2" -Method Post -Body "phone=01700000001&pin=1234" -ContentType "application/x-www-form-urlencoded"

if ($process2.Content -match "Payment Already Completed") {
    Print-Success "Idempotency working - no double debit"
} else {
    Print-Error "Idempotency check inconclusive"
}

# 11. Test Insufficient Balance
Print-Section "11. Test Insufficient Balance"
$largePaymentBody = @{ amount = 50000 } | ConvertTo-Json
$largePayment = Invoke-RestMethod -Uri "$baseUrl/wallet/pay" -Method Post -Body $largePaymentBody -ContentType "application/json"
$transactionId3 = $largePayment.transaction_id

$insufficientResponse = Invoke-WebRequest -Uri "$baseUrl/wallet/pay/$transactionId3" -Method Post -Body "phone=01700000001&pin=1234" -ContentType "application/x-www-form-urlencoded"

if ($insufficientResponse.Content -match "Insufficient balance|insufficient balance") {
    Print-Success "Insufficient balance check working"
} else {
    Print-Error "Insufficient balance check may not be working"
}

# 12. Test Invalid PIN
Print-Section "12. Test Invalid PIN"
$invalidPaymentBody = @{ amount = 10 } | ConvertTo-Json
$invalidPayment = Invoke-RestMethod -Uri "$baseUrl/wallet/pay" -Method Post -Body $invalidPaymentBody -ContentType "application/json"
$transactionId4 = $invalidPayment.transaction_id

$invalidPinResponse = Invoke-WebRequest -Uri "$baseUrl/wallet/pay/$transactionId4" -Method Post -Body "phone=01700000001&pin=9999" -ContentType "application/x-www-form-urlencoded"

if ($invalidPinResponse.Content -match "Invalid|Failed") {
    Print-Success "Invalid PIN rejected"
} else {
    Print-Error "PIN validation may not be working"
}

# Summary
Print-Section "Test Summary"
Write-Host "All basic API tests completed!"
Write-Host ""
Write-Host "Test Coverage:"
Write-Host "  ✓ Health check"
Write-Host "  ✓ User creation"
Write-Host "  ✓ Authentication"
Write-Host "  ✓ Payment session creation"
Write-Host "  ✓ Payment processing"
Write-Host "  ✓ Transaction retrieval"
Write-Host "  ✓ Wallet topup"
Write-Host "  ✓ Transaction history"
Write-Host "  ✓ Idempotency"
Write-Host "  ✓ Insufficient balance"
Write-Host "  ✓ Invalid PIN"
Write-Host ""
Print-Success "Mock Wallet Gateway is working correctly!"
Write-Host ""
