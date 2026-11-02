import { useEffect, useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import AdminLayout from "@/components/AdminLayout";
import ProductPhoto from "@/components/ProductPhoto";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/fetcher";
import { CATEGORIES, folderLabel } from "@/lib/products";
import type { Category, Product } from "@/types";

interface FormState {
  id?: number;
  name: string;
  price: string;
  overview: string;
  stylingTip: string;
  category: Category | "";
  subcategory: string | null;
  stock: string;
  imageUrl: string | null;
  /** New image as a data URL, if one was chosen */
  image: string | null;
  imagePreviewUrl: string | null;
}

const emptyForm: FormState = {
  name: "",
  price: "",
  overview: "",
  stylingTip: "",
  category: "",
  subcategory: null,
  stock: "",
  imageUrl: null,
  image: null,
  imagePreviewUrl: null,
};

const toForm = (p: Product): FormState => ({
  id: p.id,
  name: p.name,
  price: String(p.price),
  overview: p.overview ?? "",
  stylingTip: p.stylingTip ?? "",
  category: p.category,
  subcategory: p.subcategory,
  stock: String(p.stock),
  imageUrl: p.imageUrl,
  image: null,
  imagePreviewUrl: null,
});

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const inputClass = "input-field mb-3";
const th = "px-4 py-3 text-left font-display text-xs font-semibold tracking-[0.2em] text-muted uppercase";

export default function AdminProducts() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadProducts = async () => {
    const data = await api<{ products: Product[] }>("/api/products");
    if (data.success) setProducts(data.products);
    else console.error("Error fetching products:", data.message);
  };

  useEffect(() => {
    if (currentUser?.isAdmin) loadProducts();
  }, [currentUser]);

  useEffect(() => {
    const previewUrl = form?.imagePreviewUrl;
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [form?.imagePreviewUrl]);

  // Disable page scrolling while the modal is open
  useEffect(() => {
    document.body.style.overflow = form ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [form]);

  const update = (patch: Partial<FormState>) => setForm((prev) => (prev ? { ...prev, ...patch } : prev));

  const handleImage = async (file: File | undefined) => {
    if (!file) return update({ image: null, imagePreviewUrl: null });
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be 5 MB or smaller.");
      return;
    }
    update({ imagePreviewUrl: URL.createObjectURL(file) });
    update({ image: await readAsDataUrl(file) });
  };

  const save = async () => {
    if (!form) return;
    setSaving(true);
    const isEdit = form.id !== undefined;
    const data = await api(isEdit ? `/api/products/${form.id}` : "/api/products", {
      method: isEdit ? "PUT" : "POST",
      body: isEdit
        ? {
            name: form.name,
            price: form.price === "" ? 0 : Number(form.price),
            overview: form.overview,
            category: form.category,
            subcategory: form.subcategory,
            stock: form.stock === "" ? 0 : Number(form.stock),
            imageUrl: form.imageUrl,
            image: form.image,
          }
        : {
            name: form.name,
            description: form.overview,
            price: form.price === "" ? 0 : Number(form.price),
            stock: form.stock === "" ? 0 : Number(form.stock),
            folder: folderLabel(form.category, form.subcategory),
            image: form.image,
          },
    });
    setSaving(false);

    if (data.success) {
      alert(isEdit ? "Product updated successfully!" : "Product added successfully!");
      setForm(null);
      loadProducts();
    } else {
      alert(`${isEdit ? "Update" : "Add"} failed: ${data.message}`);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const data = await api(`/api/products/${id}`, { method: "DELETE" });
    if (data.success) {
      alert("Product deleted successfully!");
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setForm(null);
    } else {
      alert("Delete failed: " + data.message);
    }
  };

  const term = searchTerm.toLowerCase();
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(term) ||
      p.overview?.toLowerCase().includes(term) ||
      p.folder.toLowerCase().includes(term)
  );

  return (
    <AdminLayout title="Products">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted">{products.length} products in the catalogue</p>
        <button
          onClick={() => setForm(emptyForm)}
          className="btn"
        >
          Add Product
        </button>
      </div>

      <div className="mb-4 flex justify-end">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field max-w-xs"
        />
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-line">
          <thead className="bg-surface-2">
            <tr>
              {["ID", "Name", "Price", "Overview", "Category", "Stock", "Product", "Action"].map((h) => (
                <th key={h} className={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-surface text-ink">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-4 text-center text-muted">
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-surface-2">
                  <td className="px-4 py-3">{product.id}</td>
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3">₱{product.price.toLocaleString()}</td>
                  <td className="px-4 py-3">{product.overview}</td>
                  <td className="px-4 py-3">{product.folder}</td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-12">
                      <ProductPhoto src={product.imageUrl} alt={product.name} fill sizes="48px" className="object-cover" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="flex cursor-pointer items-center justify-center rounded-sm border border-line p-2 text-ink transition-colors hover:border-gold hover:text-gold"
                      onClick={() => setForm(toForm(product))}
                      title="Edit / Delete Product"
                    >
                      <AiOutlineEdit size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {form && (
        <ProductModal
          form={form}
          saving={saving}
          onChange={update}
          onImage={handleImage}
          onCancel={() => setForm(null)}
          onSave={save}
          onDelete={form.id !== undefined ? () => remove(form.id!) : undefined}
        />
      )}
    </AdminLayout>
  );
}

interface ModalProps {
  form: FormState;
  saving: boolean;
  onChange: (patch: Partial<FormState>) => void;
  onImage: (file: File | undefined) => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete?: () => void;
}

function ProductModal({ form, saving, onChange, onImage, onCancel, onSave, onDelete }: ModalProps) {
  const [imageFileName, setImageFileName] = useState("");

  const previewSrc = form.imagePreviewUrl ?? form.image ?? form.imageUrl;
  const categoryValue = form.category ? `${form.category}|${form.subcategory ?? ""}` : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <form
        className="card custom-scrollbar max-h-[90vh] w-[26rem] overflow-y-auto p-7 text-ink shadow-2xl"
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
      >
        <h2 className="mb-5 font-display text-3xl font-medium">{onDelete ? "Edit / Delete Product" : "Add Product"}</h2>

        <label htmlFor="product-name" className="mb-1 block text-sm text-muted">Name <span className="text-red-500">*</span></label>
        <input id="product-name" className={inputClass} required value={form.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="Product Name" />
        <label htmlFor="product-price" className="mb-1 block text-sm text-muted">Price <span className="text-red-500">*</span></label>
        <input id="product-price" className={inputClass} type="number" min="0" required value={form.price} onChange={(e) => onChange({ price: e.target.value })} placeholder="Price" />
        <label htmlFor="product-overview" className="mb-1 block text-sm text-muted">Overview <span className="text-red-500">*</span></label>
        <textarea id="product-overview" className={`${inputClass} min-h-20`} required value={form.overview} onChange={(e) => onChange({ overview: e.target.value })} placeholder="Overview" />
        <input className={inputClass} value={form.stylingTip} onChange={(e) => onChange({ stylingTip: e.target.value })} placeholder="Styling Tip" />

        <label htmlFor="product-category" className="mb-1 block text-sm text-muted">Category <span className="text-red-500">*</span></label>
        <select
          id="product-category"
          className={inputClass}
          required
          value={categoryValue}
          onChange={(event) => {
            const [category, subcategory = ""] = event.target.value.split("|");
            onChange({ category: (category || "") as Category | "", subcategory: subcategory || null });
          }}
        >
          <option value="">Select Category</option>
          {(Object.keys(CATEGORIES) as Category[]).flatMap((category) =>
            CATEGORIES[category].length === 0
              ? [<option key={category} value={`${category}|`}>{folderLabel(category, null)}</option>]
              : CATEGORIES[category].map((subcategory) => (
                  <option key={`${category}-${subcategory}`} value={`${category}|${subcategory}`}>
                    {folderLabel(category, subcategory)}
                  </option>
                ))
          )}
        </select>

        {/* Image */}
        {previewSrc && (
          <div className="relative mb-2 h-24 w-24">
            {form.imagePreviewUrl ? (
              <img src={form.imagePreviewUrl} alt="Preview" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <ProductPhoto src={previewSrc} alt="Preview" fill sizes="96px" className="object-cover" unoptimized />
            )}
          </div>
        )}
        <label htmlFor="product-image-file" className="mb-1 block text-sm text-muted">Image <span className="text-red-500">*</span></label>
        <div className="mb-3 flex items-center gap-3">
          <input
            id="product-image-file"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="peer sr-only"
            required={!form.imageUrl}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && file.size <= 5 * 1024 * 1024) setImageFileName(file.name);
              else setImageFileName("");
              onImage(file);
            }}
          />
          <label
            htmlFor="product-image-file"
            className="cursor-pointer rounded-sm border border-dashed border-line bg-surface-2 px-4 py-2.5 text-sm text-ink transition-colors hover:border-gold hover:text-gold peer-focus-visible:ring-2 peer-focus-visible:ring-gold"
          >
            {imageFileName ? "Change Image" : "Add Image"}
          </label>
          {imageFileName && <span className="max-w-48 truncate text-sm text-muted">{imageFileName}</span>}
        </div>

        <label htmlFor="product-stock" className="mb-1 block text-sm text-muted">Stock <span className="text-red-500">*</span></label>
        <input id="product-stock" className={inputClass} type="number" min="0" step="1" required value={form.stock} onChange={(e) => onChange({ stock: e.target.value })} placeholder="Stock" />

        <div className="mt-4 flex justify-between gap-2">
          <button
            type="button"
            className="btn-outline"
            onClick={onCancel}
          >
            Cancel
          </button>
          {onDelete && (
            <button type="button" className="btn-outline !border-accent !text-accent" onClick={onDelete}>
              Delete
            </button>
          )}
          <button
            type="submit"
            className="btn"
            disabled={saving}
          >
            {saving ? "Saving..." : onDelete ? "Save" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}
