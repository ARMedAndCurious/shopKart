
import express from 'express';
import { addToWishlist, getWishlist, removeFromWishlist } from '../controllers/wishlist.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const wishlistRouter = express.Router();


wishlistRouter.post('/:productId', isAuthenticated , addToWishlist);
wishlistRouter.get('/', isAuthenticated, getWishlist);
wishlistRouter.delete('/:productId', isAuthenticated, removeFromWishlist); 

export default wishlistRouter;