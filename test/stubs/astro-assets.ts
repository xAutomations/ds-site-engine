/**
 * Stub for the `astro:assets` virtual module.
 *
 * src/lib/assets.ts imports getImage at module scope, so importing it in a unit
 * test pulls in a module that only exists inside an Astro build. The resolver under
 * test never calls getImage — it only inspects glob keys — so the stub exists to
 * satisfy the import, not to simulate image processing.
 */
export async function getImage(options: { src: unknown; width?: number; format?: string }) {
  return {
    src: `/_stub/${String(options.format ?? 'webp')}-${options.width ?? 0}`,
    attributes: { width: options.width ?? 0, height: 0 },
  };
}
