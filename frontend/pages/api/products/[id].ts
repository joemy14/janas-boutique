import { apiHandler } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { parseProductInput } from "@/lib/productInput";
import { folderLabel, parseFeatures } from "@/lib/products";
import type { Product } from "@/types";

export const config = { api: { bodyParser: { sizeLimit: "8mb" } } };

function parseId(value: unknown) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function backendUrl(file: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
  if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  return `${baseUrl}/backend/${file}`;
}

function normalizeProduct(row: Record<string, unknown>): Product {
  const folder = typeof row.folder === "string" ? row.folder : "";
  const [category = "", ...parts] = folder.split(">").map((part) => part.trim().toLowerCase());
  const subcategory = parts.join(" > ") || null;
  return {
    id: Number(row.id),
    name: typeof row.name === "string" ? row.name : "",
    category: category as Product["category"],
    subcategory,
    folder: folderLabel(category, subcategory),
    price: Number(row.price),
    stock: Number(row.stock ?? 0),
    overview: typeof row.overview === "string" ? row.overview : null,
    features: parseFeatures(row.features),
    stylingTip: typeof row.stylingTip === "string" ? row.stylingTip : null,
    imageUrl: typeof row.image_url === "string" ? row.image_url : null,
  };
}

export default apiHandler({
  async PUT(req, res) {
    if (!(await requireAdmin(req, res))) return;
    const id = parseId(req.query.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid product id." });

    const input = parseProductInput(req.body);
    if (typeof input === "string") {
      return res.status(400).json({ success: false, message: input });
    }
    const baseUrl = backendUrl("getProducts.php");
    const listResponse = await fetch(baseUrl);
    const listPayload = await listResponse.json();
    if (!listResponse.ok || listPayload.success !== true) {
      throw new Error(listPayload.message || "Unable to load products.");
    }
    const existing = (listPayload.products as Record<string, unknown>[]).find((row) => Number(row.id) === id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    const current = normalizeProduct(existing);
    const updatePayload: Record<string, unknown> = {
      id,
      name: input.data.name,
      price: input.data.price,
      overview: input.data.overview ?? "",
      features: JSON.stringify(input.data.features ?? []),
      stylingTip: input.data.stylingTip ?? "",
      folder: folderLabel(input.data.category, input.data.subcategory),
      stock: input.data.stock,
    };
    if (input.data.imageUrl) updatePayload.image_url = input.data.imageUrl;
    const response = await fetch(backendUrl("update_product.php"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.cookie || "",
      },
      body: JSON.stringify(updatePayload),
    });
    const payload = await response.json();
    if (!response.ok || payload.success !== true) {
      return res.status(response.status || 400).json({ success: false, message: payload.message || "Unable to update product." });
    }
    const product: Product = {
      ...current,
      name: input.data.name,
      category: input.data.category as Product["category"],
      subcategory: input.data.subcategory,
      folder: folderLabel(input.data.category, input.data.subcategory),
      price: input.data.price,
      stock: input.data.stock,
      overview: input.data.overview,
      features: input.data.features,
      stylingTip: input.data.stylingTip,
      imageUrl: input.data.imageUrl || current.imageUrl,
    };
    return res.status(200).json({ success: true, product });
  },

  async DELETE(req, res) {
    if (!(await requireAdmin(req, res))) return;
    const id = parseId(req.query.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid product id." });

    const response = await fetch(backendUrl("delete_product.php"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.cookie || "",
      },
      body: JSON.stringify({ id }),
    });
    const payload = await response.json();
    if (!response.ok || payload.success !== true) {
      const missing = payload.message === "Product not found";
      return res.status(missing ? 404 : response.status || 400).json({ success: false, message: payload.message || "Unable to delete product." });
    }
    return res.status(200).json({ success: true });
  },
});
