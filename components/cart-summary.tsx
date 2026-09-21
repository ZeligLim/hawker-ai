import type { CartItem } from '@/lib/order/cart';

export function CartSummary({
 items,
 subtotal,
 serviceFee,
 total,
 feeLabel,
 onUpdateQuantity,
 onRemoveItem,
 onCheckout,
}: {
 items: CartItem[];
 subtotal: number;
 serviceFee: number;
 total: number;
 feeLabel?: string;
 onUpdateQuantity: (itemId: string, quantity: number) => void;
 onRemoveItem: (itemId: string) => void;
 onCheckout: () => void;
}) {
 if (items.length === 0) {
 return (
 <aside className="rounded-[30px] ] bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
 <p className="text-xs font-semibold text-[#86868b]">Your order</p>
 <p className="mt-3 text-base text-[#1d1d1f]">No dishes added yet. Search for something delicious to begin.</p>
 </aside>
 );
 }

 const groupedItems = items.reduce<Record<string, { label: string; items: CartItem[] }>>((groups, item) => {
 const key = item.stallId;
 if (!groups[key]) {
 groups[key] = { label: item.stallName, items: [] };
 }
 groups[key].items.push(item);
 return groups;
 }, {});

 return (
 <aside className="rounded-[30px] ] bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
 <div className="flex items-center justify-between gap-3">
 <p className="text-xs font-semibold text-[#86868b]">Your order</p>
 <span className="rounded-full bg-[#f5f5f7] px-2 py-1 text-xs font-medium text-[#1d1d1f]">{items.length} items</span>
 </div>

 <div className="mt-4 space-y-5">
 {Object.values(groupedItems).map((group) => (
 <div key={group.label} className="rounded-[22px] bg-[#f7f7f7] p-3">
 <p className="text-xs font-semibold text-[#86868b]">{group.label}</p>
 <div className="mt-3 space-y-3">
 {group.items.map((item) => (
 <div key={item.id} className="flex items-start justify-between gap-3">
 <div className="min-w-0 flex-1">
 <p className="font-medium text-[#1d1d1f] truncate">{item.name}</p>
 <p className="text-xs text-[#6e6e73]">RM {item.price.toFixed(2)} each</p>
 </div>
 <div className="flex items-center gap-2 shrink-0">
 <button
 type="button"
 onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
 className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f2f2f7] hover:bg-[#e5e5ea] text-base font-semibold text-[#1d1d1f] active:scale-95 shrink-0"
 aria-label={`Decrease quantity for ${item.name}`}
 >
 −
 </button>
 <span className="min-w-5 text-center text-sm font-semibold text-[#1d1d1f]">{item.quantity}</span>
 <button
 type="button"
 onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
 className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1d1d1f] hover:bg-black text-base font-semibold text-white shadow-xs active:scale-95 shrink-0"
 aria-label={`Increase quantity for ${item.name}`}
 >
 +
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>

 <div className="mt-5 space-y-2 ] pt-4 text-sm text-[#3c3c43]">
 <div className="flex items-center justify-between">
 <span>Subtotal</span>
 <span>RM {subtotal.toFixed(2)}</span>
 </div>
 <div className="flex items-center justify-between">
 <span>{feeLabel ?? 'Service fee'}</span>
 <span>RM {serviceFee.toFixed(2)}</span>
 </div>
 <div className="flex items-center justify-between text-base font-semibold text-[#1d1d1f]">
 <span>Total</span>
 <span>RM {total.toFixed(2)}</span>
 </div>
 </div>

 <button
 type="button"
 onClick={onCheckout}
 className="mt-5 flex h-11 w-full items-center justify-center rounded-full bg-[#007aff] hover:bg-[#0071e3] px-5 text-sm font-semibold text-white shadow-xs active:scale-[0.98]"
 >
 Pay RM {total.toFixed(2)}
 </button>
 </aside>
 );
}
