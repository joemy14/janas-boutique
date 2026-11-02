# Order cancellation transaction demo

`sp_cancel_order(p_order_id, p_user_id)` cancels an order and returns its item quantities to inventory. It assumes the schema's tables use InnoDB, as declared in `database/schema.sql`.

## Procedure flow

1. The procedure declares an `EXIT HANDLER FOR SQLEXCEPTION`. If a SQL exception occurs, the handler runs `ROLLBACK` and `RESIGNAL`s the error to the caller.
2. It executes `START TRANSACTION` before reading or changing order data.
3. It selects the order status using `SELECT ... FOR UPDATE`. This locks the matching order row until the transaction finishes. A concurrent cancellation of that same order must wait; after the first transaction commits, it observes the updated status and is rejected as already cancelled.
4. It signals an error if the order does not exist or is already cancelled.
5. It increments `product_sizes.stock_quantity` by the quantities in `order_items`, writes corresponding positive `order_cancelled` records to `stock_movements`, and sets the order status to `cancelled`.
6. It executes `COMMIT` only after all these changes succeed.

## ACID properties

- **Atomicity:** Inventory restoration, movement audit rows, and the cancelled order status are changes in one transaction. A SQL exception invokes the rollback handler, so partial changes are undone; successful execution commits them together.
- **Isolation:** `FOR UPDATE` takes an exclusive lock on the order row while the procedure checks and changes its state. This prevents two concurrent cancellations from both proceeding based on the same pre-cancellation status. The inventory `UPDATE` also locks the affected `product_sizes` rows as it changes them. InnoDB holds these locks until commit or rollback.

The procedure itself demonstrates atomicity and the relevant row-locking behavior. The exact broader isolation guarantees also depend on the database's transaction isolation level.

## Call and verify

Use an existing order that is not already cancelled and an existing user ID for the audit actor. Replace the example IDs below with IDs from the database; the example numbers are placeholders.

```sql
SET @order_id = 123;
SET @actor_user_id = 1;

CALL sp_cancel_order(@order_id, @actor_user_id);

-- Verify the order status.
SELECT order_id, status
FROM orders
WHERE order_id = @order_id;

-- Verify the positive stock movements recorded for this cancellation.
SELECT product_size_id, change_qty, reason, order_id, user_id, created_at
FROM stock_movements
WHERE order_id = @order_id
  AND reason = 'order_cancelled'
ORDER BY movement_id;

-- Compare restored movement totals with the order item quantities.
SELECT ordered.product_size_id,
       ordered.ordered_quantity,
       COALESCE(returned.returned_quantity, 0) AS returned_quantity
FROM (
    SELECT product_size_id, SUM(quantity) AS ordered_quantity
    FROM order_items
    WHERE order_id = @order_id
    GROUP BY product_size_id
) AS ordered
LEFT JOIN (
    SELECT product_size_id, SUM(change_qty) AS returned_quantity
    FROM stock_movements
    WHERE order_id = @order_id
      AND reason = 'order_cancelled'
    GROUP BY product_size_id
) AS returned ON returned.product_size_id = ordered.product_size_id;
```

For a successful first cancellation, the status should be `cancelled`; the audit query should show positive `change_qty` values, and the per-size returned quantities should match the ordered quantities. Calling the procedure again for that order raises the already-cancelled error instead of restoring stock a second time.
