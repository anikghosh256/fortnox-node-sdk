import { FortnoxClient } from '../src';

async function main() {
  // Initialize the client
  const client = new FortnoxClient({
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    redirectUri: 'http://localhost:3000/callback',
  });

  try {
    // List all active customers
    const activeCustomers = await client.customers.list({ filter: 'active' });
    console.log('Active customers:', activeCustomers);

    // Search for a customer by name
    const searchResults = await client.customers.list({ 
      name: 'Acme Corporation',
      city: 'Stockholm'
    });
    console.log('Search results:', searchResults);

    // Get a specific customer
    const customer = await client.customers.get('CUST001');
    console.log('Customer:', customer);

    // Create a new customer
    const newCustomer = await client.customers.create({
      Name: 'New Company AB',
      Type: 'COMPANY',
      OrganisationNumber: '555555-5555',
      Email: 'contact@newcompany.com',
      Phone1: '+46 8 123 456',
      Address1: 'Main Street 123',
      City: 'Stockholm',
      ZipCode: '11122',
      CountryCode: 'SE',
      Currency: 'SEK',
      VATType: 'SEVAT',
      Active: true,
    });
    console.log('Created customer:', newCustomer);

    // Update a customer
    const updatedCustomer = await client.customers.update('CUST001', {
      Email: 'newemail@example.com',
      Phone1: '+46 8 987 654',
      Comments: 'Updated contact information',
    });
    console.log('Updated customer:', updatedCustomer);

    // Delete a customer
    await client.customers.delete('CUST999');
    console.log('Customer deleted successfully');

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
