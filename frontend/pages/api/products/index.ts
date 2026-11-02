import { apiHandler, str } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { parseProductInput } from "@/lib/productInput";
import { folderLabel, parseFeatures } from "@/lib/products";
import type { Product } from "@/types";

export const config = { api: { bodyParser: { sizeLimit: "8mb" } } };

function backendUrl(file: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
  if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  return `${baseUrl}/${file}`;
}

function normalizeProduct(row: Record<string, unknown>): Product {
  const folder = str(row.folder);
  const [category = "", ...parts] = folder.split(">").map((part) => part.trim().toLowerCase());
  const subcategory = parts.join(" > ") || null;
  return {
    id: Number(row.id),
    name: str(row.name),
    category: category as Product["category"],
    subcategory,
    folder: folderLabel(category, subcategory),
    price: Number(row.price),
    stock: Number(row.stock ?? 0),
    overview: str(row.overview) || null,
    features: parseFeatures(row.features),
    stylingTip: str(row.stylingTip) || null,
    imageUrl: str(row.image_url) || null,
  };
}

async function fetchProducts(folder?: string) {
  const url = new URL(backendUrl("getProducts.php"));
  if (folder) url.searchParams.set("folder", folder);
  const response = await fetch(url);
  const payload = await response.json();
  if (!response.ok || payload.success !== true) {
    throw new Error(payload.message || "Unable to load products.");
  }
  return (payload.products as Record<string, unknown>[]).map(normalizeProduct);
}

export default apiHandler({
  async GET(req, res) {
    const category = str(req.query.category).toLowerCase();
    const subcategory = str(req.query.subcategory).toLowerCase();
    const folder = category ? folderLabel(category, subcategory || null) : undefined;
    const products = await fetchProducts(folder);
    return res.status(200).json({ success: true, products });
  },

  async POST(req, res) {
    if (!(await requireAdmin(req, res))) return;

    const input = parseProductInput(req.body);
    if (typeof input === "string") {
      return res.status(400).json({ success: false, message: input });
    }

    const form = new FormData();
    form.set("name", input.data.name);
    form.set("description", input.data.overview ?? "");
    form.set("price", String(input.data.price));
    form.set("stock", String(input.data.stock));
    form.set("folder", folderLabel(input.data.category, input.data.subcategory));
    form.set("features", JSON.stringify(input.data.features ?? {}));
    form.set("stylingTip", input.data.stylingTip ?? "");
    if (input.image) {
      form.set("image", new Blob([input.image.data], { type: input.image.mimeType }), "product-image");
    }
    const response = await fetch(backendUrl("add_product.php"), { method: "POST", body: form });
    const payload = await response.json();
    if (!response.ok || payload.success !== true) {
      return res.status(response.status || 400).json({ success: false, message: payload.message || "Unable to add product." });
    }
    const products = await fetchProducts();
    const product = products.find((item) => item.id === Number(payload.debug?.inserted_id));
    if (!product) throw new Error("Product was added but could not be loaded.");
    return res.status(201).json({ success: true, product });
  },
});
