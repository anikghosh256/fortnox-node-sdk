import { FortnoxClient } from '../src';

/**
 * Basic usage example
 * Shows how to initialize the SDK and perform common operations
 */
async function main() {
  const client = new FortnoxClient({
    clientId: process.env.FORTNOX_CLIENT_ID || 'your-client-id',
    clientSecret: process.env.FORTNOX_CLIENT_SECRET || 'your-client-secret',
    redirectUri: 'https://yourapp.com/callback',
    scopes: ['article', 'companyinformation'],
  });

  try {
    // List articles
    console.log('[INFO] Fetching articles...');
    const articleList = await client.articles.list({ limit: 5 });
    console.log(`[SUCCESS] Retrieved ${articleList.Articles.length} articles`);

    // Get specific article
    if (articleList.Articles.length > 0) {
      const articleNumber = articleList.Articles[0].ArticleNumber;
      console.log(`[INFO] Fetching article: ${articleNumber}`);
      const article = await client.articles.get(articleNumber);
      console.log(`[SUCCESS] Article: ${article.Description} - ${article.SalesPrice} SEK`);
    }

    // Create article
    console.log('[INFO] Creating new article...');
    const newArticle = await client.articles.create({
      Description: 'Test Product',
      SalesPrice: 99.99,
      PurchasePrice: 50.0,
      VAT: 25,
      Type: 'STOCK',
      Active: true,
    });
    console.log(`[SUCCESS] Created article: ${newArticle.ArticleNumber}`);

    // Update article
    console.log(`[INFO] Updating article: ${newArticle.ArticleNumber}`);
    const updatedArticle = await client.articles.update(newArticle.ArticleNumber, {
      SalesPrice: 89.99,
    });
    console.log(`[SUCCESS] Updated price to ${updatedArticle.SalesPrice} SEK`);

    // Delete article
    console.log(`[INFO] Deleting article: ${newArticle.ArticleNumber}`);
    await client.articles.delete(newArticle.ArticleNumber);
    console.log('Article deleted successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main();
}

export { main };
