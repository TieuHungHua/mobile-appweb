// Chat status constants
export const CHAT_STATUS = {
  CONNECTING: "connecting",
  CONNECTED: "connected",
  ERROR: "error",
  CLOSED: "closed",
};

// Typing indicator timeout (milliseconds)
export const TYPING_TIMEOUT = 3000;

// Message types
export const MESSAGE_TYPE = {
  TEXT: "text",
  SYSTEM: "system",
};

/**
 * Get status label and color based on connection status and admin presence
 */
export const getStatusInfo = (status, adminPresence, strings) => {
  let label = "";
  let color = "#95a5a6";

  if (status === CHAT_STATUS.CONNECTED) {
    if (adminPresence?.online) {
      label = strings?.chatStatusOnline || "Online";
      color = "#2ecc71";
    } else {
      label = strings?.chatStatusOffline || "Offline";
      color = "#95a5a6";
    }
  } else if (status === CHAT_STATUS.CONNECTING) {
    label = strings?.chatStatusConnecting || "Đang kết nối...";
    color = "#f1c40f";
  } else {
    label = strings?.chatStatusOffline || "Ngoại tuyến";
    color = "#e74c3c";
  }

  return { label, color };
};
