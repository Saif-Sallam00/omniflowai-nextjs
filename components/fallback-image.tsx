"use client";

import { onImageError } from "@/lib/image-fallback";

export function FallbackImage({
  src,
  alt,
  className,
  loading,
  decoding,
}: {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  decoding?: "async" | "sync" | "auto";
}) {
  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      onError={onImageError}
      className={className}
    />
  );
}
