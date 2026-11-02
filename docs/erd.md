# Entity-relationship diagram

The diagram below represents every table and all thirteen foreign keys declared in `database/schema.sql`. Labels distinguish the two user references from `orders` and show nullable foreign-key relationships.

```mermaid
erDiagram
    USERS {
        INT user_id PK
        VARCHAR email UK
    }
    PASSWORD_RESETS {
        INT reset_id PK
        INT user_id FK
    }
    CATEGORIES {
        INT category_id PK
        VARCHAR name UK
    }
    PRODUCTS {
        INT product_id PK
        INT category_id FK
    }
    PRODUCT_SIZES {
        INT product_size_id PK
        INT product_id FK
        ENUM size UK
    }
    ORDERS {
        INT order_id PK
        INT user_id FK "nullable"
        INT created_by FK "nullable"
    }
    ORDER_ITEMS {
        INT order_item_id PK
        INT order_id FK
        INT product_size_id FK
    }
    PAYMENTS {
        INT payment_id PK
        INT order_id FK
    }
    STOCK_MOVEMENTS {
        INT movement_id PK
        INT product_size_id FK
        INT order_id FK "nullable"
        INT user_id FK "nullable"
    }
    FEEDBACK {
        INT feedback_id PK
        INT user_id FK
        INT order_id FK "nullable"
    }

    USERS ||--o{ PASSWORD_RESETS : "fk_reset_user"
    CATEGORIES ||--o{ PRODUCTS : "fk_product_category"
    PRODUCTS ||--o{ PRODUCT_SIZES : "fk_size_product"
    USERS o|--o{ ORDERS : "fk_order_user"
    USERS o|--o{ ORDERS : "fk_order_creator"
    ORDERS ||--o{ ORDER_ITEMS : "fk_item_order"
    PRODUCT_SIZES ||--o{ ORDER_ITEMS : "fk_item_size"
    ORDERS ||--o{ PAYMENTS : "fk_payment_order"
    PRODUCT_SIZES ||--o{ STOCK_MOVEMENTS : "fk_move_size"
    ORDERS o|--o{ STOCK_MOVEMENTS : "fk_move_order"
    USERS o|--o{ STOCK_MOVEMENTS : "fk_move_user"
    USERS ||--o{ FEEDBACK : "fk_feedback_user"
    ORDERS o|--o{ FEEDBACK : "fk_feedback_order"
```

A user can have many password-reset records, customer orders, staff-created orders, stock-movement audit entries, and feedback records; the corresponding nullable foreign keys allow some orders and stock movements to have no associated user. Categories contain products, and each product has product-size inventory rows. An order has order items and may have payment and stock-movement records. Each order item refers to a product-size row, which identifies the product and size sold.
