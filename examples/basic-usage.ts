import { FortnoxClient } from '../src';

async function main() {
  const client = new FortnoxClient({
    clientId: process.env.FORTNOX_CLIENT_ID || 'your-client-id',
    clientSecret: process.env.FORTNOX_CLIENT_SECRET || 'your-client-secret',
    redirectUri: 'https://yourapp.com/callback',
    scopes: ['article', 'companyinformation'],
  });

  try {
    // List articles
    const articleList = await client.articles.list({ limit: 5 });
    console.log(`Retrieved ${articleList.Articles.length} articles`);

    // Get specific article
    if (articleList.Articles.length > 0) {
      const articleNumber = articleList.Articles[0].ArticleNumber;
      const article = await client.articles.get(articleNumber);
      console.log(`Article: ${article.Description} - ${article.SalesPrice} SEK`);
    }

    // Create article
    const newArticle = await client.articles.create({
      Description: 'Test Product',
      SalesPrice: 99.99,
      PurchasePrice: 50.0,
      VAT: 25,
      Type: 'STOCK',
      Active: true,
    });
    console.log(`Created article: ${newArticle.ArticleNumber}`);

    // Update article
    const updatedArticle = await client.articles.update(newArticle.ArticleNumber, {
      SalesPrice: 89.99,
    });
    console.log(`Updated price to ${updatedArticle.SalesPrice} SEK`);

    // Delete article
    await client.articles.delete(newArticle.ArticleNumber);
    console.log('Article deleted successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

if (require.main === module) {
  main();
}

export { main };
