// components/Breadcrumb.js
import Link from "next/link";

export default function Breadcrumb({ paths }) {
  if (!paths || paths.length === 0) return null; // Hide breadcrumb if no paths

  return (
    <nav className="my-4" aria-label="Breadcrumb">
      <ol className="list-reset flex items-center text-lg">
        {paths.map((path, index) => (
          <li key={index} className="flex items-center">
            {index !== 0 && (
              <span
                className="mx-2 select-none"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                {" > "}
              </span>
            )}
            {index === 0 ? (
              <Link href="/">
                <span
                  className="text-white hover:text-black transition-colors duration-200 cursor-pointer"
                  style={{ fontFamily: "Times New Roman, serif", textDecoration: "none" }}
                >
                  {path}
                </span>
              </Link>
            ) : (
              <span
                style={{
                  fontFamily: "Times New Roman, serif",
                  color: "#B0B0B0", 
                  textDecoration: "none",
                }}
              >
                {path}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
