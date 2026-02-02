# Payment Integration Guide

## Overview

This document describes the payment system architecture for Practix platform, including integration with Uzbekistan payment providers (Payme, Click) and legal requirements.

---

## Architecture

### Database Models

```prisma
# Subscription Plans
model SubscriptionPlan {
  id           String   @id
  slug         String   @unique  # 'global', 'go-basics', etc.
  type         String   # 'global' | 'course'
  priceMonthly Int      # Price in tiyn (1 UZS = 100 tiyn)
  currency     String   @default("UZS")
}

# User Subscriptions
model Subscription {
  id        String   @id
  userId    String
  planId    String
  status    String   # 'active' | 'cancelled' | 'expired' | 'pending'
  startDate DateTime
  endDate   DateTime
  autoRenew Boolean  @default(true)
}

# Subscription Payments
model Payment {
  id             String   @id
  subscriptionId String
  amount         Int      # Amount in tiyn
  status         String   # 'pending' | 'completed' | 'failed' | 'refunded'
  provider       String?  # 'payme' | 'click'
  providerTxId   String?  # External transaction ID
  metadata       Json?
}

# One-time Purchases (roadmap, AI credits)
model Purchase {
  id           String   @id
  userId       String
  type         String   # 'roadmap_generation' | 'ai_credits'
  quantity     Int      @default(1)
  amount       Int
  status       String
  provider     String?
  providerTxId String?
}

# Transaction Log (audit)
model PaymentTransaction {
  id             String   @id
  orderId        String
  orderType      String   # 'subscription' | 'purchase'
  provider       String   # 'payme' | 'click'
  providerTxId   String?
  amount         Int
  state          Int      # Provider-specific state
  action         String   # 'create' | 'perform' | 'cancel' | 'check'
  request        Json?
  response       Json?
}
```

### Backend Structure

```
server/src/payments/
├── payments.module.ts
├── payments.service.ts      # Business logic
├── payments.controller.ts   # API endpoints
├── dto/payment.dto.ts       # DTOs & enums
└── providers/
    ├── payme.provider.ts    # Payme JSON-RPC 2.0
    └── click.provider.ts    # Click Shop API
```

### API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/payments/providers` | GET | No | Available payment providers |
| `/payments/pricing` | GET | No | One-time purchase prices |
| `/payments/history` | GET | JWT | User's payment history |
| `/payments/roadmap-credits` | GET | JWT | User's roadmap credits |
| `/payments/status/:orderId` | GET | JWT | Check payment status |
| `/payments/checkout` | POST | JWT | Create checkout session |
| `/payments/webhook/payme` | POST | No* | Payme webhook (Basic Auth) |
| `/payments/webhook/click` | POST | No* | Click webhook (Signature) |

---

## Payment Providers

### Payme

**Protocol**: JSON-RPC 2.0 over HTTPS

**Base URLs**:
- Production: `https://checkout.paycom.uz`
- Test: `https://test.paycom.uz`

**Payment Link Format**:
```
https://checkout.paycom.uz/{base64(m=MERCHANT_ID;ac.order_id=ORDER_ID;a=AMOUNT)}
```

**Webhook Methods**:
- `CheckPerformTransaction` - Validate order before payment
- `CreateTransaction` - Create payment transaction
- `PerformTransaction` - Complete payment (funds debited)
- `CancelTransaction` - Cancel/refund payment
- `CheckTransaction` - Get transaction status
- `GetStatement` - Get transactions for reconciliation

**Transaction States**:
- `1` - Pending (awaiting payment)
- `2` - Completed
- `-1` - Cancelled before completion
- `-2` - Cancelled after completion (refund)

**Authentication**: Basic Auth with `Paycom:{SECRET_KEY}`

### Click

**Protocol**: HTTP POST with MD5 signature

**Base URL**: `https://my.click.uz/services/pay`

**Payment Link Format**:
```
https://my.click.uz/services/pay?service_id=XXX&merchant_id=XXX&amount=XXX&transaction_param=ORDER_ID
```

**Webhook Actions**:
- `action=0` (Prepare) - Validate order before payment
- `action=1` (Complete) - Complete payment

**Signature Formula**:
```
Prepare: md5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id + amount + action + sign_time)
Complete: md5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id + merchant_prepare_id + amount + action + sign_time)
```

---

## Configuration

### Environment Variables

```bash
# server/.env

# Payme (https://merchant.payme.uz)
PAYME_MERCHANT_ID=your_merchant_id
PAYME_SECRET_KEY=your_secret_key
PAYME_TEST_MODE=true  # Set to false in production

# Click (https://my.click.uz/services/create)
CLICK_SERVICE_ID=your_service_id
CLICK_MERCHANT_ID=your_merchant_id
CLICK_SECRET_KEY=your_secret_key
CLICK_MERCHANT_USER_ID=1
CLICK_TEST_MODE=true  # Set to false in production
```

### Webhook URLs (configure in provider dashboard)

```
Payme:  https://your-domain.com/api/payments/webhook/payme
Click:  https://your-domain.com/api/payments/webhook/click
```

---

## Checkout Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│   Provider  │
│  /payments  │     │  /checkout  │     │  (Payme/    │
│             │     │             │     │   Click)    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │  1. Select plan   │                   │
       │  2. Choose        │                   │
       │     provider      │                   │
       │                   │                   │
       │  POST /checkout   │                   │
       │ ─────────────────▶│                   │
       │                   │  Create pending   │
       │                   │  Payment/Purchase │
       │                   │                   │
       │  { paymentUrl }   │                   │
       │ ◀─────────────────│                   │
       │                   │                   │
       │  Redirect to      │                   │
       │  provider page    │                   │
       │ ─────────────────────────────────────▶│
       │                   │                   │
       │                   │     Webhooks      │
       │                   │ ◀─────────────────│
       │                   │                   │
       │                   │  Update status    │
       │                   │  Activate sub     │
       │                   │                   │
       │  Redirect back    │                   │
       │ ◀─────────────────────────────────────│
       │                   │                   │
       └─────────────────────────────────────────┘
```

---

## Pricing

### Subscription Plans

| Plan | Type | Price (UZS) | Features |
|------|------|-------------|----------|
| Global Premium | global | 150,000/mo | All courses, 100 AI/day, priority queue |
| Course (each) | course | 50,000/mo | Single course access, 30 AI/day |

### One-time Purchases

| Item | Price (UZS) | Description |
|------|-------------|-------------|
| Roadmap Generation | 15,000 | Personal learning roadmap (AI-generated) |
| AI Credits (50) | 10,000 | Additional AI tutor requests |

---

## Frontend Components

### PaymentsPage

Located at: `src/features/payments/ui/PaymentsPage.tsx`

**Tabs**:
1. **Subscribe** - Select plan, choose provider, checkout
2. **Purchases** - One-time items (Roadmap, AI credits)
3. **History** - Past payments and statuses

**Features**:
- Pre-select plan from URL: `/payments?plan=go-basics`
- Real-time provider availability status
- Loading states and error handling
- Multi-language support (EN/RU/UZ)

---

## Testing

### Test Mode

Both providers support test mode:
- Set `PAYME_TEST_MODE=true` and `CLICK_TEST_MODE=true`
- Use test credentials from provider dashboard
- Test cards provided by each provider

### Test Cards (Payme)

```
Card: 8600 0000 0000 0000
Expiry: Any future date
SMS: 666666
```

### Test Cards (Click)

```
Use sandbox environment at my.click.uz
Test transactions will not be charged
```

---

## Legal Requirements

### Required for Payment Integration

1. **Legal Entity Registration**
   - ИП (Individual Entrepreneur) OR
   - ООО (LLC)

2. **Bank Account**
   - Business account in Uzbekistan bank
   - Required for receiving payments

3. **Agreement with Provider**
   - Apply at merchant.payme.uz or my.click.uz
   - Provide business documents
   - Wait for approval (5-10 business days)

4. **Compliance (from July 1, 2025)**
   - E-commerce registration required
   - Special bank accounts for online payments

### Provider Application Documents

- Business registration certificate
- Bank account details
- Contact information
- Website/app URL
- Business description

---

## Security Considerations

1. **Webhook Authentication**
   - Payme: Verify Basic Auth header
   - Click: Verify MD5 signature

2. **Amount Validation**
   - Always verify amount matches order

3. **Idempotency**
   - Handle duplicate webhook calls

4. **Logging**
   - PaymentTransaction model logs all requests

5. **HTTPS Required**
   - Webhooks must use HTTPS

---

## Troubleshooting

### Common Issues

1. **Webhook not receiving requests**
   - Check URL is publicly accessible
   - Verify HTTPS certificate
   - Check provider dashboard for logs

2. **Signature validation failed**
   - Verify SECRET_KEY matches
   - Check parameter order in signature

3. **Payment stuck in pending**
   - Check webhook logs
   - Verify provider connection

### Debug Mode

Enable detailed logging:
```typescript
// payments.service.ts
this.logger.debug('Webhook received', { method, params });
```

---

## References

- [Payme Developer Docs](https://developer.help.paycom.uz/)
- [Payme Merchant Portal](https://merchant.payme.uz/)
- [Click API Docs](https://docs.click.uz/)
- [Click Service Creation](https://my.click.uz/services/create)
