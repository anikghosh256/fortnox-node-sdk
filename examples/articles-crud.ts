import {
  FortnoxClient,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  ApiError,
} from '../src';

async function articlesCRUDExample() {
  const client = new FortnoxClient({
    clientId: process.env.FORTNOX_CLIENT_ID!,
    clientSecret: process.env.FORTNOX_CLIENT_SECRET!,
    redirectUri: 'https://yourapp.com/callback',
  });

  try {
    // Create article
    const newArticle = await client.articles.create({
      Description: 'Professional Widget',
      SalesPrice: 199.99,
      PurchasePrice: 100.0,
      VAT: 25,
      Type: 'STOCK',
      Active: true,
    });
    console.log(`Created article: ${newArticle.ArticleNumber}`);
    const articleNumber = newArticle.ArticleNumber;

    // Get single article
    const article = await client.articles.get(articleNumber);
    console.log(`${article.Description} - ${article.SalesPrice} SEK`);

    // List articles with pagination
    const articleList = await client.articles.list({
      page: 1,
      limit: 10,
      sortby: 'articlenumber',
      sortorder: 'descending',
    });
    console.log(`Retrieved ${articleList.Articles.length} articles`);

    // Update article
    const updated = await client.articles.update(articleNumber, {
      SalesPrice: 249.99,
    });
    console.log(`Updated price to ${updated.SalesPrice} SEK`);

    // Delete article
    await client.articles.delete(articleNumber);
    console.log('Article deleted');
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

    // Bulk create
    const created = await Promise.all(
      articlesData.map((data) => client.articles.create(data))
    );
    console.log(`Created ${created.length} articles`);

    // Bulk update
    const updated = await Promise.all(
      created.map((article) =>
        client.articles.update(article.ArticleNumber, {
          SalesPrice: article.SalesPrice! * 1.1,
        })
      )
    );
    console.log(`Updated ${updated.length} articles`);

    // Cleanup
    await Promise.all(created.map((a) => client.articles.delete(a.ArticleNumber)));
    console.log('Cleanup complete');
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
    await client.articles.get('NONEXISTENT');
  } catch (error) {
    handleError(error);
  }

  try {
    await client.articles.create({ Description: 'Test', VAT: 150 });
  } catch (error) {
    handleError(error);
  }
}

function handleError(error: unknown): void {
  if (error instanceof AuthenticationError) {
    console.error('Authentication failed:', error.message);
  } else if (error instanceof ValidationError) {
    console.error('Validation failed:', error.message);
    if (error.details) console.error('Details:', JSON.stringify(error.details));
  } else if (error instanceof NotFoundError) {
    console.error('Resource not found:', error.message);
  } else if (error instanceof ApiError) {
    console.error('API error:', error.message);
  } else {
    console.error('Unknown error:', error);
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
