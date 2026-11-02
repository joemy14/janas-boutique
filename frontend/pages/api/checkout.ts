import { apiHandler, str } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { receiptEmail, sendMail } from "@/lib/mailer";
import { SHIPPING_COST } from "@/lib/products";
import type { OrderDTO } from "@/types";

const PAYMENT_METHODS = ["qr", "cash"];

function backendUrl(file: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
  if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  return `${baseUrl}/${file}`;
}

export default apiHandler({
  async POST(req, res) {
    const user = await requireUser(req, res);
    if (!user) return;

    const b = req.body ?? {};
    const shipping = {
      firstName: str(b.firstName),
      lastName: str(b.lastName),
      address: str(b.address),
      city: str(b.city),
      province: str(b.province),
      zip: str(b.zip),
      phone: str(b.phone),
      country: str(b.country) || "Philippines",
    };
    if (Object.values(shipping).some((value) => !value)) {
      return res.status(400).json({ success: false, message: "Please fill in all required fields!" });
    }

    const paymentMethod = str(b.paymentMethod);
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: "Unsupported payment method." });
    }

    const requested: { productId: number; quantity: number; size: string | null }[] = Array.isArray(b.items)
      ? b.items.map((item: Record<string, unknown>) => ({
          productId: Number(item?.productId),
          quantity: Number(item?.quantity),
          size: str(item?.size) || null,
        }))
      : [];
    if (
      requested.length === 0 ||
      requested.some((item) => !Number.isInteger(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1)
    ) {
      return res.status(400).json({ success: false, message: "Your cart is empty!" });
    }

    const productResponse = await fetch(backendUrl("getProducts.php"));
    const productPayload = await productResponse.json();
    if (!productResponse.ok || productPayload.success !== true) {
      throw new Error(productPayload.message || "Unable to load products for checkout.");
    }
    const products = new Map<number, Record<string, unknown>>(
      (productPayload.products as Record<string, unknown>[]).map((product) => [Number(product.id), product])
    );
    const cart = [];
    for (const line of requested) {
      const product = products.get(line.productId);
      if (!product) {
        return res.status(409).json({ success: false, message: "A product in your cart is no longer available." });
      }
      const features = product.features && typeof product.features === "object"
        ? product.features as Record<string, unknown>
        : {};
      const sizePrice = line.size ? Number(features[line.size]) : NaN;
      const price = Number.isFinite(sizePrice) ? sizePrice : Number(product.price);
      cart.push({
        id: line.productId,
        name: str(product.name),
        image: str(product.image_url) || str(product.imageUrl),
        quantity: line.quantity,
        price,
        size: line.size,
      });
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const phpResponse = await fetch(backendUrl("checkout.php"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...shipping,
        email: user.email,
        state: shipping.province,
        zipcode: shipping.zip,
        cart,
        total: subtotal + SHIPPING_COST,
        shippingCost: SHIPPING_COST,
        paymentMethod,
      }),
    });
    const result = await phpResponse.json();
    if (!phpResponse.ok || result.success !== true) {
      const message = result.message || "Unable to place your order.";
      const conflict = /stock|available|not found/i.test(message);
      return res.status(conflict ? 409 : phpResponse.status || 502).json({ success: false, message });
    }

    const savedOrder = result.order ?? {};
    const rawItems = Array.isArray(savedOrder.items) ? savedOrder.items : cart;
    const orderNumber = str(savedOrder.orderId) || `ORD-${Date.now()}`;
    const dto: OrderDTO = {
      id: Number(orderNumber.match(/\d+$/)?.[0] ?? Date.now()),
      orderNumber,
      email: user.email,
      firstName: shipping.firstName,
      lastName: shipping.lastName,
      address: shipping.address,
      city: shipping.city,
      province: shipping.province,
      zip: shipping.zip,
      phone: shipping.phone,
      paymentMethod,
      shippingCost: Number(savedOrder.shippingCost ?? SHIPPING_COST),
      totalAmount: Number(savedOrder.total ?? subtotal + SHIPPING_COST),
      createdAt: new Date().toISOString(),
      items: rawItems.map((item: Record<string, unknown>, index: number) => ({
        id: Number(item.id ?? index + 1),
        productId: Number(item.productId ?? item.id) || null,
        name: str(item.name),
        imageUrl: str(item.imageUrl) || str(item.image) || null,
        size: str(item.size) || null,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice ?? item.price),
      })),
    };

    sendMail(dto.email, `Your Jana Boutique receipt — ${dto.orderNumber}`, receiptEmail(dto)).catch((err) =>
      console.error("Failed to send receipt:", err)
    );

    return res.status(201).json({ success: true, order: dto });
  },
});
