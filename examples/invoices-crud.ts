import { FortnoxClient } from '../src';

async function main() {
  const client = new FortnoxClient({
    clientId: process.env.FORTNOX_CLIENT_ID || 'your-client-id',
    clientSecret: process.env.FORTNOX_CLIENT_SECRET || 'your-client-secret',
    redirectUri: 'https://yourapp.com/callback',
    scopes: ['invoice', 'companyinformation'],
  });

  try {
    const invoiceList = await client.invoices.list({ filter: 'unpaid' });
    console.log(`Found ${invoiceList.Invoices.length} unpaid invoices`);

    const filteredInvoices = await client.invoices.list({
      customernumber: 'CUST001',
      fromdate: '2024-01-01',
      todate: '2024-12-31',
      sortby: 'invoicedate',
    });

    if (invoiceList.Invoices.length > 0 && invoiceList.Invoices[0].DocumentNumber) {
      const invoice = await client.invoices.get(invoiceList.Invoices[0].DocumentNumber);
      console.log(`Invoice: ${invoice.DocumentNumber}, Total: ${invoice.Total}`);
    }

    const newInvoice = await client.invoices.create({
      CustomerNumber: 'CUST001',
      InvoiceDate: '2024-02-20',
      DueDate: '2024-03-20',
      Language: 'EN',
      Currency: 'SEK',
      InvoiceRows: [
        {
          ArticleNumber: 'ART001',
          Description: 'Consulting Services',
          Price: 1500,
          VAT: 25,
        },
        {
          ArticleNumber: 'ART002',
          Description: 'Software License',
          Price: 500,
          VAT: 25,
        },
      ],
      OurReference: 'John Doe',
      YourReference: 'Jane Smith',
      Freight: 100,
      AdministrationFee: 50,
    });
    console.log(`Created: ${newInvoice.DocumentNumber}`);

    if (newInvoice.DocumentNumber) {
      await client.invoices.update(newInvoice.DocumentNumber, {
        Comments: 'Updated payment terms',
      });

      await client.invoices.sendEmail(newInvoice.DocumentNumber);

      const pdfBuffer = await client.invoices.preview(newInvoice.DocumentNumber);
      console.log(`Preview PDF: ${pdfBuffer.byteLength} bytes`);

      const bookedInvoice = await client.invoices.bookkeep(newInvoice.DocumentNumber);
      console.log(`Booked: ${bookedInvoice.VoucherNumber}`);

      const creditInvoice = await client.invoices.credit(newInvoice.DocumentNumber);
      console.log(`Credit: ${creditInvoice.DocumentNumber}`);
    }

    const invoiceWithEmail = await client.invoices.create({
      CustomerNumber: 'CUST001',
      InvoiceRows: [{ ArticleNumber: 'ART001', Price: 999, VAT: 25 }],
      EmailInformation: {
        EmailAddressTo: 'customer@example.com',
        EmailSubject: 'Invoice from Your Company',
        EmailBody: 'Please find your invoice attached.',
      },
    });
    console.log(`With email: ${invoiceWithEmail.DocumentNumber}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

if (require.main === module) {
  main();
}
