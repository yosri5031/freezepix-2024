import React from 'react';

const ProductList = ({ products, country }) => {
  return (
    <div className="w-1/3 p-4">
      <h2 className="text-xl font-semibold mb-4">
        {country === 'TUN' ? 'Nos Produits' : 'Our Products'}
      </h2>
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.id} className="flex items-center space-x-4">
            <img
              src={require(`../assets/products/${product.name}.jpg`)} // Use product.name for the image file
              alt={product.title}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <h3 className="text-sm font-semibold">{product.title}</h3>
              <p className="text-xs text-gray-500">{product.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;