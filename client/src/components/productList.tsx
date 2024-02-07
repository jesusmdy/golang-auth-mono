import { Product } from '@/api/products';
import useProducts from '@/hooks/useProducts';
import { FC } from 'react';

const ProductItem: FC<{ product: Product }> = ({ product }) => {

  const price = product.Price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });

  return (
    <li
      className="bg-white shadow-md p-4 rounded-md border flex flex-col"
    >
      <img
        src={product.Image}
        alt={product.Title}
        className="w-full h-48 object-contain p-2"
      />
      <h3 className="text-sm flex-1">{product.Title}</h3>
      <div className="flex mt-4">
        <p className="text-xs font-bold flex-1">{price}</p>
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded-md"
        >
          Add to cart
        </button>
      </div>
    </li>
  )
};

const ProductList: FC = () => {
  const { isLoading, products } = useProducts();
  return (
    <section>
      <h2 className="text-xl mb-4 font-semibold">Articles</h2>
      {
        isLoading ? (
          <p>Loading...</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {
              products.map((product) => (
                <ProductItem key={product.ID} product={product} />
              ))
            }
          </ul>
        )
      }
    </section>
  )
}

export default ProductList;