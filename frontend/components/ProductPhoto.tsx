import Image, { type ImageProps } from "next/image";
import { imageSrc } from "@/lib/products";

type Props = Omit<ImageProps, "src" | "alt"> & { src: string | null | undefined; alt?: string };

/** next/image for product photos; uploaded images are served by our API and skip optimization. */
export default function ProductPhoto({ src, alt, ...rest }: Props) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
  const resolved = src?.startsWith("/backend/") && apiBaseUrl
    ? `${apiBaseUrl}${src}`
    : imageSrc(src);
  return (
    <Image
      src={resolved}
      alt={alt || "Product"}
      unoptimized={resolved.startsWith("/api/")}
      {...rest}
    />
  );
}
