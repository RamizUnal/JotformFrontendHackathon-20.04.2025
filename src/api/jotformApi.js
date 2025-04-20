import axios from 'axios';

const API_KEY = '175a048985df96163070b1e962c14881';

//All store id's here, change however you want
const FORM_IDS = {
  store1: '251073755434962',
  store2: '251073519014954',
  store3: '251074174752961',
};

//Default store id, can just use an int
const CURRENT_STORE_ID = FORM_IDS.store3;

const BASE_URL = 'https://api.jotform.com';

// gets da payment info wit all da products n stuff
const fetchPaymentInfo = async (formId) => {
  try {
    const response = await axios.get(`${BASE_URL}/form/${formId}/payment-info?apiKey=${API_KEY}`);
    console.log(`Payment info for form ${formId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment info:', error);
    return { content: { products: [] } }; // return empty products instead of throwing
  }
};

//Store name to display in a chic way format idk
const fetchStoreDetails = async (formId) => {
  try {
    const response = await axios.get(`${BASE_URL}/form/${formId}?apiKey=${API_KEY}`);
    return response.data?.content?.title || 'Cool Store';
  } catch (error) {
    console.error('cant get store name lol:', error);
    return 'Cool Store';
  }
};

//Checking category id's

//TO-DO: MULTIPLE CATEGORIES for one item
const extractCategory = (productItem, categoryMap = {}) => {
  // first check for connected categories which is most common
  if (productItem.connectedCategories) {
    try {
      const categoryIds = JSON.parse(productItem.connectedCategories);
      if (Array.isArray(categoryIds) && categoryIds.length > 0) {
        const categoryId = categoryIds[0]; 
        if (categoryMap && categoryMap[categoryId]) {
            return categoryMap[categoryId];
        }
        return categoryId;
      }
    } catch (e) {
      console.warn('bruh dis json is weird:', e);
    }
  }

  if (productItem.cid) {
    const categoryId = productItem.cid;
    if (categoryMap && categoryMap[categoryId]) {
        return categoryMap[categoryId];
    }
    return categoryId;
  }
  
  //items can be categorized as no category
  if (productItem.category) return productItem.category;
  
  return 'Uncategorized';
};

//Checking price
const extractPrice = (productItem) => {


  //IMPORTANT
  //STORE 1 HAS SPECIAL PRICING, TO DO WE CAN IMPLEMENT DIFFERENT MONEY TYPES
  if (productItem.hasSpecialPricing === "1" || productItem.hasSpecialPricing === 1) {
    if (productItem.options && typeof productItem.options === 'string') {
      try {
        const options = JSON.parse(productItem.options);
        const specialPricingOption = options.find(opt => 
          opt.specialPricing === true || opt.specialPricing === "true"
        );
        
        if (specialPricingOption && specialPricingOption.specialPrices) {
          const specialPrices = specialPricingOption.specialPrices.split(',');
          if (specialPrices.length > 0) {
            const firstPrice = parseFloat(specialPrices[0]);
            if (!isNaN(firstPrice)) return firstPrice;
          }
        }
      } catch (e) {
        console.warn('special price json is wonky:', e);
      }
    }
  }
  
  //Price check
  if (productItem.price) {
    const price = parseFloat(productItem.price);
    if (!isNaN(price)) return price;
  }
  
  //fallback price
  return 0;
};

//extracts da image url from all da possible places
const extractImage = (productItem) => {
  if (productItem.images && typeof productItem.images === 'string') {
    try {
      const imagesArray = JSON.parse(productItem.images);
      if (Array.isArray(imagesArray) && imagesArray.length > 0 && 
          typeof imagesArray[0] === 'string' && imagesArray[0].startsWith('http')) {
        return imagesArray[0];
      }
    } catch (e) {
      console.warn('Error parsing image json:', e);
    }
  }

  //Checking image url
  if (productItem.image && productItem.image.startsWith('http')) return productItem.image;
  if (productItem.thumbnail && productItem.thumbnail.startsWith('http')) return productItem.thumbnail;

  //no image :(
  return '';
};

// Extract connected products with better error handling
const parseConnectedProducts = (connectedProductsStr) => {
  if (!connectedProductsStr) return [];
  
  try {
    // Handle both string and already parsed array
    if (typeof connectedProductsStr === 'string') {
      const parsed = JSON.parse(connectedProductsStr);
      console.log('Parsed connected products:', parsed);
      return Array.isArray(parsed) ? parsed : [];
    } else if (Array.isArray(connectedProductsStr)) {
      return connectedProductsStr;
    }
  } catch (error) {
    console.error('Error parsing connected products:', error, connectedProductsStr);
  }
  
  return [];
};

//da main function dat gets all products from current store
export const getStoreProducts = async () => {
  try {
    // get all da juice from da api
    const paymentResponse = await fetchPaymentInfo(CURRENT_STORE_ID);
    let storeName = await fetchStoreDetails(CURRENT_STORE_ID);
    
    if (paymentResponse?.responseCode === 200 && paymentResponse?.content) {
      const content = paymentResponse.content;
      const productData = content.products || [];
      

      //TODO: make a map of category ids to names
      let categoryMap = {};
      const apiCategories = content.categories;
      
      if (apiCategories) {
        //Handle diff formats of categories
        if (Array.isArray(apiCategories)) {
          apiCategories.forEach(cat => {
            if (cat && cat.id && cat.name) {
              categoryMap[cat.id] = cat.name;
            }
          });
        } else if (typeof apiCategories === 'object') {
          for (const catId in apiCategories) {
            if (apiCategories[catId]?.name) {
              categoryMap[catId] = apiCategories[catId].name;
            } else if (typeof apiCategories[catId] === 'string') {
              categoryMap[catId] = apiCategories[catId];
            }
          }
        }
      }
      
      //Turn raw product data into nice clean products
      if (productData && Object.keys(productData).length > 0) {
        const products = Object.keys(productData).map(key => {
          const item = productData[key];
          
          // Use pid as ID if available, otherwise fallback to key
          const productId = item.pid || key;
          
          return {
            id: productId,
            key: key, // Keep original key for reference
            name: item.name || 'Cool Product',
            price: extractPrice(item),
            description: item.description || '',
            image: extractImage(item),
            category: extractCategory(item, categoryMap),
            storeName: storeName,
            connectedProducts: parseConnectedProducts(item.connectedProducts)
          };
        });
        
        return products;
      }
    }
    
    return [];
  } catch (error) {
    console.error('everything broke lol:', error);
    return [];
  }
};

// Search cache to avoid redundant processing
const searchCache = new Map();

//Search for products by text 
export const searchProducts = (products, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') return products;
  
  const term = searchTerm.toLowerCase().trim();
  
  // Create a cache key based on the product array length and search term
  const cacheKey = `${products.length}:${term}`;
  
  // Return cached results if available
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }
  
  // Filter products that match the search term
  const results = products.filter(product => {
    if (!product) return false;
    
    // Check all text fields for matches
    return (
      (product.name && product.name.toString().toLowerCase().includes(term)) ||
      (product.description && product.description.toString().toLowerCase().includes(term)) ||
      (product.category && product.category.toString().toLowerCase().includes(term))
    );
  });
  
  // Cache the results for future searches
  searchCache.set(cacheKey, results);
  
  // Clear cache if it gets too large (prevent memory leaks)
  if (searchCache.size > 100) {
    const oldestKey = searchCache.keys().next().value;
    searchCache.delete(oldestKey);
  }
  
  return results;
};

//Filter products by category name
export const filterProductsByCategory = (products, category) => {
  if (!category || category === 'all' || category.trim() === '') return products;
  
  return products.filter(product => 
    product.category && product.category.toLowerCase() === category.toLowerCase()
  );
};

//Get list of unique categories for the filter buttons
export const getUniqueCategories = (products) => {
  const categories = new Set();
  products.forEach(product => {
    if (product.category) categories.add(product.category);
  });
  return Array.from(categories).sort();
};

//Search and filter togther in one go
export const searchAndFilterProducts = (products, searchTerm, category) => {
  const searchResults = searchProducts(products, searchTerm);
  return filterProductsByCategory(searchResults, category);
};

export { FORM_IDS, CURRENT_STORE_ID }; 

// Submit order to Jotform API
export const submitOrder = async (cartItems, customerInfo) => {
  try {
    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    // Validate required fields
    if (!customerInfo.fullName || !customerInfo.address) {
      throw new Error('Name and address are required');
    }

    // Calculate order total
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create submission data in the exact format Jotform expects
    const submissionData = {
      formId: CURRENT_STORE_ID,
      
      // Customer information - using field IDs exactly as Jotform expects
      'q121_fullName': customerInfo.fullName,
      'q122_typeA122': customerInfo.address,
    };

    // Format the selected products list
    const selectedProductsList = [];
    
    // Add each product in the cart
    cartItems.forEach(item => {
      // Add this product to the Jotform-expected format
      submissionData[`q59_myProducts[special_${item.id}][item_0]`] = item.quantity.toString();
      submissionData[`q59_myProducts[special_${item.id}][item_1]`] = item.name;
      submissionData[`q59_myProducts[][id]`] = item.id;
      
      // Add to the selected products summary
      const productEntry = {};
      productEntry[item.id] = {
        "0": {
          "customOptionValues": {"0": item.quantity.toString()},
          "quantity": item.quantity
        }
      };
      selectedProductsList.push(productEntry);
    });
    
    //Add products summary data
    submissionData.selectedProductsList = JSON.stringify(selectedProductsList);
    
    //Payment summary
    submissionData.paymentSummary = JSON.stringify({
      "shipping": "0.00",
      "shipping_discounted": "0.00",
      "subtotal_discounted": total.toFixed(2),
      "tax": "0.00",
      "tax_discounted": "0.00",
      "subtotal": total.toFixed(2),
      "total": total.toFixed(2),
      "discount": "0.00"
    });
    
    console.log('Submitting order data:', submissionData);

    // Submit the order to Jotform API
    const response = await axios.post(
      `${BASE_URL}/form/${CURRENT_STORE_ID}/submissions?apiKey=${API_KEY}`,
      submissionData
    );

    console.log('Jotform API response:', response.data);

    if (response.data && response.data.responseCode === 200) {
      return {
        success: true,
        orderId: response.data.content?.submissionID || 'JF' + Date.now(),
        message: 'Order submitted successfully!'
      };
    } else {
      throw new Error('Failed to submit order');
    }
  } catch (error) {
    console.error('Order submission error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while processing your order'
    };
  }
};

// Add a function to get a specific product by ID
export const getProductById = async (productId) => {
  if (!productId) return null;
  
  try {
    // Get all products first
    const allProducts = await getStoreProducts();
    
    // Convert product ID to string for consistent comparison
    const targetId = String(productId);
    
    // Find the product with matching ID
    // Check both the mapped id and the original key
    const product = allProducts.find(p => 
      String(p.id) === targetId || String(p.key) === targetId
    );
    
    console.log(`Looking for product ID ${targetId}, found:`, product);
    return product || null;
  } catch (error) {
    console.error(`Error fetching product ID ${productId}:`, error);
    return null;
  }
}; 