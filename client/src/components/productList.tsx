import useProducts from '@/hooks/useProducts';
import { FC } from 'react';
import ProductItem from './productItem';

const ProductList: FC = () => {
  const { isLoading, products } = useProducts();
  return (
    <section>
      <h2 className="text-xl mb-4 font-semibold">Articles</h2>
      {
        isLoading ? (
          <p>Loading...</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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