// controllers/wishlist.controller.js
import mongoose from 'mongoose';
import Product from '../modles/product.model.js';
import User from '../modles/user.modle.js';

export const addToWishlist = async (req, res) => {
  try {
    // Step C: Get authenticated user (provided by Auth Middleware)
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const { productId } = req.params;

    // Step D: Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Step E: Find Product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find the user document
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Step F: Check if already wishlisted
    const isAlreadyWishlisted = user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (isAlreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // Step G: Add Product ObjectId
    user.wishlist.push(productId);

    // Step H: Save User
    await user.save();

    // Step I: Return Success
    return res.status(200).json({
      success: true,
      message: 'Product added to wishlist'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const getWishlist = async (req, res) => {
  try {
    // 1 & 2. Identify the user strictly from the authentication middleware
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // 3 & 4. Find the user and populate wishlist product details
    const user = await User.findById(userId).populate({
      path: 'wishlist',
      select: 'name price category image stock'
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 5. Return populated wishlist products with count
    const wishlistProducts = user.wishlist || [];

    return res.status(200).json({
      success: true,
      count: wishlistProducts.length,
      wishlist: wishlistProducts
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
      error: error.message
    });
  }
};

export const removeFromWishlist = async (req, res) => {
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

    // 3. Find current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 4. Check if product exists in user's wishlist
    const existsInWishlist = user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (!existsInWishlist) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist'
      });
    }

    // 5. Remove product reference & save
    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId
    );
    await user.save();

    // 6. Return success
    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};