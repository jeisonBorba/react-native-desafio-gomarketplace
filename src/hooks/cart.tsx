import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const APP_STORAGE = '@GoMarketplace:products';

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStoraged = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (productsStoraged) {
        setProducts(JSON.parse(productsStoraged));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productExistsIndex = products.findIndex(
        item => item.id === product.id,
      );

      if (productExistsIndex > -1) {
        products[productExistsIndex].quantity += 1;
        setProducts([...products]);
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem(
        APP_STORAGE,
        JSON.stringify([...products, { ...product, quantity: 1 }]),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productExistsIndex = products.findIndex(item => item.id === id);
      products[productExistsIndex].quantity += 1;

      setProducts([...products]);
      await AsyncStorage.setItem(APP_STORAGE, JSON.stringify([...products]));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productExistsIndex = products.findIndex(item => item.id === id);
      products[productExistsIndex].quantity -= 1;

      if (products[productExistsIndex].quantity === 0) {
        products.splice(productExistsIndex, 1);
      }

      setProducts([...products]);
      await AsyncStorage.setItem(APP_STORAGE, JSON.stringify([...products]));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
