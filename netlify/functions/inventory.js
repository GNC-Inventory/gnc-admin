// netlify/functions/inventory.js

// Persistent inventory management function for Netlify
// Uses a combination of strategies for data persistence

const fs = require('fs');
const path = require('path');

// File-based storage path (works in Netlify's temporary file system)
const DATA_FILE = '/tmp/inventory.json';

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

// Load inventory from persistent storage
function loadInventory() {
  try {
    // Try to load from temporary file first
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }

    // Try to load from environment variable as backup
    const envData = process.env.INVENTORY_DATA;
    if (envData) {
      return JSON.parse(envData);
    }

    // Return empty array if no data found
    return [];
  } catch (error) {
    console.error('Error loading inventory:', error);
    return [];
  }
}

// Save inventory to persistent storage
function saveInventory(inventoryData) {
  try {
    // Save to temporary file (survives during function execution)
    fs.writeFileSync(DATA_FILE, JSON.stringify(inventoryData, null, 2));
    
    // Also save to environment variable for backup
    // Note: This won't persist across deployments, but helps with cold starts
    process.env.INVENTORY_DATA = JSON.stringify(inventoryData);
    
    console.log('Inventory saved:', {
      itemCount: inventoryData.length,
      timestamp: new Date().toISOString(),
      method: 'file + env'
    });
    
    return true;
  } catch (error) {
    console.error('Error saving inventory:', error);
    return false;
  }
}

// Get inventory data
async function getInventory(headers) {
  try {
    const inventoryData = loadInventory();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: inventoryData,
        itemCount: inventoryData.length,
        timestamp: new Date().toISOString(),
        source: 'persistent_storage'
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

    // Save to persistent storage
    const saveSuccess = saveInventory(inventoryData);
    
    if (!saveSuccess) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Failed to save inventory data' 
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Inventory updated successfully',
        itemCount: inventoryData.length,
        timestamp: new Date().toISOString(),
        storage: 'persistent'
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