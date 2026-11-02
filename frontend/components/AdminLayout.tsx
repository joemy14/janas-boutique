import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import ProfileDropdown from "@/components/ProfileDropdown";
import ThemeToggle from "@/components/ThemeToggle";
import Wordmark from "@/components/Wordmark";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/admindashboard" },
  { label: "Orders", path: "/admin/orders" },
  { label: "Products", path: "/admin/products" },
  { label: "Customers", path: "/admin/customers" },
];
const STAFF_SALES_ITEM = { label: "In-store sales", path: "/admin/staffsales" };

/**
 * Sidebar + top bar shared by admin pages. Redirects unauthorized users to
 * the admin login (the API routes enforce this server-side too).
 */
export default function AdminLayout({ title = "Admin Dashboard", children }: { title?: string; children: ReactNode }) {
  const router = useRouter();
  const { currentUser, loading, logout } = useAuth();
  const isAdmin = !!currentUser?.isAdmin || currentUser?.role === "admin";
  const isStaff = currentUser?.role === "staff";
  const canAccessAdminArea = isAdmin || isStaff;
  const navItems = isAdmin ? [...NAV_ITEMS, STAFF_SALES_ITEM] : isStaff ? [STAFF_SALES_ITEM] : [];
  const reportItems = [
    { label: "Low Stock", path: "/admin/reports/low-stock", visible: canAccessAdminArea },
    { label: "Sales", path: "/admin/reports/sales", visible: isAdmin },
    { label: "Top Products", path: "/admin/reports/top-products", visible: isAdmin },
  ].filter((item) => item.visible);

  useEffect(() => {
    if (!loading && !canAccessAdminArea) router.replace("/adminlogin");
  }, [loading, canAccessAdminArea, router]);

  if (!canAccessAdminArea) return null;

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 flex h-full w-60 flex-col border-r border-line bg-surface">
        <Link href="/admindashboard" className="flex justify-center border-b border-line py-6" aria-label="Dashboard">
          <Wordmark size="sm" />
        </Link>
        <nav className="flex flex-col gap-1 px-4 py-6">
          {navItems.map((item) => {
            const active = router.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`rounded-sm border-l-2 px-4 py-2.5 font-display text-lg transition-colors ${
                  active ? "border-gold bg-surface-2 text-ink" : "border-transparent text-muted hover:bg-surface-2 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {reportItems.length > 0 && (
            <div className="mt-5">
              <p className="px-4 pb-2 font-display text-xs font-semibold tracking-[0.2em] text-muted uppercase">
                Reports
              </p>
              {reportItems.map((item) => {
                const active = router.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`block rounded-sm border-l-2 px-4 py-2.5 font-display text-lg transition-colors ${
                      active ? "border-gold bg-surface-2 text-ink" : "border-transparent text-muted hover:bg-surface-2 hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>
      </aside>

      {/* Top bar */}
      <header className="fixed top-0 right-0 left-60 z-40 flex items-center justify-between border-b border-line bg-paper/90 px-8 py-5 backdrop-blur-md">
        <div>
          <p className="eyebrow !text-[0.65rem]">Admin</p>
          <h1 className="font-display text-2xl font-medium">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <ProfileDropdown email={currentUser?.email} onSignOut={() => logout("/adminlogin")} />
        </div>
      </header>

      <main className="ml-60 w-full px-8 pt-32 pb-16">{children}</main>
    </div>
  );
}
