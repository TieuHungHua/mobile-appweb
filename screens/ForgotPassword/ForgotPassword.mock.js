export const INITIAL_STATE = {
  email: "",
};

export const EMAIL_VALIDATION = {
  MIN_LENGTH: 3,
  REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

export const VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: "Vui lòng nhập email hoặc tên đăng nhập",
  EMAIL_INVALID: "Email không hợp lệ",
};

export const SUCCESS_MESSAGES = {
  RESET_SENT: "Email đặt lại mật khẩu đã được gửi",
  RESET_SENT_DESC: "Vui lòng kiểm tra hộp thư của bạn",
};

export const ACTION_TYPES = {
  SEND_RESET: "SEND_RESET",
  RESET_SENT: "RESET_SENT",
  RESET_FAILED: "RESET_FAILED",
};
