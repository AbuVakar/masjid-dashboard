// A simple event emitter for notifications
const events = new EventTarget();

/**
 * Dispatches a notification event.
 * This can be called from anywhere in the application.
 * @param {string} message - The notification message.
 * @param {object} [options={}] - The notification options.
 * @param {string} [options.type='info'] - The type of notification ('info', 'success', 'warning', 'error').
 * @param {number} [options.duration=5000] - The duration in milliseconds.
 */
export const notify = (message, options = {}) => {
  events.dispatchEvent(new CustomEvent('show_notification', { detail: { message, options } }));
};

export default events;
