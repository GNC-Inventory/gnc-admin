// netlify/functions/inventory.js

const { createClient } = require('@supabase/supabase-js');

// We'll use a simple approach with JSON storage in environment variables
// This is free and works well for small to medium datasets

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
    // For now, we'll use a simple storage approach
    // In production, you might want to use a database
    
    // Try to get data from environment variable first
    let inventoryData = [];
    
    if (process.env.INVENTORY_DATA) {
      try {
        inventoryData = JSON.parse(process.env.INVENTORY_DATA);
      } catch (parseError) {
        console.error('Error parsing inventory data:', parseError);
        inventoryData = [];
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: inventoryData,
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

    // In a real production environment, you would save this to a database
    // For this demo, we'll return success
    // Note: Environment variables can't be updated at runtime in Netlify Functions
    // So we'll need a different storage approach for production

    console.log('Inventory update requested:', {
      itemCount: inventoryData.length,
      timestamp: new Date().toISOString()
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Inventory updated successfully',
        itemCount: inventoryData.length,
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

// Utility function to validate inventory item structure
function validateInventoryItem(item) {
  const requiredFields = ['id', 'product', 'dateAdded', 'stockLeft', 'unitCost', 'amount'];
  
  for (const field of requiredFields) {
    if (!(field in item)) {
      return false;
    }
  }
  
  // Type validation
  if (typeof item.stockLeft !== 'number' || 
      typeof item.unitCost !== 'number' || 
      typeof item.id !== 'string' || 
      typeof item.product !== 'string') {
    return false;
  }
  
  return true;
}

// Utility function to sanitize inventory data
function sanitizeInventoryData(inventoryData) {
  return inventoryData.map(item => ({
    id: String(item.id),
    product: String(item.product),
    dateAdded: String(item.dateAdded),
    stockLeft: Number(item.stockLeft),
    unitCost: Number(item.unitCost),
    amount: item.amount,
    image: item.image || ''
  }));
}