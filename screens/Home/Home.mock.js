export const mockFeatured = [
  { title: "Cây cam ngọt của tôi" },
  { title: "Harry Potter" },
  { title: "Doraemon" },
  { title: "Sherlock Holmes" },
];

export const mockReading = [
  { title: "Sapiens", progress: 0.55 },
  { title: "Atomic Habits", progress: 0.32 },
];

export const mockMonthlyStats = [
  { month: "T1", borrowed: 8, returned: 6 },
  { month: "T2", borrowed: 10, returned: 9 },
  { month: "T3", borrowed: 7, returned: 5 },
  { month: "T4", borrowed: 12, returned: 11 },
  { month: "T5", borrowed: 9, returned: 7 },
];

export const mockQuickActions = [
  { icon: "qr-code-outline", labelKey: "quickScan", navigateKey: "scan" },
  {
    icon: "card-outline",
    labelKey: "quickLibraryCard",
    navigateKey: "libraryCard",
  },
  {
    icon: "calendar-outline",
    labelKey: "quickRoomBooking",
    navigateKey: "roomBooking",
  },
  { icon: "star-outline", labelKey: "quickFavorite", navigateKey: "favorite" },
];

export const CATEGORIES = [
  { label: "Tiểu thuyết", color: "#2ecc71" },
  { label: "Kinh tế", color: "#f1c40f" },
  { label: "Khoa học", color: "#3498db" },
  { label: "Công nghệ", color: "#e74c3c" },
  { label: "Phổ biến", color: "#9b59b6" },
];

export const INITIAL_RECENT_SEARCHES = [
  "lịch sử tìm kiếm",
  "Harry Potter",
  "Kinh tế",
  "Công nghệ AI",
];

export const CHART_CONFIG = {
  MAX_VALUE: 12,
  MIN_BAR_HEIGHT: 6,
  MAX_BAR_HEIGHT: 80,
};

export const STAT_INITIAL = {
  borrowed: 3,
  overdue: 1,
};

export const GREETING = "Xin chào, Quang Minh 👋👋";

export const mockRewardPoints = {
  currentPoints: 1250,
  currentRank: "Hạng Vàng",
  rankIcon: "trophy",
  ranking: "Top 15 toàn trường",
  nextRankPoints: 250,
  progress: 0.83, // 1250 / 1500 = 83% (cần 1500 để lên hạng tiếp theo)
};

export const mockForYou = {
  title: "Dành cho bạn",
  viewAllText: "Xem tất cả",
  roomBooking: {
    title: "Đặt phòng họp nhóm",
    description: "Không gian yên tĩnh, trang thiết bị hiện đại",
  },
};
