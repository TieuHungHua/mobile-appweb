export const INITIAL_STATE = {
  username: "",
  password: "",
};

export const VALIDATION_MESSAGES = {
  USERNAME_REQUIRED: "Vui lòng nhập tên đăng nhập",
  PASSWORD_REQUIRED: "Vui lòng nhập mật khẩu",
  LOGIN_ERROR: "Đăng nhập thất bại. Vui lòng thử lại.",
};

export const USER_ICON_DIMENSIONS = {
  CIRCLE_SIZE: 100,
  CIRCLE_RADIUS: 50,
  HEAD_SIZE: 32,
  HEAD_RADIUS: 16,
  BODY_WIDTH: 45,
  BODY_HEIGHT: 35,
  BODY_RADIUS: 22,
  HEAD_TOP: 20,
  BODY_TOP: 48,
};

export const BUTTON_STATES = {
  IDLE: "idle",
  LOADING: "loading",
  ERROR: "error",
};

export const LOGIN_CONFIG = {
  KEYBOARD_OFFSET_IOS: 0,
  KEYBOARD_OFFSET_ANDROID: 0,
};

export const ERROR_DISPLAY = {
  BACKGROUND_COLOR: "rgba(255, 68, 68, 0.1)",
  BORDER_RADIUS: 8,
  PADDING: 12,
};
