import type { OrderDTO } from "@/types";

type DecimalValue = number | string | { toNumber(): number };

type Order = {
  id: number;
  orderNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  province: string;
  zip: string;
  phone: string;
  paymentMethod: string;
  shippingCost: DecimalValue;
  totalAmount: DecimalValue;
  createdAt: Date;
};

type OrderItem = {
  id: number;
  productId: number | null;
  name: string;
  imageUrl: string | null;
  size: string | null;
  quantity: number;
  unitPrice: DecimalValue;
};

export function serializeOrder(order: Order & { items: OrderItem[] }): OrderDTO {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    email: order.email,
    firstName: order.firstName,
    lastName: order.lastName,
    address: order.address,
    city: order.city,
    province: order.province,
    zip: order.zip,
    phone: order.phone,
    paymentMethod: order.paymentMethod,
    shippingCost: Number(order.shippingCost),
    totalAmount: Number(order.totalAmount),
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      imageUrl: item.imageUrl,
      size: item.size,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
    })),
  };
}
