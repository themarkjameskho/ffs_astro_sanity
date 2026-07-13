/**
 * Sanity asset helpers — download an image from a remote URL and upload
 * it to the Sanity asset store, returning a ref suitable for embedding
 * in section schemas as `image: { _type: 'image', asset: { _ref: ... } }`.
 *
 * The Sanity client's `assets.upload()` accepts a Node `Buffer`, so we
 * fetch the source URL and pipe through.
 */
export async function uploadImageFromUrl(sanity, url, alt) {
  if (!url) throw new Error('uploadImageFromUrl: no url provided');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image fetch failed: ${url} → ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filename = decodeURIComponent(url.split('/').pop()?.split('?')[0] ?? 'image.jpg');
  const asset = await sanity.assets.upload('image', buffer, { filename });
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
    alt: alt ?? '',
  };
}
