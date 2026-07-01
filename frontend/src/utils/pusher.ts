/// <reference types="vite/client" />
import Pusher from "pusher-js";

let pusherInstance: Pusher | null = null;

/**
 * Lazy getter for Pusher client singleton.
 * Returns null if the VITE_PUSHER_KEY is not configured (fails gracefully without crashing the app).
 */
export function getPusher(): Pusher | null {
  if (pusherInstance) return pusherInstance;

  const key = import.meta.env.VITE_PUSHER_KEY;
  const cluster = import.meta.env.VITE_PUSHER_CLUSTER;

  if (!key) {
    console.warn(
      "⚠️  VITE_PUSHER_KEY is not defined. Real-time updates will be disabled."
    );
    return null;
  }

  pusherInstance = new Pusher(key, {
    cluster,
    forceTLS: true,
  });

  return pusherInstance;
}
