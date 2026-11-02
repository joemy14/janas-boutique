# Normalization notes

These notes assess the table definitions in `database/schema.sql`. The tables use single-column surrogate primary keys except for additional unique constraints noted below. The assessment concerns the declared relational structure; it does not claim that all possible application-level business rules are enforced by the DDL.

## `users`

- **1NF:** Yes. Each column stores one value; role and active state are scalar values.
- **2NF:** Yes. Every non-key attribute depends on the single-column `user_id` key; `email` is also constrained to be unique.
- **3NF:** Yes. The table does not store attributes of another entity, and no non-key column is declared as determining another non-key column.

## `password_resets`

- **1NF:** Yes. Each reset record stores scalar identifiers, a token hash, expiration, and optional use time.
- **2NF:** Yes. The primary key `reset_id` is a single column, so non-key columns cannot depend on part of it.
- **3NF:** Yes. Reset attributes describe the reset record; user attributes are kept in `users` and reached through `user_id`.

## `categories`

- **1NF:** Yes. Each category row stores one category name.
- **2NF:** Yes. `name` depends on the single-column `category_id` key and is independently unique.
- **3NF:** Yes. There are no other non-key attributes that determine one another.

## `products`

- **1NF:** Yes. Product attributes are stored in individual scalar columns; the description and image path are each one column value.
- **2NF:** Yes. Product attributes depend on the single-column `product_id` key.
- **3NF:** Yes. Category details are not copied into this table; `category_id` references `categories` instead.

## `product_sizes`

- **1NF:** Yes. Each row represents one product and one enum size with scalar stock and reorder values.
- **2NF:** Yes. The primary key is `product_size_id`. The additional unique key `(product_id, size)` identifies each product-size combination; `stock_quantity` and `reorder_level` describe that whole combination, not only one part of it.
- **3NF:** Yes. Product attributes are stored in `products`; this table stores the product reference, size, and size-specific inventory values.

## `orders`

- **1NF:** Yes. Each order's channel, status, amounts, and references occupy scalar columns.
- **2NF:** Yes. Order attributes depend on the single-column `order_id` key.
- **3NF:** Yes, within the order row: customer and creator identifiers reference `users`, without copying their names or email. `total_amount` is a deliberate derived summary of order items and is denormalized across the order and item data; the schema's after-insert trigger recalculates it using `fn_order_total`.

## `order_items`

- **1NF:** Yes. Each row represents one product-size line and stores one quantity and unit price.
- **2NF:** Yes. The primary key `order_item_id` is a single column.
- **3NF:** Yes. Product and size details are referenced through `product_size_id` instead of repeated in the item row. `unit_price` is intentionally stored as a purchase-time price snapshot: the before-insert trigger copies the active product's current price so later product price changes do not replace the line's recorded price.

## `payments`

- **1NF:** Yes. Each row contains scalar payment method, amount, status, and optional provider/reference/time values.
- **2NF:** Yes. Payment attributes depend on the single-column `payment_id` key.
- **3NF:** Yes. Order details are referenced by `order_id` rather than copied into the payment row. The payment `amount` is stored with the payment as its recorded amount; the schema does not enforce equality with `orders.total_amount`.

## `stock_movements`

- **1NF:** Yes. Each row records one product-size quantity change, reason, optional related order/user, and timestamp.
- **2NF:** Yes. Movement attributes depend on the single-column `movement_id` key.
- **3NF:** Yes. Product-size, order, and user details are represented by foreign keys instead of copied descriptive attributes. `product_sizes.stock_quantity` is the current inventory state, while movement rows record changes over time; retaining both current state and movement history is an intentional operational design.

## `feedback`

- **1NF:** Yes. Each row contains one message, one user reference, and an optional order reference.
- **2NF:** Yes. Feedback attributes depend on the single-column `feedback_id` key.
- **3NF:** Yes. User and order descriptions are not duplicated in the feedback row; their identifiers reference their respective tables.

## Intentional stored values

The schema stores `order_items.unit_price` as a purchase-time snapshot, `orders.total_amount` as an order-level summary, `payments.amount` as the amount recorded for a payment, and `product_sizes.stock_quantity` alongside the stock-movement audit history. These values support historical order/payment records, efficient order summaries, and current inventory reads. The triggers keep item prices tied to the product price at insertion and recalculate the order total after each item insert; the schema does not define a trigger that recalculates totals after arbitrary item updates or deletions.
