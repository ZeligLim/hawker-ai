import os
f1 = 'app/(customer)/profile/page.tsx'
with open(f1, 'r') as f:
    content = f.read()

s1 = "  const orderLinks = useMemo(\n    () =>\n      orders.map((order, index) => ({\n        id: `${order.id}-${index}`,\n        order,\n      })),\n    [orders],\n  );"
r1 = "  const [showAllOrders, setShowAllOrders] = useState(false);\n\n" + s1

content = content.replace(s1, r1)

s2 = "            {orderLinks.map(({ id, order }) => {\n              const orderHref = `/profile/order/${encodeURIComponent(id)}` as any;\n\n              return (\n                <Link\n                  key={id}\n                  href={orderHref}\n                  className=\"flex items-center justify-between gap-3 rounded-2xl bg-neutral-50 p-4 text-left shadow-xs hover:bg-neutral-100 \"\n                >\n                  <div>\n                    <p className=\"text-sm font-bold text-black\">{order.dish}</p>\n                    <p className=\"text-xs text-neutral-500 mt-0.5\">{order.place} • {order.date}</p>\n                  </div>\n                  <span className=\"text-sm font-bold text-black\">RM {order.price.toFixed(2)}</span>\n                </Link>\n              );\n            })}"
r2 = "            {(showAllOrders ? orderLinks : orderLinks.slice(0, 3)).map(({ id, order }) => {\n              const orderHref = `/profile/order/${encodeURIComponent(id)}` as any;\n\n              return (\n                <Link\n                  key={id}\n                  href={orderHref}\n                  className=\"flex items-center justify-between gap-3 rounded-2xl bg-neutral-50 p-4 text-left shadow-xs hover:bg-neutral-100 \"\n                >\n                  <div>\n                    <p className=\"text-sm font-bold text-black\">{order.dish}</p>\n                    <p className=\"text-xs text-neutral-500 mt-0.5\">{order.place} • {order.date}</p>\n                  </div>\n                  <span className=\"text-sm font-bold text-black\">RM {order.price.toFixed(2)}</span>\n                </Link>\n              );\n            })}\n            {!showAllOrders && orderLinks.length > 3 && (\n              <button\n                onClick={() => setShowAllOrders(true)}\n                className=\"w-full h-11 flex items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-black hover:bg-neutral-200 mt-3 shadow-xs\"\n              >\n                See older orders\n              </button>\n            )}"

content = content.replace(s2, r2)
with open(f1, 'w') as f:
    f.write(content)
