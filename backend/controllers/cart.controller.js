// controllers/cart.controller.js
import mongoose from 'mongoose';
import Product from '../modles/product.model.js';
import User from '../modles/user.modle.js';

export const addToCart = async (req, res) => {
  try {

    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const { productId } = req.params;


    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }


    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }


    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }


    if (!user.cart) {
      user.cart = [];
    }

    const itemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // Product exists -> Check if increasing quantity by 1 exceeds stock
      const targetQuantity = user.cart[itemIndex].quantity + 1;

      if (targetQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${product.stock} item(s) available in stock.`
        });
      }

      // Increase quantity
      user.cart[itemIndex].quantity = targetQuantity;
    } else {
      // Product not in cart -> Check if at least 1 is in stock
      if (product.stock < 1) {
        return res.status(400).json({
          success: false,
          message: 'Product is currently out of stock.'
        });
      }

      // Add product entry with quantity = 1
      user.cart.push({
        product: productId,
        quantity: 1
      });
    }

    // 6. Save User document
    await user.save();

    // 7. Populate cart details for the response
    await user.populate({
      path: 'cart.product',
      select: 'name price category image stock'
    });

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: user.cart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update cart',
      error: error.message
    });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // 2 & 3. Load user document and populate each cart item's product details
    const user = await User.findById(userId).populate({
      path: 'cart.product',
      select: 'name price image stock'
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      cart: user.cart || []
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: error.message
    });
  }
};

export const updateCartQuantity = async (req, res) => {
  try {
    // 1. Check authenticated user
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not logged in'
      });
    }

    const { productId } = req.params;
    const { quantity } = req.body;

    // 2. Validate Product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // 3. Validate quantity is a number and >= 1
    const numQuantity = Number(quantity);
    if (!Number.isInteger(numQuantity) || numQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a valid integer and at least 1'
      });
    }

    // 4. Find Product in database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // 5. Check if quantity exceeds available stock
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock (${product.stock})`
      });
    }

    // 6. Find User
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 7. Check if product already exists in user's cart
    const cartItemIndex = user.cart.findIndex(
      (item) => (item.product?._id || item.product)?.toString() === productId.toString()
    );

    if (cartItemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart'
      });
    }

    // 8. Update quantity and save
    user.cart[cartItemIndex].quantity = quantity;
    await user.save();

    // 9. Populate cart product details for response
    await user.populate({
      path: 'cart.product',
      select: 'name price image stock'
    });

    return res.status(200).json({
      success: true,
      message: 'Cart quantity updated',
      cart: user.cart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // 3. Find User
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const itemExists = user.cart.some(
      (item) => item.product.toString() === productId
    );

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart'
      });
    }

    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId
    );

    await user.save();

    // 6. Populate remaining cart items for response
    await user.populate({
      path: 'cart.product',
      select: 'name price image stock'
    });

    return res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      cart: user.cart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};