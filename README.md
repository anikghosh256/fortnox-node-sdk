# Fortnox Node.js SDK

Modern TypeScript SDK for Fortnox API with OAuth 2.0 and automatic token refresh.

[![CI](https://github.com/anikghosh256/fortnox-node-sdk/workflows/CI/badge.svg)](https://github.com/anikghosh256/fortnox-node-sdk/actions)
[![npm version](https://badge.fury.io/js/%40anikghosh256%2Ffortnox-node-sdk.svg)](https://www.npmjs.com/package/@anikghosh256/fortnox-node-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Features

- OAuth 2.0 authentication with CSRF protection
- Automatic token refresh (proactive before expiry)
- Config-locked instances (isolated per instance)
- Native fetch (Node.js 18+, zero dependencies)
- Full TypeScript support
- Comprehensive error handling
- Articles CRUD operations
- Customers management
- Orders management with invoicing support
- **Invoices management** - create, bookkeep, email, print, credit
- Price Lists and Pricing management

## Installation

```bash
npm install @anikghosh256/fortnox-node-sdk
```

**Requirements:** Node.js >= 18.0.0

## Usage

### Initialize SDK

```typescript
import { FortnoxClient } from '@anikghosh256/fortnox-node-sdk';

const client = new FortnoxClient({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  redirectUri: 'https://yourapp.com/callback',
  scopes: ['article', 'companyinformation'],
  log: true, // Enable debug logging (optional)
});
```

### OAuth Authentication

```typescript
// Generate authorization URL
const { url, state } = client.getAuthManager().getAuthorizationUrl();
// Store state in session: req.session.state = state
// Redirect user: res.redirect(url)

// Handle callback
const tokens = await client.getAuthManager().exchangeCodeForToken(code, state);
```

### Articles API

```typescript
// List
const articles = await client.articles.list({ page: 1, limit: 10 });

// Get
const article = await client.articles.get('ART001');

// Create
const newArticle = await client.articles.create({
  Description: 'Product Name',
  SalesPrice: 99.99,
  VAT: 25,
});

// Update
await client.articles.update('ART001', { SalesPrice: 129.99 });

// Delete
await client.articles.delete('ART001');
```

### Customers API

```typescript
// List all customers
const customers = await client.customers.list();

// List active customers only
const activeCustomers = await client.customers.list({ 
  filter: 'active',
  sortby: 'name'
});

// Search customers by name, city, email, etc.
const searchResults = await client.customers.list({
  name: 'Acme',
  city: 'Stockholm',
  email: 'contact@example.com',
});

// Get specific customer
const customer = await client.customers.get('CUST001');

// Create new customer
const newCustomer = await client.customers.create({
  Name: 'Acme Corporation AB',
  Type: 'COMPANY',
  OrganisationNumber: '555555-5555',
  Email: 'contact@acme.com',
  Phone1: '+46 8 123 456',
  Address1: 'Main Street 123',
  City: 'Stockholm',
  ZipCode: '11122',
  CountryCode: 'SE',
  Currency: 'SEK',
  VATType: 'SEVAT',
  Active: true,
  PriceList: 'A',
  TermsOfPayment: '30',
});

// Update customer
const updated = await client.customers.update('CUST001', {
  Email: 'newemail@acme.com',
  Phone1: '+46 8 987 654',
  Comments: 'VIP customer - priority handling',
});

// Delete customer
await client.customers.delete('CUST001');
```

### Orders API

```typescript
// List orders with filters
const orders = await client.orders.list({
  customernumber: 'C001',
  orderdatefrom: '2024-01-01',
  orderdateto: '2024-12-31',
  notcompleted: true,
  page: 1,
  limit: 10,
});

// Get single order
const order = await client.orders.get('1');

// Create order
const newOrder = await client.orders.create({
  CustomerNumber: 'C001',
  OrderDate: '2024-01-15',
  DeliveryDate: '2024-01-20',
  OrderRows: [
    {
      ArticleNumber: 'ART001',
      OrderedQuantity: '5',
      Price: 150,
      VAT: 25,
      Discount: 10,
    },
  ],
  Comments: 'Urgent order',
  Language: 'EN',
  Freight: 50,
});

// Update order
await client.orders.update('1', {
  Comments: 'Updated comment',
  DeliveryDate: '2024-01-18',
});

// Cancel order
await client.orders.cancel('1');

// Create invoice from order
const invoice = await client.orders.createInvoice('1');

// Send order by email
await client.orders.sendEmail('1');

// Print order (returns PDF buffer)
const pdfBuffer = await client.orders.print('1');

// Preview order (returns PDF buffer without marking as printed)
const previewBuffer = await client.orders.preview('1');

// Get external print template
const printData = await client.orders.externalPrint('1');
```

### Invoices API

```typescript
// List invoices with filters
const invoices = await client.invoices.list({
  filter: 'unpaid',
  customernumber: 'CUST001',
  fromdate: '2024-01-01',
  todate: '2024-12-31',
  sortby: 'invoicedate',
});

// Get specific invoice
const invoice = await client.invoices.get('1');

// Create invoice
const newInvoice = await client.invoices.create({
  CustomerNumber: 'CUST001',
  InvoiceDate: '2024-02-20',
  DueDate: '2024-03-20',
  DeliveryDate: '2024-02-22',
  Comments: 'Thank you for your business',
  Language: 'EN',
  Currency: 'SEK',
  InvoiceRows: [
    {
      ArticleNumber: 'ART001',
      Description: 'Consulting Services',
      Price: 1500,
      VAT: 25,
      Discount: 10,
    },
  ],
  OurReference: 'John Doe',
  YourReference: 'Jane Smith',
  Freight: 100,
  AdministrationFee: 50,
});

// Update invoice
await client.invoices.update('1', {
  Comments: 'Updated payment terms',
  Remarks: 'Payment within 45 days',
});

// Bookkeep invoice (finalize for accounting)
const bookedInvoice = await client.invoices.bookkeep('1');

// Cancel invoice
const cancelledInvoice = await client.invoices.cancel('1');

// Create credit invoice
const creditInvoice = await client.invoices.credit('1');

// Send invoice by email
await client.invoices.sendEmail('1');

// Print invoice (returns PDF buffer)
const pdfBuffer = await client.invoices.print('1');

// Preview invoice (returns PDF without marking as sent)
const previewBuffer = await client.invoices.preview('1');

// Mark invoice as sent (external print)
await client.invoices.externalPrint('1');

// Create invoice with email information
const invoiceWithEmail = await client.invoices.create({
  CustomerNumber: 'CUST001',
  InvoiceDate: '2024-02-20',
  Currency: 'SEK',
  InvoiceRows: [{ ArticleNumber: 'ART001', Price: 999, VAT: 25 }],
  EmailInformation: {
    EmailAddressTo: 'customer@example.com',
    EmailSubject: 'Your Invoice',
    EmailBody: 'Thank you for your business!',
  },
});
```

### Price Lists API

```typescript
// List all price lists
const priceLists = await client.priceLists.list();

// Get specific price list
const priceList = await client.priceLists.get('A');

// Create new price list
const newPriceList = await client.priceLists.create({
  Code: 'WHOLESALE',
  Description: 'Wholesale Prices',
  Comments: 'For wholesale customers',
  PreSelected: false,
});

// Update price list
await client.priceLists.update('WHOLESALE', {
  Description: 'Updated Wholesale Prices',
  Comments: 'New comment',
});

// Delete price list
await client.priceLists.delete('WHOLESALE');
```

### Prices API

```typescript
// List all prices (optionally filter by price list)
const allPrices = await client.prices.list({
  pricelist: 'A',
  articlenumber: 'ART001',
});

// Get specific price
const price = await client.prices.get('A', 'ART001');

// Get price for specific quantity level (volume pricing)
const bulkPrice = await client.prices.get('A', 'ART001', 100);

// Create new price (using fixed price)
await client.prices.create({
  ArticleNumber: 'ART001',
  PriceList: 'WHOLESALE',
  Price: 85.00,
  FromQuantity: 1,
});

// Create price using percentage discount
await client.prices.create({
  ArticleNumber: 'ART001',
  PriceList: 'VIP',
  Percent: -15, // 15% discount
  FromQuantity: 1,
});

// Create volume discount (bulk pricing)
await client.prices.create({
  ArticleNumber: 'ART001',
  PriceList: 'WHOLESALE',
  Price: 75.00, // Lower price
  FromQuantity: 100, // When buying 100+
});

// Update price
await client.prices.update('WHOLESALE', 'ART001', 1, {
  Price: 80.00,
});

// Delete price
await client.prices.delete('WHOLESALE', 'ART001', 1);
```

## Configuration

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `clientId` | string | Yes | Fortnox client ID |
| `clientSecret` | string | Yes | Fortnox client secret |
| `redirectUri` | string | Yes | OAuth redirect URI |
| `scopes` | string[] | No | API scopes (default: ['article']) |
| `baseUrl` | string | No | API base URL |
| `log` | boolean | No | Enable debug logging (default: false) |
| `onTokenRefresh` | function | No | Callback when tokens refresh |
| `onTokenExpire` | function | No | Callback when refresh token expires |
| `initialAccessToken` | string | No | Existing access token |
| `initialRefreshToken` | string | No | Existing refresh token |

## Token Management

Access tokens are automatically refreshed 5 minutes before expiry.

### Persist Tokens

```typescript
const client = new FortnoxClient({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  redirectUri: 'https://yourapp.com/callback',
  initialAccessToken: loadedAccessToken,
  initialRefreshToken: loadedRefreshToken,
  log: false, // Disable logging in production
  onTokenRefresh: async (tokens) => {
    await db.saveTokens(tokens);
  },
});
```

**Token Lifetimes:**
- Access token: 1 hour
- Refresh token: 45 days
- Both tokens regenerate on refresh

## Error Handling

```typescript
import { AuthenticationError, ValidationError, NotFoundError } from '@anikghosh256/fortnox-node-sdk';

try {
  const article = await client.articles.get('ART001');
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Auth failed:', error.message);
  } else if (error instanceof NotFoundError) {
    console.error('Not found:', error.message);
  } else if (error instanceof ValidationError) {
    console.error('Invalid input:', error.message);
  }
}
```

**Error Types:**
- `AuthenticationError` - 401/403 responses
- `ValidationError` - 400 responses
- `NotFoundError` - 404 responses
- `RateLimitError` - 429 responses
- `ApiError` - Other API errors

## Development

```bash
npm install          # Install dependencies
npm test             # Run tests
npm run build        # Build package
npm run lint         # Lint code
```

## License

MIT © [Onik G.](https://github.com/anikghosh256)

## Links

- [Fortnox Developer Portal](https://www.fortnox.se/developer)
- [Fortnox API Docs](https://apps.fortnox.se/apidocs)
- [Issues](https://github.com/anikghosh256/fortnox-node-sdk/issues)