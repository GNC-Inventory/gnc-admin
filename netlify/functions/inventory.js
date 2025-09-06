// netlify/functions/inventory.js
const BACKEND_URL = process.env.BACKEND_URL || 'https://gnc-inventory-backend.onrender.com';
const API_KEY = process.env.INTERNAL_API_KEY;

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

const respond = (statusCode, data) => ({ statusCode, headers, body: JSON.stringify(data) });

// Helper function to make API calls to backend
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Data transformation functions
const mapFromBackend = (backendItem) => ({
  id: backendItem.id.toString(),
  product: backendItem.name || backendItem.product_name,
  category: backendItem.category || backendItem.category_name,
  image: backendItem.image_url || backendItem.image || '/products/default.png',
  unitCost: backendItem.unit_cost || backendItem.unitCost,
  basePrice: backendItem.base_price || backendItem.basePrice,
  stockLeft: backendItem.stock_quantity || backendItem.stockLeft || backendItem.quantity,
  dateAdded: backendItem.created_at || backendItem.dateAdded || new Date().toISOString(),
  amount: (backendItem.base_price || backendItem.basePrice) * (backendItem.stock_quantity || backendItem.stockLeft || 0)
});

const mapToBackend = (frontendItem) => ({
  name: frontendItem.product,
  category: frontendItem.category,
  image_url: frontendItem.image,
  unit_cost: frontendItem.unitCost,
  base_price: frontendItem.basePrice,
  stock_quantity: frontendItem.stockLeft
});

const getInventory = async () => {
  try {
    const result = await apiCall('/admin/inventory');
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to fetch inventory');
    }

    const transformedData = result.data.map(mapFromBackend);

    return respond(200, {
      success: true,
      data: transformedData,
      itemCount: transformedData.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    return respond(500, {
      success: false,
      error: 'Failed to fetch inventory from backend',
      details: error.message
    });
  }
};

const deleteProduct = async (body) => {
  try {
    const { productId } = JSON.parse(body);
    
    if (!productId) {
      return respond(400, { success: false, error: 'Product ID is required' });
    }

    const result = await apiCall(`/admin/inventory/${productId}`, {
      method: 'DELETE'
    });

    if (!result.success) {
      return respond(404, { success: false, error: 'Product not found' });
    }

    // Get updated inventory count
    const inventoryResult = await apiCall('/admin/inventory');
    const itemCount = inventoryResult.success ? inventoryResult.data.length : 0;

    return respond(200, {
      success: true,
      message: 'Product deleted successfully',
      deletedProduct: `Product ID: ${productId}`,
      itemCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return respond(500, {
      success: false,
      error: 'Failed to delete product',
      details: error.message
    });
  }
};

// Stock modification (deduct/restore)
const modifyInventory = async (body) => {
  try {
    const { productId, action, quantity } = JSON.parse(body);
    
    if (!productId || !action || typeof quantity !== 'number') {
      return respond(400, { success: false, error: 'Required: productId, action (deduct/restore), quantity' });
    }

    if (!['deduct', 'restore'].includes(action)) {
      return respond(400, { success: false, error: 'Action must be either "deduct" or "restore"' });
    }

    if (quantity <= 0) {
      return respond(400, { success: false, error: 'Quantity must be greater than 0' });
    }

    // Get current product data
    const productResult = await apiCall(`/admin/inventory/${productId}`);
    
    if (!productResult.success) {
      return respond(404, { success: false, error: 'Product not found' });
    }

    const product = productResult.data;
    const currentStock = product.stock_quantity || product.stockLeft || 0;
    let newStock;

    if (action === 'deduct') {
      if (currentStock < quantity) {
        return respond(400, { 
          success: false, 
          error: `Insufficient stock for "${product.name}". Only ${currentStock} available, requested ${quantity}`,
          availableStock: currentStock
        });
      }
      newStock = currentStock - quantity;
    } else {
      newStock = currentStock + quantity;
    }

    // Update stock in backend
    const updateResult = await apiCall(`/admin/inventory/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...product,
        stock_quantity: newStock
      })
    });

    if (!updateResult.success) {
      throw new Error(updateResult.error?.message || 'Failed to update stock');
    }

    const updatedProduct = mapFromBackend(updateResult.data);

    return respond(200, {
      success: true,
      message: `Successfully ${action}ed ${quantity} units for "${updatedProduct.product}"`,
      data: updatedProduct,
      action,
      quantity,
      newStockLeft: newStock,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Modify inventory error:', error);
    return respond(500, {
      success: false,
      error: 'Failed to modify inventory',
      details: error.message
    });
  }
};

const updateInventory = async (body) => {
  try {
    const { inventory } = JSON.parse(body);
    
    if (!Array.isArray(inventory)) {
      return respond(400, { success: false, error: 'Invalid inventory format' });
    }

    // Process each item in the inventory
    const results = [];
    for (const item of inventory) {
      try {
        const backendItem = mapToBackend(item);
        
        if (item.id && item.id !== 'new') {
          // Update existing item
          const result = await apiCall(`/admin/inventory/${item.id}`, {
            method: 'PUT',
            body: JSON.stringify(backendItem)
          });
          results.push(result);
        } else {
          // Create new item
          const result = await apiCall('/admin/inventory', {
            method: 'POST',
            body: JSON.stringify(backendItem)
          });
          results.push(result);
        }
      } catch (error) {
        console.error(`Failed to process item ${item.product}:`, error);
        // Continue processing other items
      }
    }

    return respond(200, {
      success: true,
      message: 'Inventory updated successfully',
      itemCount: results.length,
      processed: results.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    return respond(500, {
      success: false,
      error: 'Failed to update inventory',
      details: error.message
    });
  }
};

// Transaction handling - could be extended to use backend in the future
const getTransactions = () => {
  // For now, return empty array since transactions might be handled differently in your backend
  return respond(200, {
    success: true,
    data: [],
    count: 0,
    message: 'Transaction handling via backend not yet implemented',
    timestamp: new Date().toISOString()
  });
};

const processSale = async (body) => {
  try {
    // For now, return success but don't process through backend
    // This can be extended later to integrate with your backend's transaction system
    const sale = JSON.parse(body);
    
    return respond(200, {
      success: true,
      message: 'Sale processing via backend not yet implemented',
      transaction: {
        id: `A-${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        ...sale,
        status: 'Pending Backend Integration',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return respond(500, {
      success: false,
      error: 'Failed to process sale',
      details: error.message
    });
  }
};

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return respond(200, {});
  }

  try {
    // Check if required environment variables are configured
    if (!API_KEY) {
      console.error('INTERNAL_API_KEY environment variable not set');
      return respond(500, {
        success: false,
        error: 'Server configuration error: Missing API key'
      });
    }

    if (!BACKEND_URL) {
      console.error('BACKEND_URL environment variable not set');
      return respond(500, {
        success: false,
        error: 'Server configuration error: Missing backend URL'
      });
    }

    const isTransactionRoute = event.path?.includes('/transactions');
    
    if (isTransactionRoute) {
      if (event.httpMethod === 'GET') return getTransactions();
      if (event.httpMethod === 'POST') return await processSale(event.body);
    } else {
      if (event.httpMethod === 'GET') return await getInventory();
      if (event.httpMethod === 'POST') return await updateInventory(event.body);
      if (event.httpMethod === 'PUT') {
        // Check if this is a inventory modification request (deduct/restore)
        const bodyData = JSON.parse(event.body);
        if (bodyData.action && ['deduct', 'restore'].includes(bodyData.action)) {
          return await modifyInventory(event.body);
        } else {
          // Original PUT behavior for full inventory update
          return await updateInventory(event.body);
        }
      }
      if (event.httpMethod === 'DELETE') return await deleteProduct(event.body);
    }
    
    return respond(405, { success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Function error:', error);
    return respond(500, { 
      success: false, 
      error: 'Internal server error',
      details: error.message 
    });
  }
};