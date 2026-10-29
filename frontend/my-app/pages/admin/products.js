  // pages/admin/products.js
  "use client";
  import { useState, useEffect, useRef } from "react";
  import { useRouter } from "next/navigation";
  import { BsPerson } from "react-icons/bs";
  import { FaChevronDown } from "react-icons/fa";
  import { AiOutlineHome } from "react-icons/ai";
  import { AiOutlineEdit } from "react-icons/ai"; // Edit icon

  export default function AdminProducts() {
    const router = useRouter();
    const [admin, setAdmin] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef();

    const [products, setProducts] = useState([]);
    const [editProduct, setEditProduct] = useState(null);
    const [addProductOpen, setAddProductOpen] = useState(false); // <-- Add product modal
    const [searchTerm, setSearchTerm] = useState("");

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [shoesOpen, setShoesOpen] = useState(false);
  const [accessoriesOpen, setAccessoriesOpen] = useState(false);

    const [newProduct, setNewProduct] = useState({
      name: "",
      price: "",
      overview: "",
      features: "",
      stylingTip: "",
      folder: "misc",
      image: null,
      stock: "",
    });

    // -----------------------
    // CHECK ADMIN LOGIN
    // -----------------------
    useEffect(() => {
      const currentAdmin = JSON.parse(localStorage.getItem("currentUser") || "null");
      if (!currentAdmin || currentAdmin.is_admin !== 1) {
        router.push("/adminlogin");
      } else {
        setAdmin(currentAdmin);
      }
    }, [router]);

    // -----------------------
    // FETCH PRODUCTS FROM BACKEND
    // -----------------------
    useEffect(() => {
      async function fetchProducts() {
        try {
          const res = await fetch("http://localhost/Backend/CC105Backend/getProducts.php");
          const data = await res.json();
          if (data.success) setProducts(data.products);
        } catch (err) {
          console.error("Error fetching products:", err);
        }
      }
      fetchProducts();
    }, []);


    useEffect(() => {
    // Disable scrolling if either modal is open
    if (addProductOpen || editProduct) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [addProductOpen, editProduct]);


    // -----------------------
    // HANDLE EDIT MODAL CHANGES
    // -----------------------
    const handleEditChange = (field, value) => {
      setEditProduct({ ...editProduct, [field]: value });
    };

    // -----------------------
    // HANDLE NEW PRODUCT CHANGES
    // -----------------------
    const handleNewChange = (field, value) => {
      setNewProduct({ ...newProduct, [field]: value });
    };

    // -----------------------
    // SAVE EDITED PRODUCT TO BACKEND
    // -----------------------
    const saveEdit = async () => {
      if (!editProduct) return;

      let featuresJson = "[]";
      try {
        featuresJson = JSON.stringify(JSON.parse(editProduct.features));
      } catch (e) {
        featuresJson = JSON.stringify([editProduct.features || ""]);
      }

      const payload = {
        id: editProduct.id,
        name: editProduct.name || "",
        price: editProduct.price === "" ? 0 : parseFloat(editProduct.price),
        overview: editProduct.overview || "",
        features: featuresJson,
        stylingTip: editProduct.stylingTip || "",
        folder: editProduct.folder || "",
        image_url: editProduct.image_url || "",
        stock: editProduct.stock === "" ? 0 : parseInt(editProduct.stock),
      };

      try {
        const res = await fetch("http://localhost/Backend/CC105Backend/update_product.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (err) {
          console.error("Server returned non-JSON response:", text);
          alert("Server error. Check console for details.");
          return;
        }

        if (data.success) {
          alert("Product updated successfully!");
          setEditProduct(null);
          // Refresh
          const refreshed = await fetch("http://localhost/Backend/CC105Backend/getProducts.php").then(r => r.json());
          if (refreshed.success) setProducts(refreshed.products);
        } else {
          alert("Update failed: " + data.message);
        }
      } catch (err) {
        console.error("Save Edit Error:", err);
        alert("Update failed due to network or server error");
      }
    };

    // -----------------------
    // ADD NEW PRODUCT
    // -----------------------
    const addProduct = async () => {
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("description", newProduct.overview);
      formData.append("price", newProduct.price);
      formData.append("stock", newProduct.stock);
      formData.append("folder", newProduct.folder);
      formData.append("image", newProduct.image);

      try {
        const res = await fetch("http://localhost/Backend/CC105Backend/add_product.php", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          alert("Product added successfully!");
          setAddProductOpen(false);
          setNewProduct({
            name: "",
            price: "",
            overview: "",
            features: "",
            stylingTip: "",
            folder: "misc",
            image: null,
            stock: "",
          });
          const refreshed = await fetch("http://localhost/Backend/CC105Backend/getProducts.php").then(r => r.json());
          if (refreshed.success) setProducts(refreshed.products);
        } else {
          alert("Add failed: " + data.message);
        }
      } catch (err) {
        console.error("Add Product Error:", err);
        alert("Add failed due to network or server error");
      }
    };


    // -----------------------
    // DELETE PRODUCT FROM FRONTEND
    // -----------------------
    const deleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch("http://localhost/Backend/CC105Backend/delete_product.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Product deleted successfully!");
        setProducts(products.filter((p) => p.id !== id));
        setEditProduct(null);
      } else {
        alert("Delete failed: " + data.message);
      }
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Delete failed due to network or server error");
    }
  };

    // -----------------------
    // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
    // -----------------------
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setDropdownOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // -----------------------
    // FILTER PRODUCTS BASED ON SEARCH
    // -----------------------
    const filteredProducts = products.filter(product => {
      const term = searchTerm.toLowerCase();
      return (
        (product.name && product.name.toLowerCase().includes(term)) ||
        (product.overview && product.overview.toLowerCase().includes(term)) ||
        (product.folder && product.folder.toLowerCase().includes(term))
      );
    });

    return (
      <div className="min-h-screen bg-[#f7f7f7] flex" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
        {/* SIDEBAR */}
        <aside className="fixed left-0 top-0 h-full w-56 bg-white shadow-md pt-28 pb-10">
          <div className="flex flex-col gap-4 px-5">
            {[{ label: "Dashboard", path: "/admindashboard" },
              { label: "Orders", path: "/admin/orders" },
              { label: "Products", path: "/admin/products" },
              { label: "Customers", path: "/admin/customers" },
                ].map((item, idx) => (
                <button key={idx} onClick={() => router.push(item.path)} className="text-left text-lg text-gray-700 py-2 px-3 rounded hover:bg-gray-100 transition cursor-pointer">
                  {item.label}
                </button>
            ))}
          </div>
        </aside>

        {/* TOP NAVBAR */}
        <nav className="bg-white shadow-md w-full fixed top-0 left-0 z-50 pointer-events-none">
          <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center pointer-events-auto">
            <div className="flex items-center font-serif gap-3">
              <button onClick={() => router.push("/")} className="text-black hover:text-gray-700 transition text-2xl flex items-center" title="Go to Home" style={{ backgroundColor: "white", borderRadius: "50%", padding: "4px" }}>
                <AiOutlineHome size={24} />
              </button>
              <span className="text-2xl text-gray-800 font-normal mr-24">Admin Dashboard - Products</span>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-1 transition cursor-pointer">
                <div className="bg-white rounded-full p-1 shadow-md">
                  <BsPerson size={22} className="text-gray-800" />
                </div>
                <FaChevronDown size={14} className={`text-gray-800 transform transition-transform duration-300 ${dropdownOpen ? "rotate-180" : "rotate-0"}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-64 bg-white shadow-lg rounded-lg py-3 px-4 flex flex-col gap-2 z-50">
                  <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 transition">
                    <BsPerson size={18} className="text-gray-800" />
                    <span className="text-black font-normal text-sm tracking-tight">{admin?.email}</span>
                  </div>  
                  <button onClick={() => { localStorage.removeItem("currentUser"); router.push("/adminlogin"); }} className="text-left text-black font-normal hover:bg-gray-100 rounded px-2 py-1 text-sm tracking-tight transition cursor-pointer">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* MAIN CONTENT */}
        <main className="pt-32 px-6 ml-56 w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl text-gray-800">Products</h1>
            <button onClick={() => setAddProductOpen(true)} className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition cursor-pointer">Add Product</button>
          </div>

          {/* SEARCH BAR */}
          <div className="mb-4 flex justify-end">
            <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border border-black rounded px-3 py-2 w-64 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"/>
          </div>

          {/* PRODUCTS TABLE */}
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">ID</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">Name</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">Price</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">Overview</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">Category</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">Stock</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">Product</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300 bg-white text-gray-900">
                {filteredProducts.length === 0 ? (
    <tr>
      <td colSpan="8" className="px-4 py-4 text-center text-gray-500">
        No products found.
      </td>
    </tr>
  ) : (
    filteredProducts.map((product) => {
      // These are now inside the map function block
      const folderPath = product.folder.trim().replace(/\s*>\s*/g, "/"); // remove extra spaces
      const fileName = product.image_url.split("/").pop(); // get just the image filename
      

      return (
        <tr key={product.id} className="hover:bg-gray-100">
          <td className="px-4 py-2">{product.id}</td>
          <td className="px-4 py-2">{product.name}</td>
          <td className="px-4 py-2">₱{product.price}</td>
          <td className="px-4 py-2">{product.overview}</td>
          <td className="px-4 py-2">{product.folder}</td>
          <td className="px-4 py-2">{product.stock}</td>
          <td className="px-4 py-2">
            <img
              src={`http://localhost/Backend/CC105Backend/images/${folderPath}/${fileName}`}
            alt={product.name}
            className="w-12 h-12 object-cover"
          />
          </td>
          <td className="px-4 py-2 flex justify-center">
            <button
              className="bg-white text-black border border-black p-2 rounded hover:bg-gray-100 transition cursor-pointer flex items-center justify-center"
              onClick={() => setEditProduct(product)}
              title="Edit / Delete Product"
            >
              <AiOutlineEdit size={18} />
            </button>
          </td>
        </tr>
      );
    })
  )}

              </tbody>
            </table>
          </div>

          {/* ---------------- ADD PRODUCT MODAL ---------------- */}
  {addProductOpen && (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white border border-black rounded-lg shadow-lg w-96 p-6 max-h-[90vh] overflow-y-auto text-black">
        <h2 className="text-xl font-semibold mb-4">Add Product</h2>

        <input
          className="w-full border border-black px-3 py-2 mb-3 text-black"
          value={newProduct.name}
          onChange={(e) => handleNewChange("name", e.target.value)}
          placeholder="Product Name"
        />
        <input
          className="w-full border border-black px-3 py-2 mb-3 text-black"
          type="number"
          value={newProduct.price}
          onChange={(e) => handleNewChange("price", e.target.value)}
          placeholder="Price"
        />
        <input
          className="w-full border border-black px-3 py-2 mb-3 text-black"
          value={newProduct.overview}
          onChange={(e) => handleNewChange("overview", e.target.value)}
          placeholder="Overview"
        />
        <input
          className="w-full border border-black px-3 py-2 mb-3 text-black"
          value={newProduct.features}
          onChange={(e) => handleNewChange("features", e.target.value)}
          placeholder="Features (JSON if needed)"
        />
        <input
          className="w-full border border-black px-3 py-2 mb-3 text-black"
          value={newProduct.stylingTip}
          onChange={(e) => handleNewChange("stylingTip", e.target.value)}
          placeholder="Styling Tip"
        />

        {/* Category / Folder select with nested sliding options */}
        <div className="relative mb-3">
          <button
            type="button"
            className="w-full border border-black px-3 py-2 text-left text-black rounded"
            onClick={() => setCategoryOpen(!categoryOpen)}
          >
            {newProduct.folder || "Select Category"}
          </button>

          {categoryOpen && (
            <div className="absolute z-50 w-full bg-white border border-black rounded mt-1 shadow-lg">
              {/* Main Categories */}
              <div className="flex flex-col">
                {["Tops", "Bottoms", "Dresses", "Perfumes"].map((cat) => (
                  <button
                    key={cat}
                    className="text-left px-3 py-2 hover:bg-gray-100 transition"
                    onClick={() => {
                      handleNewChange("folder", cat);
                      setCategoryOpen(false);
                    }}
                  >
                    {cat}
                  </button>
                ))}

                {/* Shoes nested options */}
                <div className="relative">
                  <button
                    className="text-left px-3 py-2 hover:bg-gray-100 transition w-full flex justify-between items-center"
                    onClick={() => setShoesOpen(!shoesOpen)}
                  >
                    Shoes
                    <span>{shoesOpen ? "▲" : "▼"}</span>
                  </button>
                  {shoesOpen && (
                    <div className="flex flex-col ml-4 border-l border-gray-300">
                      {["Sandals", "Flats", "Heels"].map((sub) => (
                        <button
                          key={sub}
                          className="text-left px-3 py-2 hover:bg-gray-100 transition"
                          onClick={() => {
                            handleNewChange("folder", `Shoes > ${sub}`);
                            setCategoryOpen(false);
                            setShoesOpen(false);
                          }}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Accessories nested options */}
                <div className="relative">
                  <button
                    className="text-left px-3 py-2 hover:bg-gray-100 transition w-full flex justify-between items-center"
                    onClick={() => setAccessoriesOpen(!accessoriesOpen)}
                  >
                    Accessories
                    <span>{accessoriesOpen ? "▲" : "▼"}</span>
                  </button>
                  {accessoriesOpen && (
                    <div className="flex flex-col ml-4 border-l border-gray-300">
                      {["Handbags", "Necklace", "Rings", "Bracelets", "Earrings"].map((sub) => (
                        <button
                          key={sub}
                          className="text-left px-3 py-2 hover:bg-gray-100 transition"
                          onClick={() => {
                            handleNewChange("folder", `Accessories > ${sub}`);
                            setCategoryOpen(false);
                            setAccessoriesOpen(false);
                          }}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Image input */}
        <input
          type="file"
          className="w-full border border-black px-3 py-2 mb-3 text-black"
          onChange={(e) => handleNewChange("image", e.target.files[0])}
        />

        <input
          className="w-full border border-black px-3 py-2 mb-3 text-black"
          type="number"
          value={newProduct.stock}
          onChange={(e) => handleNewChange("stock", e.target.value)}
          placeholder="Stock"
        />

        <div className="flex justify-between mt-4 gap-2">
          <button
            className="px-4 py-2 bg-white text-black border border-black rounded hover:bg-gray-100 transition cursor-pointer"
            onClick={() => setAddProductOpen(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition cursor-pointer"
            onClick={addProduct}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )}


          {/* ---------------- EDIT / DELETE MODAL ---------------- */}
          {editProduct && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-white border border-black rounded-lg shadow-lg w-96 p-6 max-h-[90vh] overflow-y-auto text-black">
                <h2 className="text-xl font-semibold mb-4">Edit / Delete Product</h2>

                <input className="w-full border border-black px-3 py-2 mb-3 text-black" value={editProduct.name} onChange={(e)=>handleEditChange("name", e.target.value)} placeholder="Product Name"/>
                <input className="w-full border border-black px-3 py-2 mb-3 text-black" type="number" value={editProduct.price} onChange={(e)=>handleEditChange("price", e.target.value)} placeholder="Price"/>
                <input className="w-full border border-black px-3 py-2 mb-3 text-black" value={editProduct.overview} onChange={(e)=>handleEditChange("overview", e.target.value)} placeholder="Overview"/>
                <input className="w-full border border-black px-3 py-2 mb-3 text-black" value={editProduct.features || ""} onChange={(e)=>handleEditChange("features", e.target.value)} placeholder="Features (JSON if needed)"/>
                <input className="w-full border border-black px-3 py-2 mb-3 text-black" value={editProduct.stylingTip || ""} onChange={(e)=>handleEditChange("stylingTip", e.target.value)} placeholder="Styling Tip"/>
                <input className="w-full border border-black px-3 py-2 mb-3 text-black" value={editProduct.folder} onChange={(e)=>handleEditChange("folder", e.target.value)} placeholder="Folder"/>
                <input className="w-full border border-black px-3 py-2 mb-3 text-black" value={editProduct.image_url} onChange={(e)=>handleEditChange("image_url", e.target.value)} placeholder="Image filename"/>
                <input className="w-full border border-black px-3 py-2 mb-3 text-black" type="number" value={editProduct.stock} onChange={(e)=>handleEditChange("stock", e.target.value)} placeholder="Stock"/>

                <div className="flex justify-between mt-4 gap-2">
                  <button className="px-4 py-2 bg-white text-black border border-black rounded hover:bg-gray-100 transition cursor-pointer" onClick={()=>setEditProduct(null)}>Cancel</button>
                  <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition cursor-pointer" onClick={()=>deleteProduct(editProduct.id)}>Delete</button>
                  <button className="px-4 py-2 bg-white text-black border border-black rounded hover:bg-gray-100 transition cursor-pointer" onClick={saveEdit}>Save</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }
