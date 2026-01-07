export const INITIAL_STATE = {
  notificationsEnabled: true,
  autoUpdateEnabled: false,
};

export const USER_INFO = {
  NAME: "Quang Minh",
  AVATAR_ICON: "person",
};

export const SETTINGS_MENU_ITEMS = [
  {
    id: "editInformation",
    label: "editInformation",
    defaultLabel: "Chỉnh sửa thông tin",
    icon: "chevron-forward",
    navigate: "editInformation",
    type: "button",
  },
  {
    id: "changePassword",
    label: "changePassword",
    defaultLabel: "Thay đổi mật khẩu",
    icon: "chevron-forward",
    navigate: "changePassword",
    type: "button",
  },
  {
    id: "notifications",
    label: "enableReturnNotifications",
    defaultLabel: "Bật thông báo trả sách",
    type: "toggle",
    key: "notificationsEnabled",
  },
  {
    id: "autoUpdate",
    label: "autoUpdate",
    defaultLabel: "Tự động cập nhật",
    type: "toggle",
    key: "autoUpdateEnabled",
  },
];

export const GENERAL_MENU_ITEMS = [
  {
    id: "myBookshelf",
    label: "myBookshelf",
    defaultLabel: "Tủ sách của tôi",
    icon: "chevron-forward",
    navigate: "myBookshelf",
    color: "#9b59b6",
    type: "button",
  },
  {
    id: "bookedRooms",
    label: "bookedRooms",
    defaultLabel: "Phòng đọc đã đặt",
    icon: "chevron-forward",
    navigate: "bookedRooms",
    type: "button",
  },
  {
    id: "aboutUs",
    label: "aboutUs",
    defaultLabel: "Về chúng tôi",
    icon: "chevron-forward",
    navigate: "aboutUs",
    type: "button",
  },
  {
    id: "privacyPolicy",
    label: "privacyPolicy",
    defaultLabel: "Chính sách bảo mật",
    icon: "chevron-forward",
    navigate: "privacyPolicy",
    type: "button",
  },
  {
    id: "faq",
    label: "faq",
    defaultLabel: "Hỗ trợ & Gửi ý kiến",
    icon: "chevron-forward",
    navigate: "faq",
    type: "button",
  },
];

export const SWITCH_COLORS = {
  TRACK_FALSE: "#d3d3d3",
  THUMB: "#fff",
};

export const SECTION_LABELS = {
  ACCOUNT: "accountSettings",
  ACCOUNT_DEFAULT: "Thiết lập tài khoản",
};

export const LOGOUT_ICON = "log-out-outline";
export const SETTINGS_HEADER_ICON = "settings";
export const AVATAR_ICON_SIZE = 32;
export const CHEVRON_ICON_SIZE = 20;
export const LOGOUT_BUTTON_ICON_SIZE = 20;
