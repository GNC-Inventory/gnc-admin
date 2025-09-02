// netlify/functions/inventory.js
const fs = require('fs');

const INVENTORY_FILE = '/tmp/inventory.json';
const TRANSACTIONS_FILE = '/tmp/transactions.json';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

const loadData = (file) => {
  try {
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
  } catch { return []; }
};

const saveData = (file, data) => {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    return true;
  } catch { return false; }
};

const respond = (statusCode, data) => ({ statusCode, headers, body: JSON.stringify(data) });

const validateInventory = (inventory) => {
  if (!Array.isArray(inventory)) return 'Invalid inventory format';
  for (const item of inventory) {
    if (!item.id || !item.product || typeof item.unitCost !== 'number' || typeof item.stockLeft !== 'number') {
      return 'Invalid item format. Required: id, product, unitCost, stockLeft';
    }
  }
  return null;
};

const validateSale = (sale) => {
  if (!Array.isArray(sale.items) || !sale.customer) {
    return 'Invalid sale format. Required: items (array), customer (string)';
  }
  return null;
};

const getInventory = () => {
  const data = loadData(INVENTORY_FILE);
  return respond(200, {
    success: true,
    data,
    itemCount: data.length,
    timestamp: new Date().toISOString()
  });
};

const deleteProduct = (body) => {
  const { productId } = JSON.parse(body);
  
  if (!productId) {
    return respond(400, { success: false, error: 'Product ID is required' });
  }

  const inventory = loadData(INVENTORY_FILE);
  const productIndex = inventory.findIndex(item => item.id === productId);
  
  if (productIndex === -1) {
    return respond(404, { success: false, error: 'Product not found' });
  }

  const deletedProduct = inventory[productIndex];
  inventory.splice(productIndex, 1);
  
  const saved = saveData(INVENTORY_FILE, inventory);
  if (!saved) {
    return respond(500, { success: false, error: 'Failed to delete product' });
  }

  return respond(200, {
    success: true,
    message: 'Product deleted successfully',
    deletedProduct: deletedProduct.product,
    itemCount: inventory.length,
    timestamp: new Date().toISOString()
  });
};

const updateInventory = (body) => {
  const { inventory } = JSON.parse(body);
  const error = validateInventory(inventory);
  if (error) return respond(400, { success: false, error });

  const saved = saveData(INVENTORY_FILE, inventory);
  if (!saved) return respond(500, { success: false, error: 'Failed to save inventory' });

  return respond(200, {
    success: true,
    message: 'Inventory updated successfully',
    itemCount: inventory.length,
    timestamp: new Date().toISOString()
  });
};

const getTransactions = () => {
  const data = loadData(TRANSACTIONS_FILE);
  return respond(200, {
    success: true,
    data,
    count: data.length,
    timestamp: new Date().toISOString()
  });
};

const processSale = (body) => {
  const sale = JSON.parse(body);
  const error = validateSale(sale);
  if (error) return respond(400, { success: false, error });

  const inventory = loadData(INVENTORY_FILE);
  const transactions = loadData(TRANSACTIONS_FILE);
  
  // Check stock and prepare updates
  const stockErrors = [];
  const updatedInventory = [...inventory];
  const processedItems = [];
  let totalAmount = 0;

  for (const saleItem of sale.items) {
    const invItem = updatedInventory.find(item => 
      item.product === saleItem.name || item.id === saleItem.id
    );

    if (!invItem) {
      stockErrors.push(`Product "${saleItem.name}" not found`);
      continue;
    }

    if (invItem.stockLeft < saleItem.quantity) {
      stockErrors.push(`Insufficient stock for "${saleItem.name}". Available: ${invItem.stockLeft}, Requested: ${saleItem.quantity}`);
      continue;
    }

    // Process item
    invItem.stockLeft -= saleItem.quantity;
    const itemTotal = saleItem.price * saleItem.quantity;
    totalAmount += itemTotal;
    
    processedItems.push({
      id: invItem.id,
      name: saleItem.name,
      image: saleItem.image || invItem.image || '',
      price: saleItem.price,
      quantity: saleItem.quantity,
      total: itemTotal
    });
  }

  if (stockErrors.length > 0) {
    return respond(400, { success: false, error: 'Insufficient stock', details: stockErrors });
  }

  // Create transaction
  const transaction = {
    id: `A-${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    items: processedItems,
    customer: sale.customer,
    paymentMethod: sale.paymentMethod || 'Cash',
    total: totalAmount,
    createdAt: new Date().toISOString(),
    status: 'Successful'
  };

  // Save data
  const inventorySaved = saveData(INVENTORY_FILE, updatedInventory);
  const transactionSaved = saveData(TRANSACTIONS_FILE, [...transactions, transaction]);

  if (!inventorySaved || !transactionSaved) {
    return respond(500, { success: false, error: 'Failed to save transaction data' });
  }

  return respond(200, {
    success: true,
    message: 'Sale completed successfully',
    transaction,
    inventoryUpdated: true,
    timestamp: new Date().toISOString()
  });
};

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') return respond(200, {});

  try {
    const isTransactionRoute = event.path?.includes('/transactions');
    
    if (isTransactionRoute) {
      if (event.httpMethod === 'GET') return getTransactions();
      if (event.httpMethod === 'POST') return processSale(event.body);
    } else {
      if (event.httpMethod === 'GET') return getInventory();
      if (['POST', 'PUT'].includes(event.httpMethod)) return updateInventory(event.body);
      if (event.httpMethod === 'DELETE') return deleteProduct(event.body);
    }
    
    return respond(405, { success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Function error:', error);
    return respond(500, { success: false, error: error.message });
  }
};