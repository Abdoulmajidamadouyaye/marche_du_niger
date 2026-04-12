/**
 * Image optimization utilities for mobile-first experiences
 */

/**
 * Preload critical images for better perceived performance
 */
export function preloadCriticalImages(imageUrls: string[]): void {
  if (typeof window === "undefined") return;

  imageUrls.forEach((url) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Get optimized image URL with size hints for responsive loading
 */
export function getOptimizedImageUrl(
  url: string
): string {
  // For base64 data URLs, return as-is
  if (url.startsWith("data:")) {
    return url;
  }

  // For relative paths or external URLs, return as-is (handled by Next.js Image)
  return url;
}

/**
 * Get srcSet for responsive images
 */
export function getResponsiveSrcSet(
  url: string,
  sizes: { width: number; density: string }[] = [
    { width: 320, density: "1x" },
    { width: 640, density: "2x" },
  ]
): string {
  if (url.startsWith("data:")) {
    return url;
  }

  return sizes.map(({ density }) => `${url} ${density}`).join(", ");
}

/**
 * Calculate image priority based on viewport position
 */
export function getImageLoadingPriority(index: number): "eager" | "lazy" {
  // Eager load first 2 images, lazy load the rest
  return index < 2 ? "eager" : "lazy";
}

/**
 * Generate image placeholder for skeleton loading
 */
export function generatePlaceholder(width: number, height: number): string {
  // Return a simple solid color placeholder
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect fill='%23f3f4f6' width='${width}' height='${height}'/%3E%3C/svg%3E`;
}
