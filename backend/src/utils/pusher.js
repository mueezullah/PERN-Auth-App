import Pusher from "pusher";
import env from "../config/env.js";

let pusherInstance = null;

/**
 * Lazy getter for Pusher client.
 * Returns null if credentials are not configured (prevents crashes in environment setups without Pusher).
 */
export const getPusher = () => {
  if (!pusherInstance) {
    const appId = env.PUSHER_APP_ID;
    const key = env.PUSHER_KEY;
    const secret = env.PUSHER_SECRET;
    const cluster = env.PUSHER_CLUSTER;

    if (!appId || !key || !secret) {
      console.warn(
        "⚠️  Pusher configuration keys are missing! Real-time notifications will be disabled."
      );
      return null;
    }

    pusherInstance = new Pusher({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
    });
  }
  return pusherInstance;
};

/**
 * Helper to trigger Pusher broadcast events safely.
 * @param {string} channel 
 * @param {string} event 
 * @param {any} data 
 */
export const triggerPusherEvent = async (channel, event, data) => {
  const pusher = getPusher();
  if (!pusher) return;

  try {
    await pusher.trigger(channel, event, data);
    console.log(`📡 Broadcasted Pusher Event: Channel="${channel}", Event="${event}"`);
  } catch (error) {
    console.error(
      `❌ Pusher Broadcast failed on Channel="${channel}", Event="${event}":`,
      error.message || error
    );
  }
};
