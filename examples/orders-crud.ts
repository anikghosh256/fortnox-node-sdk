/**
 * Example: Orders CRUD Operations
 * 
 * This example demonstrates how to perform basic CRUD operations
 * on orders using the Fortnox Node SDK.
 */

import { FortnoxClient, CreateOrderInput, UpdateOrderInput } from '../src';

async function main() {
  // Initialize the Fortnox client
  const client = new FortnoxClient({
    clientId: process.env.FORTNOX_CLIENT_ID!,
    clientSecret: process.env.FORTNOX_CLIENT_SECRET!,
    redirectUri: process.env.FORTNOX_REDIRECT_URI!,
  });

  // Note: You need to authenticate first using OAuth flow
  // See oauth-flow.ts for authentication example

  try {
    // 1. Create a new order
    console.log('Creating a new order...');
    const newOrderData: CreateOrderInput = {
      CustomerNumber: 'C001',
      OrderDate: '2024-01-15',
      DeliveryDate: '2024-01-20',
      OrderRows: [
        {
          ArticleNumber: 'ART001',
          Description: 'Premium Widget',
          OrderedQuantity: '5',
          Price: 150,
          VAT: 25,
          Discount: 10,
          DiscountType: 'PERCENT',
        },
        {
          ArticleNumber: 'ART002',
          Description: 'Standard Gadget',
          OrderedQuantity: '10',
          Price: 75,
          VAT: 25,
        },
      ],
      Comments: 'Urgent order - please expedite',
      YourReference: 'John Doe',
      OurReference: 'Jane Smith',
      Language: 'EN',
      Freight: 50,
      AdministrationFee: 25,
      TermsOfDelivery: 'FOB',
      TermsOfPayment: '30',
      Currency: 'SEK',
      OrderType: 'ORDER',
    };

    const createdOrder = await client.orders.create(newOrderData);
    console.log('Order created:', {
      documentNumber: createdOrder.DocumentNumber,
      total: createdOrder.Total,
      customerNumber: createdOrder.CustomerNumber,
    });

    const documentNumber = createdOrder.DocumentNumber!;

    // 2. Get the created order
    console.log('\nFetching order details...');
    const order = await client.orders.get(documentNumber);
    console.log('Order details:', {
      documentNumber: order.DocumentNumber,
      customerName: order.CustomerName,
      orderDate: order.OrderDate,
      deliveryDate: order.DeliveryDate,
      total: order.Total,
      totalVAT: order.TotalVAT,
      orderRows: order.OrderRows?.length,
    });

    // 3. List orders with filters
    console.log('\nListing orders...');
    const orders = await client.orders.list({
      customernumber: 'C001',
      orderdatefrom: '2024-01-01',
      orderdateto: '2024-12-31',
      notcompleted: true,
      page: 1,
      limit: 10,
      sortby: 'orderdate',
      sortorder: 'descending',
    });
    console.log(`Found ${orders.Orders.length} orders`);
    console.log('Orders:', orders.Orders.map(o => ({
      documentNumber: o.DocumentNumber,
      customerNumber: o.CustomerNumber,
      orderDate: o.OrderDate,
      total: o.Total,
    })));

    // 4. Update the order
    console.log('\nUpdating order...');
    const updateData: UpdateOrderInput = {
      Comments: 'Updated: Order confirmed by customer',
      YourReference: 'John Doe - Confirmed',
      DeliveryDate: '2024-01-18', // Earlier delivery
    };
    const updatedOrder = await client.orders.update(documentNumber, updateData);
    console.log('Order updated:', {
      documentNumber: updatedOrder.DocumentNumber,
      comments: updatedOrder.Comments,
      deliveryDate: updatedOrder.DeliveryDate,
    });

    // 5. Send order by email
    console.log('\nSending order by email...');
    const sentOrder = await client.orders.sendEmail(documentNumber);
    console.log('Order sent:', {
      documentNumber: sentOrder.DocumentNumber,
      sent: sentOrder.Sent,
    });

    // 6. Print order (get PDF)
    console.log('\nGenerating order PDF...');
    const pdfBuffer = await client.orders.print(documentNumber);
    console.log('PDF generated, size:', pdfBuffer.byteLength, 'bytes');
    // You can save this to a file or send it as a response
    // const fs = require('fs');
    // fs.writeFileSync('order.pdf', Buffer.from(pdfBuffer));

    // 7. Preview order (get PDF without marking as printed)
    console.log('\nGenerating order preview...');
    const previewBuffer = await client.orders.preview(documentNumber);
    console.log('Preview generated, size:', previewBuffer.byteLength, 'bytes');

    // 8. Create invoice from order
    console.log('\nCreating invoice from order...');
    const invoice = await client.orders.createInvoice(documentNumber);
    console.log('Invoice created:', invoice.InvoiceNumber);

    // 9. List all orders (without filters)
    console.log('\nListing all orders...');
    const allOrders = await client.orders.list();
    console.log(`Total orders: ${allOrders.Orders.length}`);
    if (allOrders.MetaInformation) {
      console.log('Pagination:', {
        totalResources: allOrders.MetaInformation['@TotalResources'],
        totalPages: allOrders.MetaInformation['@TotalPages'],
        currentPage: allOrders.MetaInformation['@CurrentPage'],
      });
    }

    // 10. Filter orders by different criteria
    console.log('\nFiltering orders...');
    
    // Get only uncompleted orders
    const uncompletedOrders = await client.orders.list({
      notcompleted: true,
    });
    console.log(`Uncompleted orders: ${uncompletedOrders.Orders.length}`);

    // Get sent orders
    const sentOrders = await client.orders.list({
      sent: true,
    });
    console.log(`Sent orders: ${sentOrders.Orders.length}`);

    // Get orders by project
    const projectOrders = await client.orders.list({
      project: 'PROJECT001',
    });
    console.log(`Orders for PROJECT001: ${projectOrders.Orders.length}`);

    // 11. Cancel an order (optional - only if needed)
    // console.log('\nCancelling order...');
    // const cancelledOrder = await client.orders.cancel(documentNumber);
    // console.log('Order cancelled:', {
    //   documentNumber: cancelledOrder.DocumentNumber,
    //   cancelled: cancelledOrder.Cancelled,
    // });

    console.log('\n✓ All order operations completed successfully!');

  } catch (error) {
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
    }
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

export { main };
