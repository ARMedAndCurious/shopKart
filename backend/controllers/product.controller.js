import mongoose from "mongoose";
import Product from "../modles/product.model.js";


export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      image,
      stock
    });

    const savedProduct = await newProduct.save();

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: savedProduct
    });
  } catch (error) {
    // Catch Mongoose schema validation errors (missing fields, invalid price, invalid stock)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }

    // Generic server error handling
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


export const getAllProducts = async (req, res) => {
  try {
    const { search, category } = req.query;

    // Dynamically construct the query object
    const filter = {};

    // Case-insensitive substring match on name
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    // Exact match for category
    if (category) {
      filter.category = category;
    }

    // Query database with dynamic filter and projected fields
    const products = await Product.find(filter).select('name price category image stock');

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id);

    // Check if the product exists
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

