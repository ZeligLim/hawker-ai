import { useState } from 'react';
import { useCartItems, addItemToCart, type CartItem } from '@/lib/order/cart';

export function useCartAdd() {
  const { cartItems, setCartItems } = useCartItems();
  const [pendingDish, setPendingDish] = useState<Omit<CartItem, 'id' | 'quantity'> & { quantity?: number } | null>(null);

  const addDish = (dish: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => {
    const isDifferentCentre = cartItems.length > 0 && cartItems[0].restaurantName !== dish.restaurantName;
    
    if (isDifferentCentre) {
      setPendingDish(dish);
    } else {
      setCartItems((current) => addItemToCart(current, dish));
    }
  };

  const confirmClear = () => {
    if (pendingDish) {
      setCartItems(() => addItemToCart([], pendingDish));
      setPendingDish(null);
    }
  };

  const cancelClear = () => {
    setPendingDish(null);
  };

  const CartWarningModal = () => {
    if (!pendingDish) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4" role="presentation">
        <div role="dialog" aria-modal="true" className="w-full max-w-[360px] rounded-3xl bg-white p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-black">Start new order?</h2>
          <p className="mt-2 text-sm text-neutral-500">
            You already have items from <strong className="text-black">{cartItems[0]?.restaurantName}</strong> in your cart. 
            Adding an item from <strong className="text-black">{pendingDish.restaurantName}</strong> will clear your current cart.
          </p>
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={cancelClear}
              className="flex-1 h-11 rounded-full bg-neutral-100 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmClear}
              className="flex-1 h-11 rounded-full bg-black hover:bg-neutral-800 text-sm font-semibold text-white shadow-xs transition-colors"
            >
              Clear & Add
            </button>
          </div>
        </div>
      </div>
    );
  };

  return { addDish, CartWarningModal, cartItems, setCartItems };
}
