// Removes the pages and data the service worker saved for offline use.
// Called on sign out (and when the session expires) so nothing private stays on the device.
export async function clearOfflineData(): Promise<void> {
  if (typeof caches === "undefined") return;
  try {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith("api-") || key.startsWith("pages-"))
        .map((key) => caches.delete(key))
    );
  } catch {
    // Cache storage can be unavailable (private mode); nothing to clear then
  }
}
