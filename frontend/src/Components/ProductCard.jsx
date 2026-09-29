import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const { _id, name, price, category, image, stock } = product;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div className="h-52 w-full bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-contain p-4 transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300?text=No+Image';
            }}
          />
        </div>
        <div className="p-4 space-y-1.5">
          <span className="text-xs uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block">
            {category}
          </span>
          <h3 className="font-semibold text-gray-900 text-base line-clamp-1">{name}</h3>
          <p className="text-lg font-bold text-gray-900">₹{price?.toLocaleString('en-IN')}</p>
          <p className={`text-xs font-medium ${stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {stock > 0 ? `${stock} units left` : 'Out of stock'}
          </p>
        </div>
      </div>

      <div className="p-4 pt-0">
        <Link
          to={`/products/${_id}`}
          className="block w-full text-center py-2.5 px-4 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;