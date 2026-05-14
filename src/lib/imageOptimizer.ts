/**
 * Image Optimizer Utility
 * Generates optimized Sanity image URLs with proper quality, sizing, and format parameters
 */
import { createImageUrlBuilder } from '@sanity/image-url';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'pjpg' | 'png' | 'gif';
  fit?: 'crop' | 'scale' | 'max' | 'fill';
}

export interface SanityImageSource {
  asset?: { _ref?: string; _id?: string; _type?: string; url?: string };
  crop?: { top: number; bottom: number; left: number; right: number };
  hotspot?: { x: number; y: number; height: number; width: number };
  url?: string;
}

export interface SanityImageOptions extends ImageOptimizationOptions {
  crop?: 'center' | 'focalpoint' | 'entropy' | 'top' | 'bottom' | 'left' | 'right';
}

type HeroSideImageSize = 'default' | 'large' | undefined;

const sanityProjectId = import.meta.env.SANITY_PROJECT_ID;
const sanityDataset = import.meta.env.SANITY_DATASET;
const sanityImageBuilder =
  sanityProjectId && sanityDataset
    ? createImageUrlBuilder({ projectId: sanityProjectId, dataset: sanityDataset })
    : null;

/**
 * Optimizes a Sanity image URL for web delivery
 * Prevents pixelation by using appropriate quality and sizing parameters
 * 
 * @param imageUrl - The image URL from Sanity
 * @param options - Optimization options
 * @returns Optimized image URL
 */
export function optimizeImageUrl(
  imageUrl: string | undefined,
  options: ImageOptimizationOptions = {}
): string {
  if (!imageUrl) return '';

  // Ensure URL is from Sanity CDN
  if (!imageUrl.includes('cdn.sanity.io')) {
    return imageUrl;
  }

  const {
    width = 1920,
    height = 1080,
    quality = 75,
    format = 'webp',
    fit = 'crop'
  } = options;

  // Build query parameters for optimization
  const params = new URLSearchParams();

  if (width && width > 0) params.append('w', width.toString());
  if (height && height > 0) params.append('h', height.toString());
  if (quality && quality > 0) params.append('q', quality.toString());
  if (format) params.append('fm', format);
  if (fit) params.append('fit', fit);

  // Ensure URL doesn't already have query params, then append
  const separator = imageUrl.includes('?') ? '&' : '?';
  return `${imageUrl}${separator}${params.toString()}`;
}

/**
 * Builds a Sanity image URL that respects hotspot/crop metadata.
 */
export function buildSanityImageUrl(
  image: SanityImageSource | undefined,
  options: SanityImageOptions = {}
): string {
  if (!image) return '';

  if (!sanityImageBuilder) {
    return image.asset?.url ?? image.url ?? '';
  }

  try {
    const { width, height, quality, fit, format, crop } = options;
    let builder = sanityImageBuilder.image(image);

    if (format) {
      builder = builder.format(format as any);
    } else {
      builder = builder.auto('format');
    }

    if (width && width > 0) builder = builder.width(width);
    if (height && height > 0) builder = builder.height(height);
    if (quality && quality > 0) builder = builder.quality(quality);
    if (fit) builder = builder.fit(fit);
    if (crop) builder = builder.crop(crop);

    return builder.url() ?? image.asset?.url ?? '';
  } catch {
    return image.asset?.url ?? image.url ?? '';
  }
}

/**
 * Gets responsive image sizes for different breakpoints
 * Used to prevent pixelation by providing correct resolution for each screen size
 */
export function getResponsiveImageUrl(
  imageUrl: string | undefined,
  screenWidth: 'mobile' | 'tablet' | 'desktop',
  options: ImageOptimizationOptions = {}
): string {
  if (!imageUrl) return '';

  // Default sizes for each breakpoint - reduced mobile dimensions for faster loading
  const sizes = {
    mobile: { width: 400, height: 280 },
    tablet: { width: 768, height: 512 },
    desktop: { width: 1920, height: 1080 }
  };

  const screenSize = sizes[screenWidth];

  return optimizeImageUrl(imageUrl, {
    width: screenSize.width,
    height: screenSize.height,
    quality: screenWidth === 'mobile' ? 60 : screenWidth === 'tablet' ? 70 : 80,
    format: 'webp',
    fit: 'crop',
    ...options
  });
}

/**
 * Generates a high-quality URL for hero background images
 * Prevents pixelation by using optimal quality settings
 */
const resolveHeroImageUrl = (
  source: string | SanityImageSource | undefined,
  options: ImageOptimizationOptions
): string => {
  if (!source) return '';
  if (typeof source === 'string') {
    return optimizeImageUrl(source, options);
  }
  return buildSanityImageUrl(source, options);
};

/**
 * Shared quality values for hero images to ensure preload/render consistency.
 */
function getSharedHeroQuality(width: number): number {
  if (width <= 320) return 32;
  if (width <= 480) return 38;
  if (width <= 640) return 40;
  if (width <= 900) return 44;
  if (width <= 1200) return 50;
  return 60;
}

export function getHeroBackgroundUrl(
  source: string | SanityImageSource | undefined,
  layout: 'twoColumn' | 'singleColumn' = 'singleColumn',
  format?: ImageOptimizationOptions['format']
): string {
  if (!source) return '';

  // Optimized for performance: balanced quality for clarity without excess file size
  const options: ImageOptimizationOptions = {
    width: 900,
    height: 506,
    quality: getSharedHeroQuality(900),
    fit: 'crop'
  };

  if (format) {
    options.format = format;
  } else {
    options.format = 'webp';
  }

  return resolveHeroImageUrl(source, options);
}

/**
 * Creates srcset string for responsive images
 * Allows browser to choose best resolution for device
 */
export function createImageSrcSet(
  imageUrl: string | undefined,
  widths: number[] = [480, 768, 1024, 1366, 1920]
): string {
  if (!imageUrl) return '';

  return widths
    .map(width => {
      // Reduce quality for smaller viewports (mobile/tablet) - more aggressive for performance
      const quality = width <= 480 ? 60 : width <= 768 ? 65 : width <= 1024 ? 75 : 80;
      const url = optimizeImageUrl(imageUrl, {
        width,
        quality,
        format: 'webp'
      });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Prevents pixelation by ensuring image is not stretched beyond natural resolution
 * Returns proper max-width constraint
 */
export function getMaxImageWidth(
  naturalWidth: number | undefined,
  viewportWidth: number = 1920
): number {
  if (!naturalWidth) return viewportWidth;
  // Never scale image beyond 120% of natural width
  return Math.min(naturalWidth * 1.2, viewportWidth);
}

/**
 * Gets optimized URL for thumbnail/placeholder images
 * Useful for LQIP (Low Quality Image Placeholder) strategy
 */
export function getThumbnailUrl(imageUrl: string | undefined): string {
  if (!imageUrl) return '';

  return optimizeImageUrl(imageUrl, {
    width: 100,
    height: 100,
    quality: 60,
    format: 'webp',
    fit: 'crop'
  });
}

/**
 * Optimizes small icon images (e.g., service grid icons)
 * Icons are typically 512x512 but displayed much smaller
 */
export function getIconUrl(
  imageUrl: string | undefined,
  displayWidth: number = 77
): string {
  if (!imageUrl) return '';

  // Use 1.5x for better quality on high-DPI screens without excessive size
  const width = Math.round(displayWidth * 1.5);
  return optimizeImageUrl(imageUrl, {
    width,
    height: width,
    quality: 75,
    format: 'webp',
    fit: 'scale'
  });
}

/**
 * Optimizes logo/header images with responsive sizing
 * Prevents unused pixels and reduces download size
 */
export function getLogoUrl(
  imageUrl: string | undefined,
  displayWidth: number = 200
): string {
  if (!imageUrl) return '';

  // Use 2x for better quality on high-DPI screens
  const width = displayWidth * 2;
  return optimizeImageUrl(imageUrl, {
    width,
    quality: 90,
    format: 'webp',
    fit: 'scale'
  });
}

/**
 * Creates optimized srcset for flexible images that change size per breakpoint
 * Used for two-column gallery and other flexible layouts
 */
export function createFlexibleImageSrcSet(
  imageUrl: string | undefined,
  displaySizes: { mobile: number; tablet: number; desktop: number },
  quality: number = 85
): string {
  if (!imageUrl) return '';

  // Generate URLs for each breakpoint (using 2x for better quality on high-DPI)
  // Reduce quality more aggressively for mobile (smaller screens, less noticeable)
  const mobileUrl = optimizeImageUrl(imageUrl, {
    width: displaySizes.mobile * 2,
    quality: Math.max(65, quality - 15),
    format: 'webp'
  });

  const tabletUrl = optimizeImageUrl(imageUrl, {
    width: displaySizes.tablet * 2,
    quality: Math.max(70, quality - 10),
    format: 'webp'
  });

  const desktopUrl = optimizeImageUrl(imageUrl, {
    width: displaySizes.desktop * 2,
    quality,
    format: 'webp'
  });

  return `${mobileUrl} 480w, ${tabletUrl} 768w, ${desktopUrl} 1920w`;
}

/**
 * Creates hero image srcset with responsive sizing and optimal compression
 * Ensures LCP image loads quickly across all devices
 */
export function getHeroImageSrcSet(
  source: string | SanityImageSource | undefined,
  format?: ImageOptimizationOptions['format']
): string {
  if (!source) return '';

  const buildOptions = (width: number, height: number, quality: number): ImageOptimizationOptions => {
    const options: ImageOptimizationOptions = {
      width,
      height,
      quality,
      fit: 'crop'
    };
    if (format) {
      options.format = format;
    } else {
      options.format = 'webp';
    }
    return options;
  };

  const mobileUrl = resolveHeroImageUrl(source, buildOptions(320, 426, getSharedHeroQuality(320)));
  const tabletUrl = resolveHeroImageUrl(source, buildOptions(640, 360, getSharedHeroQuality(640)));
  const desktopUrl = resolveHeroImageUrl(source, buildOptions(900, 506, getSharedHeroQuality(900)));

  return `${mobileUrl} 320w, ${tabletUrl} 640w, ${desktopUrl} 900w`;
}

export function getHeroSideImageConfig(sideImageSize: HeroSideImageSize) {
  const isLarge = sideImageSize === 'large';

  return {
    size: isLarge ? 600 : 400,
    sizes: isLarge
      ? '(max-width: 640px) 70vw, (max-width: 1024px) 50vw, 600px'
      : '(max-width: 640px) 70vw, (max-width: 1024px) 45vw, 400px',
    widths: isLarge ? [320, 480, 600, 900, 1200] : [240, 320, 400, 600, 800]
  };
}

export function getHeroSideImageUrl(
  source: SanityImageSource | undefined,
  sideImageSize?: HeroSideImageSize
): string {
  if (!source) return '';

  const { size } = getHeroSideImageConfig(sideImageSize);

  return buildSanityImageUrl(source, {
    width: size,
    height: size,
    quality: getSharedHeroQuality(size),
    fit: 'crop'
  });
}

export function getHeroSideImageSrcSet(
  source: SanityImageSource | undefined,
  sideImageSize?: HeroSideImageSize
): string {
  if (!source) return '';

  const { widths } = getHeroSideImageConfig(sideImageSize);

  return widths
    .map((width) => {
      const url = buildSanityImageUrl(source, {
        width,
        height: width,
        quality: getSharedHeroQuality(width),
        fit: 'crop'
      });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Returns WebP URL for local icons, falling back to PNG
 * Used for /public/images/* files
 * 
 * @param imagePath - The local image path (e.g., '/images/icon.png')
 * @returns Object with webp and png URLs
 */
export function getLocalIconUrls(imagePath: string | undefined): { webp: string; png: string } {
  if (!imagePath) return { webp: '', png: '' };

  const pngUrl = imagePath;
  const webpUrl = imagePath.replace('.png', '.webp');

  return { webp: webpUrl, png: pngUrl };
}
