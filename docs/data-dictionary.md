# Data dictionary

This dictionary follows `database/schema.sql`. “None specified” means the DDL does not declare an explicit default. Nullable fields without an explicit default have an implicit `NULL` default in MySQL/MariaDB.

## `users`

| Column | Type | Nullable | Default | Key | Notes |
|---|---|---:|---|---|---|
| `user_id` | `INT UNSIGNED` | No | Auto-increment | PK | User identifier. |
| `first_name` | `VARCHAR(50)` | No | None specified | — | First name. |
| `last_name` | `VARCHAR(50)` | No | None specified | — | Last name. |
| `email` | `VARCHAR(120)` | No | None specified | UNIQUE | Email address. |
| `phone` | `VARCHAR(20)` | Yes | `NULL` (implicit) | — | Phone number. |
| `address` | `VARCHAR(255)` | Yes | `NULL` (implicit) | — | Address. |
| `password_hash` | `VARCHAR(255)` | No | None specified | — | Password hash. |
| `role` | `ENUM('customer','admin','staff')` | No | `'customer'` | — | Role value is restricted to the listed enum values. |
| `is_active` | `TINYINT(1)` | No | `1` | — | Active-state flag. |
| `created_at` | `TIMESTAMP` | No | `CURRENT_TIMESTAMP` | — | Row creation timestamp. |

## `password_resets`

| Column | Type | Nullable | Default | Key | Notes |
|---|---|---:|---|---|---|
| `reset_id` | `INT UNSIGNED` | No | Auto-increment | PK | Reset-request identifier. |
| `user_id` | `INT UNSIGNED` | No | None specified | FK | References `users.user_id`; deleting the user cascades to this row. |
| `token_hash` | `VARCHAR(255)` | No | None specified | — | Stored reset-token hash. |
| `expires_at` | `DATETIME` | No | None specified | — | Reset expiration time. |
| `used_at` | `DATETIME` | Yes | `NULL` (implicit) | — | Time the reset was used, if any. |

## `categories`

| Column | Type | Nullable | Default | Key | Notes |
|---|---|---:|---|---|---|
| `category_id` | `INT UNSIGNED` | No | Auto-increment | PK | Category identifier. |
| `name` | `VARCHAR(50)` | No | None specified | UNIQUE | Category name. |

## `products`

| Column | Type | Nullable | Default | Key | Notes |
|---|---|---:|---|---|---|
| `product_id` | `INT UNSIGNED` | No | Auto-increment | PK | Product identifier. |
| `category_id` | `INT UNSIGNED` | No | None specified | FK; indexed by `idx_products_category` | References `categories.category_id`. |
| `name` | `VARCHAR(120)` | No | None specified | — | Product name. |
| `description` | `TEXT` | Yes | `NULL` (implicit) | — | Product description. |
| `price` | `DECIMAL(10,2)` | No | None specified | — | Product price; check constraint requires a value greater than or equal to zero. |
| `image_path` | `VARCHAR(255)` | Yes | `NULL` (implicit) | — | Image path. |
| `is_active` | `TINYINT(1)` | No | `1` | — | Active-state flag. |
| `created_at` | `TIMESTAMP` | No | `CURRENT_TIMESTAMP` | — | Row creation timestamp. |

## `product_sizes`

| Column | Type | Nullable | Default | Key | Notes |
|---|---|---:|---|---|---|
| `product_size_id` | `INT UNSIGNED` | No | Auto-increment | PK | Product-size row identifier. |
| `product_id` | `INT UNSIGNED` | No | None specified | FK; part of UNIQUE (`product_id`, `size`) | References `products.product_id`; deleting the product cascades to these rows. |
| `size` | `ENUM('S','M','L','XL','ONE')` | No | None specified | Part of UNIQUE (`product_id`, `size`) | Size value. |
| `stock_quantity` | `INT` | No | `0` | — | Check constraint requires a value greater than or equal to zero. |
| `reorder_level` | `INT` | No | `5` | — | Reorder threshold used by `v_low_stock`. |

## `orders`

| Column | Type | Nullable | Default | Key | Notes |
|---|---|---:|---|---|---|
| `order_id` | `INT UNSIGNED` | No | Auto-increment | PK | Order identifier. |
| `user_id` | `INT UNSIGNED` | Yes | `NULL` (implicit) | FK; indexed by `idx_orders_user` | References `users.user_id`. |
| `created_by` | `INT UNSIGNED` | Yes | `NULL` (implicit) | FK | References `users.user_id`. |
| `channel` | `ENUM('online','store')` | No | None specified | — | Order channel. |
| `status` | `ENUM('pending','paid','completed','cancelled')` | No | `'pending'` | — | Order status. |
| `total_amount` | `DECIMAL(10,2)` | No | `0.00` | — | Stored order total; the order-item after-insert trigger updates it using `fn_order_total`. |
| `created_at` | `TIMESTAMP` | No | `CURRENT_TIMESTAMP` | — | Order creation timestamp. |

## `order_items`

| Column | Type | Nullable | Default | Key | Notes |
|---|---|---:|---|---|---|
| `order_item_id` | `INT UNSIGNED` | No | Auto-increment | PK | Order-item identifier. |
| `order_id` | `INT UNSIGNED` | No | None specified | FK; indexed by `idx_order_items_order` | References `orders.order_id`; deleting the order cascades to its items. |
| `product_size_id` | `INT UNSIGNED` | No | None specified | FK | References `product_sizes.product_size_id`. |
| `quantity` | `INT UNSIGNED` | No | None specified | — | Check constraint requires a value greater than zero. |
| `unit_price` | `DECIMAL(10,2)` | No | None specified | — | Unit price stored on the order item; the before-insert trigger sets it from the active product price. |

## `payments`

| Column | Type | Nullable | Default | Key | Notes |
|---|---|---:|---|---|---|
| `payment_id` | `INT UNSIGNED` | No | Auto-increment | PK | Payment identifier. |
| `order_id` | `INT UNSIGNED` | No | None specified | FK | References `orders.order_id`; deleting the order cascades to its payments. The column is not declared unique. |
| `method` | `ENUM('qr','cash')` | No | None specified | — | Payment method. |
| `provider` | `VARCHAR(50)` | Yes | `NULL` (implicit) | — | Payment provider. |
| `reference_no` | `VARCHAR(60)` | Yes | `NULL` (implicit) | — | Payment reference. |
| `amount` | `DECIMAL(10,2)` | No | None specified | — | Check constraint requires a value greater than or equal to zero. |
| `status` | `ENUM('pending','confirmed','rejected')` | No | `'pending'` | — | Payment status. |
| `paid_at` | `DATETIME` | Yes | `NULL` (implicit) | — | Payment time, if recorded. |

## `stock_movements`

| Column | Type | Nullable | Default | Key | Notes |
|---|---|---:|---|---|---|
| `movement_id` | `INT UNSIGNED` | No | Auto-increment | PK | Stock-movement identifier. |
| `product_size_id` | `INT UNSIGNED` | No | None specified | FK | References `product_sizes.product_size_id`. |
| `change_qty` | `INT` | No | None specified | — | Quantity change recorded by the movement. |
| `reason` | `ENUM('order_placed','order_cancelled','restock','manual_adjust')` | No | None specified | — | Movement reason. |
| `order_id` | `INT UNSIGNED` | Yes | `NULL` (implicit) | FK | References `orders.order_id`; deleting the order sets this reference to `NULL`. |
| `user_id` | `INT UNSIGNED` | Yes | `NULL` (implicit) | FK | References `users.user_id`; deleting the user sets this reference to `NULL`. |
| `created_at` | `TIMESTAMP` | No | `CURRENT_TIMESTAMP` | — | Movement timestamp. |

## `feedback`

| Column | Type | Nullable | Default | Key | Notes |
|---|---|---:|---|---|---|
| `feedback_id` | `INT UNSIGNED` | No | Auto-increment | PK | Feedback identifier. |
| `user_id` | `INT UNSIGNED` | No | None specified | FK | References `users.user_id`; deleting the user cascades to this row. |
| `order_id` | `INT UNSIGNED` | Yes | `NULL` (implicit) | FK | References `orders.order_id`; deleting the order sets this reference to `NULL`. |
| `message` | `TEXT` | No | None specified | — | Feedback message. |
| `created_at` | `TIMESTAMP` | No | `CURRENT_TIMESTAMP` | — | Feedback creation timestamp. |

## Views, functions, and procedures

### View: `v_low_stock`

| Output column | Definition |
|---|---|
| `product` | `products.name` |
| `size` | `product_sizes.size` |
| `stock_quantity` | `product_sizes.stock_quantity` |
| `reorder_level` | `product_sizes.reorder_level` |

The view joins `product_sizes` to `products` by `product_id` and includes rows where `stock_quantity <= reorder_level`.

### Function: `fn_order_total(p_order_id INT UNSIGNED)`

Returns `DECIMAL(10,2)`. It returns the sum of `quantity * unit_price` for rows in `order_items` with the supplied `order_id`, or `0.00` when there are no matching rows.

### Procedure: `sp_create_order(p_user_id INT UNSIGNED, p_channel ENUM('online','store'), p_created_by INT UNSIGNED, OUT p_order_id INT UNSIGNED)`

Inserts a `pending` row into `orders` using the supplied user, channel, and creator values, then assigns the new identifier to `p_order_id`.

### Procedure: `sp_cancel_order(p_order_id INT UNSIGNED, p_user_id INT UNSIGNED)`

Starts a transaction, locks the matching order row while checking its status, restores its item quantities to `product_sizes`, inserts `order_cancelled` rows into `stock_movements` with the supplied user ID, marks the order cancelled, and commits. Its SQL-exception handler rolls back and re-signals the exception.
