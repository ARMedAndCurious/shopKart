import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {axiosInstance as api} from '../axiosCalls/axios';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.product);
      } catch (err) {
        setError('Something went wrong while loading products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-24 text-gray-500 font-medium">
        Loading products...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-24 space-y-4">
        <p className="text-red-600 font-medium">{error || 'Product not found.'}</p>
        <Link to="/products" className="text-indigo-600 underline text-sm">
          Return to products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <Link
        to="/products"
        className="inline-block text-sm text-gray-500 hover:text-gray-900 mb-6 font-medium"
      >
        ← Back to products
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10">
        {/* Large Product Image */}
        <div className="bg-gray-50 rounded-xl flex items-center justify-center p-6 border border-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-96 w-full object-contain"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/500?text=No+Image';
            }}
          />
        </div>

        {/* Details Content */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full inline-block">
              {product.category}
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900">{product.name}</h1>
            <p className="text-2xl font-bold text-gray-900">
              ₹{product.price?.toLocaleString('en-IN')}
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
            <p className="text-sm font-semibold text-gray-700">
              Stock available: <span className="text-gray-900">{product.stock} units</span>
            </p>
          </div>

          <button
            type="button"
            className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition shadow-sm"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;