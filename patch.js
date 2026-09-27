const fs = require('fs');
const file = 'app/(customer)/profile/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const s1 = `  const orderLinks = useMemo(
    () =>
      orders.map((order, index) => ({
        id: \`\${order.id}-\${index}\`,
        order,
      })),
    [orders],
  );`;

const r1 = `  const [showAllOrders, setShowAllOrders] = useState(false);

  const orderLinks = useMemo(
    () =>
      orders.map((order, index) => ({
        id: \`\${order.id}-\${index}\`,
        order,
      })),
    [orders],
  );`;

content = content.replace(s1, r1);

const s2 = `            {orderLinks.map(({ id, order }) => {
              const orderHref = \`/profile/order/\${encodeURIComponent(id)}\` as any;

              return (
                <Link
                  key={id}
                  href={orderHref}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-neutral-50 p-4 text-left shadow-xs hover:bg-neutral-100 "
                >
                  <div>
                    <p className="text-sm font-bold text-black">{order.dish}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{order.place} • {order.date}</p>
                  </div>
                  <span className="text-sm font-bold text-black">RM {order.price.toFixed(2)}</span>
                </Link>
              );
            })}
          </div>
        )}
      </section>`;

const r2 = `            {(showAllOrders ? orderLinks : orderLinks.slice(0, 3)).map(({ id, order }) => {
              const orderHref = \`/profile/order/\${encodeURIComponent(id)}\` as any;

              return (
                <Link
                  key={id}
                  href={orderHref}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-neutral-50 p-4 text-left shadow-xs hover:bg-neutral-100 "
                >
                  <div>
                    <p className="text-sm font-bold text-black">{order.dish}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{order.place} • {order.date}</p>
                  </div>
                  <span className="text-sm font-bold text-black">RM {order.price.toFixed(2)}</span>
                </Link>
              );
            })}
            
            {!showAllOrders && orderLinks.length > 3 && (
              <button
                onClick={() => setShowAllOrders(true)}
                className="w-full h-11 flex items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-black hover:bg-neutral-200 mt-3 shadow-xs"
              >
                See older orders
              </button>
            )}
          </div>
        )}
      </section>`;

content = content.replace(s2, r2);

fs.writeFileSync(file, content);
console.log("Successfully replaced both manually");
