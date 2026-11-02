# Query optimization with the schema indexes

The schema defines three named indexes:

- `idx_orders_user` on `orders(user_id)` helps locate orders belonging to one user. It supports equality or range predicates on `user_id`; because `created_at` is not part of this index, it does not by itself provide the requested date ordering.
- `idx_order_items_order` on `order_items(order_id)` helps retrieve the items belonging to a specific order and supports joins from an order to its items.
- `idx_products_category` on `products(category_id)` helps locate products in a category and supports joins between `products` and `categories` on `category_id`.

MySQL can choose a different plan based on table size and statistics. Use `EXPLAIN` to inspect the plan; the examples below are not claims about a plan on a particular database.

## 1. A user's order history ordered by date

```sql
EXPLAIN
SELECT order_id, created_at, status, total_amount
FROM orders
WHERE user_id = 42
ORDER BY created_at DESC;
```

Look for `idx_orders_user` in the `key` column and an access type such as `ref` for the equality filter. The separate `ORDER BY created_at` may require a filesort (`Using filesort` in `Extra`), because `idx_orders_user` does not include `created_at`. A full table scan (`type = ALL`) can still be chosen when the optimizer estimates it is cheaper, particularly for a small table.

## 2. Low-stock products through `v_low_stock`

```sql
EXPLAIN
SELECT product, size, stock_quantity, reorder_level
FROM v_low_stock
WHERE stock_quantity <= reorder_level;
```

`v_low_stock` joins `product_sizes` to `products` by `product_id` and filters by the comparison between `stock_quantity` and `reorder_level`. The named `idx_products_category` is not involved in this join. The schema defines no named index on either stock column; expect the plan to inspect `product_sizes` rows (often `type = ALL`) and then look up matching products using their primary key. Because this is a view, `EXPLAIN` reports the underlying table operations rather than a separate stored view index.

## 3. Top products by revenue through `order_items`

This example counts revenue from all order items, using the price recorded on each item and the associated product size to identify the product.

```sql
EXPLAIN
SELECT p.product_id,
       p.name,
       SUM(oi.quantity * oi.unit_price) AS revenue
FROM order_items AS oi
JOIN product_sizes AS ps ON ps.product_size_id = oi.product_size_id
JOIN products AS p ON p.product_id = ps.product_id
GROUP BY p.product_id, p.name
ORDER BY revenue DESC
LIMIT 10;
```

Inspect the join access types and `key` columns. The primary keys can be used to look up each referenced product size and product. `idx_order_items_order` is for filtering or joining items by `order_id`; this query has no such condition, so it generally cannot avoid scanning the order items needed for the aggregate. The plan may report temporary grouping or sorting work (for example, `Using temporary` or `Using filesort`); the aggregate revenue is calculated before the top ten can be selected.
