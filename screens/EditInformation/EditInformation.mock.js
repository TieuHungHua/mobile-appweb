export const PASSWORD_MIN_LENGTH = 6;
export const GENDER = {
  MALE: "male",
  FEMALE: "female",
};

export const GENDER_OPTIONS = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
];

export const VALIDATION_MESSAGES = {
  FULL_NAME_REQUIRED: "Vui lòng nhập họ và tên",
  PHONE_REQUIRED: "Vui lòng nhập số điện thoại",
  DATE_OF_BIRTH_REQUIRED: "Vui lòng chọn ngày sinh",
  PASSWORD_REQUIRED: "Vui lòng nhập mật khẩu",
  PASSWORD_INCORRECT: "Mật khẩu không đúng",
};

export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: "Đã lưu thông tin thành công",
};

export const PERMISSION_MESSAGES = {
  PERMISSION_NEEDED: "Permission needed",
  PERMISSION_MESSAGE: "We need camera roll permissions to change your avatar",
  IMAGE_PICKER_ERROR: "Failed to pick image. Please try again.",
};
