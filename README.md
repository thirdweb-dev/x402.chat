# x402.chat

![x402.chat Banner](./src/app/opengraph-image.png)

Post messages on anyone's page, with each post requiring payment in CHAT tokens. The more comments on a page the more it costs to post!

Try it live at [x402.chat](https://x402.chat).

The app showcases [thirdweb's x402 stack](https://portal.thirdweb.com/payments/x402) with dynamic pricing based on comment count and payments on 3 chains and 4 different tokens handled through the x402 facilitator.

## thirdweb x402 Facilitator

In this app the thirdweb x402 facilitator handles the purchase of CHAT tokens, and the payments for posting comments and replies, all with dynamic pricing.

### Key Features

- **Single Function**: One `settlePayment()` call handles the entire payment flow
- **Multi-Chain**: Supports 170+ EVM chains (Ethereum, Arbitrum, Base, Polygon, and more)
- **Multi-Token**: Accepts 400+ tokens (any ERC-3009 and ERC-2612 token)
- **Speed settings**: Configure when to consider a payment successful, from simulated to confirmed
- **Dynamic Pricing**: Calculate prices based on your own logic

### Example Usage

The facilitator handles payment verification and settlement in one line:

```typescript
import * as x402 from "thirdweb/x402";

const facilitator = x402.facilitator({
  client,
  serverWalletAddress,
});

const result = await x402.settlePayment({
  resourceUrl: "https://x402.chat/api/comment",
  method: "POST",
  paymentData: request.headers.get("x-payment"),
  payTo: recipientAddress,
  network: chain,
  price: "$0.10", // or calculate dynamically
  facilitator: facilitator,
});

if (result.status !== 200) {
  // Payment required - return 402 response
  return Response.json(result.responseBody, {
    status: result.status,
    headers: result.responseHeaders,
  });
}

// Payment verified! Access payer info and continue
const payerAddress = result.paymentReceipt.payer;
```

**Real-world implementations:**

- [Dynamic pricing based on comment count](src/app/api/comment/route.ts) - Price increases as more comments are posted
- [Fixed USD pricing for token minting](src/app/api/mint/route.ts) - Mint custom tokens with USDC payments on 3 chains

**Learn more:** [x402 Documentation](https://portal.thirdweb.com/payments/x402)

## HTTP Payments with wrapFetchWithPayment

On the frontend, use `wrapFetchWithPayment` to automatically handle payment prompts when calling protected endpoints:

```typescript
import { wrapFetchWithPayment } from "thirdweb/x402";

// Wrap the native fetch function
const fetchWithPayment = wrapFetchWithPayment(fetch, client, wallet);

// Use it like regular fetch - payments are handled automatically
const response = await fetchWithPayment("/api/mint", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ amount: 10, paymentChainId: 137 }),
});
```

When the API returns `402 Payment Required`, the wrapper automatically:

1. Prompts the user to sign the payment
2. Submits the payment signature
3. Retries the request with payment proof
4. Returns the successful response

**See it in action:** [Token minting with automatic payment handling](src/components/top-up-modal.tsx#L143-L154)

## 🏃‍♂️ Running Locally

### Prerequisites

- Node.js 20 or higher
- PostgreSQL database
- pnpm (`npm install -g pnpm`)

### Environment Variables

Create a `.env.local` file:

```bash
# Database
DATABASE_URL=postgresql://postgres:password@host:5432/database

# Thirdweb
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your-client-id
THIRDWEB_SECRET_KEY=your-secret-key
SERVER_WALLET_ADDRESS=your-server-wallet-address
```

**Get your credentials:**

- **Database**: [Supabase](https://supabase.com/), [Neon](https://neon.tech/), [Railway](https://railway.app/), or any PostgreSQL provider
- **Thirdweb**: Get your Client ID and Secret Key from the [thirdweb dashboard](https://thirdweb.com/dashboard)
- **Server Wallet**: Create a server wallet in the thirdweb dashboard

### Installation & Setup

1. Install dependencies:

```bash
pnpm install
```

2. Set up the database:

```bash
# Run migrations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

3. Start the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000)

---

Built with [thirdweb](https://thirdweb.com/), [Next.js 16](https://nextjs.org/), and [Tailwind CSS v4](https://tailwindcss.com/)
