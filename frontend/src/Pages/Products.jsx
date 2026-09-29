import { useState, useEffect } from 'react';
import {axiosInstance as api} from '../axiosCalls/axios.js';
import ProductCard from '../Components/ProductCard';
import SearchBar from '../Components/SearchBar';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (category) params.category = category;

        const response = await api.get('/products', { params });
        setProducts(response.data.products || []);
      } catch (err) {
        setError('Something went wrong while loading products.');
      } finally {
        setLoading(false);
      }
    };

    // Debounce network request while typing in search bar
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, category]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Catalog</h1>
      </div>

      <SearchBar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
      />

      {/* Loading State */}
      {loading && (
        <div className="text-center py-20 text-gray-500 font-medium">
          Loading products...
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="text-center py-20 text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-20 text-gray-500 font-medium">
          No products found.
        </div>
      )}

      {/* Product Grid */}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;