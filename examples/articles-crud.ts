import {
  FortnoxClient,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  ApiError,
} from '../src';

/**
 * Articles CRUD operations example
 * Demonstrates all article operations with proper error handling
 */
async function articlesCRUDExample() {
  const client = new FortnoxClient({
    clientId: process.env.FORTNOX_CLIENT_ID!,
    clientSecret: process.env.FORTNOX_CLIENT_SECRET!,
    redirectUri: 'https://yourapp.com/callback',
  });

  try {
    // CREATE
    console.log('[INFO] Creating article...');
    const newArticle = await client.articles.create({
      Description: 'Professional Widget',
      SalesPrice: 199.99,
      PurchasePrice: 100.0,
      VAT: 25,
      Type: 'STOCK',
      Active: true,
    });
    console.log(`[SUCCESS] Created article: ${newArticle.ArticleNumber}`);
    const articleNumber = newArticle.ArticleNumber;

    // READ (Single)
    console.log(`[INFO] Fetching article: ${articleNumber}`);
    const article = await client.articles.get(articleNumber);
    console.log(`[SUCCESS] ${article.Description} - ${article.SalesPrice} SEK`);

    // READ (List with pagination)
    console.log('[INFO] Fetching articles (page 1, limit 10)');
    const articleList = await client.articles.list({
      page: 1,
      limit: 10,
      sortby: 'articlenumber',
      sortorder: 'descending',
    });
    console.log(`[SUCCESS] Retrieved ${articleList.Articles.length} articles`);

    // UPDATE
    console.log(`[INFO] Updating article: ${articleNumber}`);
    const updated = await client.articles.update(articleNumber, {
      SalesPrice: 249.99,
    });
    console.log(`[SUCCESS] Updated price to ${updated.SalesPrice} SEK`);

    // DELETE
    console.log(`[INFO] Deleting article: ${articleNumber}`);
    await client.articles.delete(articleNumber);
    console.log('[SUCCESS] Article deleted');
  } catch (error) {
    handleError(error);
  }
}

async function bulkOperationsExample() {
  const client = new FortnoxClient({
    clientId: process.env.FORTNOX_CLIENT_ID!,
    clientSecret: process.env.FORTNOX_CLIENT_SECRET!,
    redirectUri: 'https://yourapp.com/callback',
  });

  try {
    const articlesData = [
      { Description: 'Widget A', SalesPrice: 10.99, VAT: 25 },
      { Description: 'Widget B', SalesPrice: 20.99, VAT: 25 },
      { Description: 'Widget C', SalesPrice: 30.99, VAT: 25 },
    ];

    console.log(`[INFO] Creating ${articlesData.length} articles...`);
    const created = await Promise.all(
      articlesData.map((data) => client.articles.create(data))
    );
    console.log(`[SUCCESS] Created ${created.length} articles`);

    console.log('[INFO] Updating prices (10% increase)...');
    const updated = await Promise.all(
      created.map((article) =>
        client.articles.update(article.ArticleNumber, {
          SalesPrice: article.SalesPrice! * 1.1,
        })
      )
    );
    console.log(`[SUCCESS] Updated ${updated.length} articles`);

    console.log('[INFO] Cleaning up test articles...');
    await Promise.all(created.map((a) => client.articles.delete(a.ArticleNumber)));
    console.log('[SUCCESS] Cleanup complete');
  } catch (error) {
    handleError(error);
  }
}

async function errorHandlingExample() {
  const client = new FortnoxClient({
    clientId: process.env.FORTNOX_CLIENT_ID!,
    clientSecret: process.env.FORTNOX_CLIENT_SECRET!,
    redirectUri: 'https://yourapp.com/callback',
  });

  try {
    console.log('[INFO] Attempting to fetch non-existent article');
    await client.articles.get('NONEXISTENT');
  } catch (error) {
    handleError(error);
  }

  try {
    console.log('[INFO] Creating article with invalid VAT value');
    await client.articles.create({ Description: 'Test', VAT: 150 });
  } catch (error) {
    handleError(error);
  }
}

function handleError(error: unknown): void {
  if (error instanceof AuthenticationError) {
    console.error('[ERROR] Authentication failed:', error.message);
    console.error('  Code:', error.code, 'Status:', error.statusCode);
  } else if (error instanceof ValidationError) {
    console.error('[ERROR] Validation failed:', error.message);
    if (error.details) console.error('  Details:', JSON.stringify(error.details));
  } else if (error instanceof NotFoundError) {
    console.error('[ERROR] Resource not found:', error.message);
  } else if (error instanceof ApiError) {
    console.error('[ERROR] API error:', error.message);
    console.error('  Code:', error.code, 'Status:', error.statusCode);
  } else {
    console.error('[ERROR] Unknown error:', error);
  }
}

if (require.main === module) {
  async function runAll() {
    await articlesCRUDExample();
    console.log('\n---\n');
    await bulkOperationsExample();
    console.log('\n---\n');
    await errorHandlingExample();
  }
  runAll().catch(console.error);
}

export { articlesCRUDExample, bulkOperationsExample, errorHandlingExample };
