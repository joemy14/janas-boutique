# User guide

Open the application at `http://localhost:3000` when running locally. The route paths below are relative to the application host.

## Customer

1. **Register or sign in:** Open [`/auth`](/auth). The page opens the registration form by default; use its sign-in link to switch forms. To open the sign-in form directly, use [`/auth?form=login`](/auth?form=login).
2. **Browse products:** Start at [`/`](/) or use category pages such as [`/tops`](/tops), [`/bottoms`](/bottoms), [`/dresses`](/dresses), [`/perfumes`](/perfumes), [`/shoes/sandals`](/shoes/sandals), and [`/accessories/handbags`](/accessories/handbags).
3. **Add items to the cart:** Use the product controls on a shop page to choose available options and add products. Open the shopping-bag control in the navigation bar to review or remove cart items.
4. **Checkout:** Open [`/checkout`](/checkout), enter shipping details, and follow the payment prompt. The current customer checkout UI offers QR payment. Cash is available for staff-recorded in-store sales at [`/admin/staffsales`](/admin/staffsales); the customer checkout UI does not currently show a cash option.
5. **View order history:** Sign in and open [`/profile`](/profile). The page loads the signed-in customer's orders.
6. **Request a password reset:** Open [`/forgotpassword`](/forgotpassword), enter the registered email, and submit the request. Open the reset link when received; it leads to [`/resetpassword?token=...`](/resetpassword) with a token in the query string. Enter and confirm a new password. The reset form requires at least eight characters.

## Admin / Staff

### Sign in

- **Admin:** Use [`/adminlogin`](/adminlogin) to sign in with an admin account.
- **Staff:** Use [`/auth?form=login`](/auth?form=login) to sign in with a staff account, then open [`/admin/staffsales`](/admin/staffsales) to enter the staff area.

### Admin tasks

- **View orders:** Open [`/admin/orders`](/admin/orders). Pending QR orders show a **Confirm Payment** button; select it to confirm the payment.
- **View reports:** Open [`/admin/reports/low-stock`](/admin/reports/low-stock), [`/admin/reports/sales`](/admin/reports/sales), or [`/admin/reports/top-products`](/admin/reports/top-products). The sales page supports From and To date filters.
- **Manage products:** Open [`/admin/products`](/admin/products) to view the catalogue and use its add/edit controls.

### Staff tasks

- **Record an in-store sale:** Open [`/admin/staffsales`](/admin/staffsales), select a product, an in-stock size, and a quantity, then add it to the sale. Review the running total and save it as cash or QR.
- **View low stock:** Open [`/admin/reports/low-stock`](/admin/reports/low-stock) from the Reports section in the sidebar.

In the current interface, orders and payment confirmation, the sales and top-products reports, and product management are admin tasks. Staff navigation exposes in-store sales and the low-stock report.
