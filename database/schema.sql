-- ============================================================
-- Jana's Boutique - Online Ordering and Inventory System
-- Database: janas_boutique
-- Target: MySQL 8 or MariaDB 10.4+ (XAMPP)
-- Run this file in phpMyAdmin > SQL tab, or import it.
-- ============================================================

-- ------------------------------------------------------------
-- 1. USERS: customers, admin (owner), staff (sales and inventory)
-- ------------------------------------------------------------
CREATE TABLE users (
    user_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name    VARCHAR(50)  NOT NULL,
    last_name     VARCHAR(50)  NOT NULL,
    email         VARCHAR(120) NOT NULL UNIQUE,
    phone         VARCHAR(20)  NULL,
    address       VARCHAR(255) NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('customer','admin','staff') NOT NULL DEFAULT 'customer',
    is_active     TINYINT(1)   NOT NULL DEFAULT 1,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. PASSWORD_RESETS: one row per reset request
-- ------------------------------------------------------------
CREATE TABLE password_resets (
    reset_id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,
    token_hash  VARCHAR(255) NOT NULL,
    expires_at  DATETIME     NOT NULL,
    used_at     DATETIME     NULL,
    CONSTRAINT fk_reset_user FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. CATEGORIES
-- ------------------------------------------------------------
CREATE TABLE categories (
    category_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. PRODUCTS
-- ------------------------------------------------------------
CREATE TABLE products (
    product_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id INT UNSIGNED NOT NULL,
    name        VARCHAR(120) NOT NULL,
    description TEXT         NULL,
    price       DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    image_path  VARCHAR(255) NULL,
    is_active   TINYINT(1)   NOT NULL DEFAULT 1,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(category_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. PRODUCT_SIZES: stock per size
-- ------------------------------------------------------------
CREATE TABLE product_sizes (
    product_size_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id      INT UNSIGNED NOT NULL,
    size            ENUM('S','M','L','XL','ONE') NOT NULL,
    stock_quantity  INT NOT NULL DEFAULT 0,
    reorder_level   INT NOT NULL DEFAULT 5,
    CONSTRAINT uq_product_size UNIQUE (product_id, size),
    CONSTRAINT fk_size_product FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE CASCADE,
    CONSTRAINT chk_stock_not_negative CHECK (stock_quantity >= 0)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6. ORDERS
-- ------------------------------------------------------------
CREATE TABLE orders (
    order_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id      INT UNSIGNED NULL,
    created_by   INT UNSIGNED NULL,
    channel      ENUM('online','store') NOT NULL,
    status       ENUM('pending','paid','completed','cancelled') NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_order_creator FOREIGN KEY (created_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 7. ORDER_ITEMS
-- ------------------------------------------------------------
CREATE TABLE order_items (
    order_item_id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id        INT UNSIGNED NOT NULL,
    product_size_id INT UNSIGNED NOT NULL,
    quantity        INT UNSIGNED NOT NULL CHECK (quantity > 0),
    unit_price      DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES orders(order_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_item_size FOREIGN KEY (product_size_id) REFERENCES product_sizes(product_size_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 8. PAYMENTS: QR or cash
-- ------------------------------------------------------------
CREATE TABLE payments (
    payment_id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id     INT UNSIGNED NOT NULL,
    method       ENUM('qr','cash') NOT NULL,
    provider     VARCHAR(50) NULL,
    reference_no VARCHAR(60) NULL,
    amount       DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    status       ENUM('pending','confirmed','rejected') NOT NULL DEFAULT 'pending',
    paid_at      DATETIME NULL,
    CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES orders(order_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 9. STOCK_MOVEMENTS: audit log of every stock change
-- ------------------------------------------------------------
CREATE TABLE stock_movements (
    movement_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_size_id INT UNSIGNED NOT NULL,
    change_qty      INT NOT NULL,
    reason          ENUM('order_placed','order_cancelled','restock','manual_adjust') NOT NULL,
    order_id        INT UNSIGNED NULL,
    user_id         INT UNSIGNED NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_move_size FOREIGN KEY (product_size_id) REFERENCES product_sizes(product_size_id),
    CONSTRAINT fk_move_order FOREIGN KEY (order_id) REFERENCES orders(order_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_move_user FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 10. FEEDBACK
-- ------------------------------------------------------------
CREATE TABLE feedback (
    feedback_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,
    order_id    INT UNSIGNED NULL,
    message     TEXT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_products_category ON products(category_id);

CREATE VIEW v_low_stock AS
SELECT p.name AS product, ps.size, ps.stock_quantity, ps.reorder_level
  FROM product_sizes ps
  JOIN products p ON p.product_id = ps.product_id
 WHERE ps.stock_quantity <= ps.reorder_level;

DELIMITER $$

CREATE FUNCTION fn_order_total(p_order_id INT UNSIGNED)
RETURNS DECIMAL(10,2)
READS SQL DATA
BEGIN
    DECLARE v_total DECIMAL(10,2);
    SELECT COALESCE(SUM(quantity * unit_price), 0.00)
      INTO v_total
      FROM order_items
     WHERE order_id = p_order_id;
    RETURN v_total;
END$$

CREATE TRIGGER trg_order_items_before_insert
BEFORE INSERT ON order_items
FOR EACH ROW
BEGIN
    DECLARE v_stock INT;
    DECLARE v_price DECIMAL(10,2);

    SELECT ps.stock_quantity, p.price
      INTO v_stock, v_price
      FROM product_sizes ps
      JOIN products p ON p.product_id = ps.product_id
     WHERE ps.product_size_id = NEW.product_size_id
       AND p.is_active = 1;

    IF v_stock IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Product size not found or inactive.';
    END IF;

    IF v_stock < NEW.quantity THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Not enough stock for this item.';
    END IF;

    SET NEW.unit_price = v_price;
END$$

CREATE TRIGGER trg_order_items_after_insert
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    UPDATE product_sizes
       SET stock_quantity = stock_quantity - NEW.quantity
     WHERE product_size_id = NEW.product_size_id;

    INSERT INTO stock_movements (product_size_id, change_qty, reason, order_id)
    VALUES (NEW.product_size_id, -NEW.quantity, 'order_placed', NEW.order_id);

    UPDATE orders
       SET total_amount = fn_order_total(NEW.order_id)
     WHERE order_id = NEW.order_id;
END$$

CREATE PROCEDURE sp_create_order(
    IN  p_user_id    INT UNSIGNED,
    IN  p_channel    ENUM('online','store'),
    IN  p_created_by INT UNSIGNED,
    OUT p_order_id   INT UNSIGNED
)
BEGIN
    INSERT INTO orders (user_id, created_by, channel, status)
    VALUES (p_user_id, p_created_by, p_channel, 'pending');
    SET p_order_id = LAST_INSERT_ID();
END$$

CREATE PROCEDURE sp_cancel_order(
    IN p_order_id INT UNSIGNED,
    IN p_user_id  INT UNSIGNED
)
BEGIN
    DECLARE v_status VARCHAR(20);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT status INTO v_status FROM orders WHERE order_id = p_order_id FOR UPDATE;

    IF v_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Order not found.';
    END IF;
    IF v_status = 'cancelled' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Order is already cancelled.';
    END IF;

    UPDATE product_sizes ps
      JOIN order_items oi ON oi.product_size_id = ps.product_size_id
       SET ps.stock_quantity = ps.stock_quantity + oi.quantity
     WHERE oi.order_id = p_order_id;

    INSERT INTO stock_movements (product_size_id, change_qty, reason, order_id, user_id)
    SELECT product_size_id, quantity, 'order_cancelled', order_id, p_user_id
      FROM order_items
     WHERE order_id = p_order_id;

    UPDATE orders SET status = 'cancelled' WHERE order_id = p_order_id;

    COMMIT;
END$$

DELIMITER ;
