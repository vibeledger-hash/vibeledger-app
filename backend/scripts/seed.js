const { User, Wallet, Merchant } = require('../src/models');

const seed = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Create sample merchants
    const merchants = await Merchant.bulkCreate([
      {
        name: 'Coffee Corner',
        bleId: 'ble_coffee_001',
        qrCode: 'QR_COFFEE_001',
        category: 'Food & Beverage',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          address: '123 Main St, New York, NY'
        },
        contactInfo: {
          phone: '+1234567890',
          email: 'info@coffeecorner.com'
        },
        trustScore: 0.85
      },
      {
        name: 'Tech Store',
        bleId: 'ble_tech_001',
        qrCode: 'QR_TECH_001',
        category: 'Electronics',
        location: {
          latitude: 40.7589,
          longitude: -73.9851,
          address: '456 Tech Ave, New York, NY'
        },
        contactInfo: {
          phone: '+1234567891',
          email: 'sales@techstore.com'
        },
        trustScore: 0.92
      },
      {
        name: 'Local Grocery',
        bleId: 'ble_grocery_001',
        qrCode: 'QR_GROCERY_001',
        category: 'Grocery',
        location: {
          latitude: 40.7505,
          longitude: -73.9934,
          address: '789 Grocery Ln, New York, NY'
        },
        contactInfo: {
          phone: '+1234567892',
          email: 'contact@localgrocery.com'
        },
        trustScore: 0.78
      }
    ], { ignoreDuplicates: true });
    
    console.log(`Created ${merchants.length} sample merchants`);
    
    // Create a test user and wallet
    const testUser = await User.findOrCreate({
      where: { phoneNumber: '+1234567890' },
      defaults: {
        phoneNumber: '+1234567890',
        trustScore: 0.95
      }
    });
    
    if (testUser[1]) { // If user was created
      const wallet = await Wallet.create({
        userId: testUser[0].id,
        balance: 1000.00,
        dailyLimit: 500.00
      });
      
      console.log('Created test user with wallet');
      console.log(`User ID: ${testUser[0].id}`);
      console.log(`Wallet balance: $${wallet.balance}`);
    } else {
      console.log('Test user already exists');
    }
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
