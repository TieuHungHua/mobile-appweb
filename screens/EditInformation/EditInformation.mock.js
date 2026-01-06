export const PASSWORD_MIN_LENGTH = 6;
export const GENDER = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
};

export const GENDER_OPTIONS = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
];

export const MAJOR_OPTIONS = [
  { value: "Kỹ thuật Máy tính", label: "Kỹ thuật Máy tính" },
  { value: "Khoa học Máy tính", label: "Khoa học Máy tính" },
  { value: "Kỹ thuật Cơ khí", label: "Kỹ thuật Cơ khí" },
  { value: "Kỹ thuật Điện-Điện tử-Tự động hóa", label: "Kỹ thuật Điện-Điện tử-Tự động hóa" },
  { value: "Kỹ thuật Xây dựng (Giao thông, Thủy, Công trình biển, Hạ tầng)", label: "Kỹ thuật Xây dựng (Giao thông, Thủy, Công trình biển, Hạ tầng)" },
  { value: "Kỹ thuật Hóa học", label: "Kỹ thuật Hóa học" },
  { value: "Công nghệ Vật liệu", label: "Công nghệ Vật liệu" },
  { value: "Dệt-May", label: "Dệt-May" },
  { value: "Logistics", label: "Logistics" },
  { value: "Kỹ thuật Môi trường", label: "Kỹ thuật Môi trường" },
  { value: "Khoa học Môi trường", label: "Khoa học Môi trường" },
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
