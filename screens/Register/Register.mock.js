export const INITIAL_STATE = {
  username: "",
  password: "",
  confirmPassword: "",
  email: "",
  phone: "",
  userType: "student",
  code: "",
};

export const USER_TYPES = {
  STUDENT: "student",
  TEACHER: "teacher",
};

export const USER_TYPE_ROLES = {
  student: "student",
  teacher: "lecturer",
};

export const EMAIL_DOMAIN = "@hcmut.edu.vn";

export const STUDENT_CODE_CONFIG = {
  FORMAT: /^\d{7}$/,
  MAX_LENGTH: 7,
  KEYBOARD_TYPE: "numeric",
};

export const VALIDATION_MESSAGES = {
  USERNAME_REQUIRED: "Vui lòng nhập tên đăng nhập",
  PASSWORD_REQUIRED: "Vui lòng nhập mật khẩu",
  CONFIRM_PASSWORD_REQUIRED: "Vui lòng xác nhận mật khẩu",
  PHONE_REQUIRED: "Vui lòng nhập số điện thoại",
  STUDENT_CODE_REQUIRED: "Vui lòng nhập mã sinh viên",
  EMAIL_ERROR: "Email phải kết thúc bằng @hcmut.edu.vn",
  STUDENT_CODE_ERROR: "Mã sinh viên phải là 7 chữ số",
  REGISTER_ERROR: "Đăng ký thất bại. Vui lòng thử lại.",
  REGISTER_SUCCESS: "Đăng ký thành công",
  REGISTER_SUCCESS_DESC: "Tài khoản của bạn đã được tạo thành công!",
};

export const REGISTER_FORM_FIELDS = [
  { key: "username", label: "username", required: true },
  { key: "email", label: "email", required: true, type: "email" },
  { key: "phone", label: "phone", required: true, type: "phone" },
  { key: "userType", label: "accountType", required: true, type: "radio" },
  { key: "code", label: "code", required: true, dynamic: true },
  { key: "password", label: "password", required: true, type: "password" },
  {
    key: "confirmPassword",
    label: "confirmPassword",
    required: true,
    type: "password",
  },
];

export const KEYBOARD_OFFSET_IOS = 0;
export const KEYBOARD_OFFSET_ANDROID = 0;
