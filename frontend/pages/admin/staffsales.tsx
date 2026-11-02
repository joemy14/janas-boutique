import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/fetcher";
import type { Product } from "@/types";

type DatabaseSize = "S" | "M" | "L" | "XL" | "ONE";

interface SaleLine {
  productId: number;
  name: string;
  size: DatabaseSize;
  quantity: number;
  unitPrice: number;
}

function toDatabaseSize(size: string): DatabaseSize {
  const normalized = size.trim().toUpperCase();
  if (normalized === "S" || normalized === "M" || normalized === "L" || normalized === "XL" || normalized === "ONE") {
    return normalized;
  }
  if (normalized.startsWith("SMALL")) return "S";
  if (normalized.startsWith("MEDIUM")) return "M";
  if (normalized.startsWith("LARGE")) return "L";
  return "ONE";
}

export default function StaffSales() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedSize, setSelectedSize] = useState<DatabaseSize | "">("");
  const [quantity, setQuantity] = useState("1");
  const [saleItems, setSaleItems] = useState<SaleLine[]>([]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api<{ products: Product[] }>("/api/products").then((result) => {
      if (result.success) setProducts(result.products);
      else setError(result.message);
      setProductsLoading(false);
    });
  }, []);

  const selectedProduct = products.find((product) => String(product.id) === selectedProductId);
  const availableSizes = selectedProduct?.available_sizes?.map(toDatabaseSize) ?? [];
  const total = saleItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    const product = products.find((item) => String(item.id) === productId);
    setSelectedSize(product?.available_sizes?.[0] ? toDatabaseSize(product.available_sizes[0]) : "");
  };

  const addToSale = () => {
    const amount = Number(quantity);
    if (!selectedProduct || !selectedSize || !Number.isInteger(amount) || amount < 1) {
      setError("Choose an available product size and a valid quantity.");
      return;
    }

    setError("");
    setSaleItems((items) => [
      ...items,
      {
        productId: selectedProduct.id,
        name: selectedProduct.name,
        size: toDatabaseSize(selectedSize),
        quantity: amount,
        unitPrice: Number(selectedProduct.price),
      },
    ]);
    setQuantity("1");
  };

  const saveSale = async (paymentMethod: "cash" | "qr") => {
    if (saleItems.length === 0) {
      setError("Add at least one item to the sale.");
      return;
    }

    setError("");
    setIsSaving(true);
    const result = await api<{ orderId: number; total: number }>("/api/staff/sales", {
      body: {
        items: saleItems.map(({ productId, quantity: itemQuantity, size }) => ({
          productId,
          quantity: itemQuantity,
          size: toDatabaseSize(size),
        })),
        paymentMethod,
      },
    });
    setIsSaving(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    window.alert(`Sale order ${result.orderId} saved. Total: ₱${Number(result.total).toLocaleString()}`);
    setSaleItems([]);
    setSelectedProductId("");
    setSelectedSize("");
    setQuantity("1");
  };

  return (
    <AdminLayout title="In-store Sales">
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="card space-y-4 p-6">
          {error && <p className="rounded-sm border border-accent/40 bg-accent/10 p-3 text-accent">{error}</p>}

          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1 text-sm">
              <span>Product</span>
              {productsLoading ? (
                <div className="input-field flex h-11 w-full items-center" role="status" aria-label="Loading products">
                  <span className="h-4 w-40 animate-pulse rounded bg-surface-2" />
                </div>
              ) : (
                <select
                  className="input-field w-full"
                  value={selectedProductId}
                  onChange={(event) => handleProductChange(event.target.value)}
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              )}
            </label>

            <label className="space-y-1 text-sm">
              <span>Size</span>
              <select
                className="input-field w-full"
                value={selectedSize}
                onChange={(event) => setSelectedSize(event.target.value as DatabaseSize | "")}
                disabled={!selectedProduct || availableSizes.length === 0}
              >
                <option value="">{selectedProduct ? "No sizes in stock" : "Select a product first"}</option>
                {availableSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span>Quantity</span>
              <input
                className="input-field w-full"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </label>
          </div>

          <button
            type="button"
            className="btn"
            onClick={addToSale}
            disabled={!selectedProduct || !selectedSize || !Number.isInteger(Number(quantity)) || Number(quantity) < 1}
          >
            Add to Sale
          </button>
        </section>

        <section className="card space-y-4 p-6">
          <h2 className="font-display text-2xl font-medium">Current Sale</h2>
          {saleItems.length === 0 ? (
            <p className="text-muted italic">No items added.</p>
          ) : (
            <ul className="divide-y divide-line">
              {saleItems.map((item, index) => (
                <li key={`${item.productId}-${item.size}-${index}`} className="flex justify-between gap-4 py-3">
                  <span>{item.name} ({item.size}) × {item.quantity}</span>
                  <span>₱{(item.unitPrice * item.quantity).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex justify-between border-t border-line pt-4 font-display text-xl font-semibold">
            <span>Total</span>
            <span>₱{total.toLocaleString()}</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn" onClick={() => void saveSale("cash")} disabled={isSaving || saleItems.length === 0}>
              Save as cash sale
            </button>
            <button type="button" className="btn-outline" onClick={() => void saveSale("qr")} disabled={isSaving || saleItems.length === 0}>
              Save as QR sale
            </button>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
