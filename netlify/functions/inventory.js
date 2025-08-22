// netlify/functions/inventory.js

// Simple inventory management function for Netlify
// Stores data temporarily in memory during function execution

// In-memory storage (resets on cold starts)
let inventoryStore = [];

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    switch (event.httpMethod) {
      case 'GET':
        return await getInventory(headers);
      
      case 'POST':
        return await updateInventory(event, headers);
      
      case 'PUT':
        return await updateInventory(event, headers);
        
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ 
            success: false, 
            error: 'Method not allowed' 
          })
        };
    }
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: error.message 
      })
    };
  }
};

// Get inventory data
async function getInventory(headers) {
  try {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: inventoryStore,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Get inventory error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Failed to retrieve inventory data' 
      })
    };
  }
}

// Update inventory data
async function updateInventory(event, headers) {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Request body is required' 
        })
      };
    }

    const requestData = JSON.parse(event.body);
    
    // Validate the inventory data structure
    if (!requestData.inventory || !Array.isArray(requestData.inventory)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Invalid inventory data format. Expected { inventory: [] }' 
        })
      };
    }

    const inventoryData = requestData.inventory;

    // Validate each inventory item
    for (const item of inventoryData) {
      if (!item.id || !item.product || typeof item.unitCost !== 'number' || typeof item.stockLeft !== 'number') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false, 
            error: 'Invalid inventory item format. Each item must have id, product, unitCost, and stockLeft' 
          })
        };
      }
    }

    // Update the in-memory store
    inventoryStore = [...inventoryData];

    console.log('Inventory updated:', {
      itemCount: inventoryStore.length,
      timestamp: new Date().toISOString()
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Inventory updated successfully',
        itemCount: inventoryStore.length,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Update inventory error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Failed to update inventory data' 
      })
    };
  }
}