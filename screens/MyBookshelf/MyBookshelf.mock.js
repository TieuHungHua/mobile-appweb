export const mockBorrowedBooks = [
  {
    id: 1,
    title: "Pax Journey Home",
    author: "Sara Pennypacker",
    cover: null,
    expirationDate: "22-11-2005",
    daysLeft: 1,
    status: "active",
  },
  {
    id: 2,
    title: "Me Before You",
    author: "Jojo Moyes",
    cover: null,
    expirationDate: "12-11-2005",
    daysLeft: 5,
    status: "active",
  },
  {
    id: 3,
    title: "Me Before You",
    author: "Jojo Moyes",
    cover: null,
    expirationDate: "12-11-3025",
    daysLeft: -10,
    status: "expired",
  },
];

export const mockFavoriteBooks = [
  {
    id: 1,
    title: "All The Light We Cannot See",
    author: "Anthony Doerr",
    cover: null,
  },
  {
    id: 2,
    title: "The Girl Who Drank The Moon",
    author: "Kelly Barnhill",
    cover: null,
  },
  {
    id: 3,
    title: "Atomic Habits",
    author: "James Clear",
    cover: null,
  },
];

export const mockSavedBooks = [
  {
    id: 1,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    cover: null,
  },
  {
    id: 2,
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt",
    cover: null,
  },
  {
    id: 3,
    title: "Clean Code",
    author: "Robert C. Martin",
    cover: null,
  },
];

export const TABS = {
  BORROWED: "borrowed",
  FAVORITES: "favorites",
  SAVED: "saved",
};

export const TAB_LABELS = [
  { key: TABS.BORROWED, label: "borrowed" },
  { key: TABS.FAVORITES, label: "favorites" },
  { key: TABS.SAVED, label: "saved" },
];

export const STATUS_COLORS = {
  EXPIRED: "#e74c3c",
  WARNING: "#f39c12",
  ACTIVE: "#2ecc71",
  RENEW: "#17a2b8",
};

export const STATUS_THRESHOLD = {
  WARNING_DAYS: 3,
  ONE_DAY: 1,
};

export const INITIAL_STATE = {
  activeTab: TABS.BORROWED,
  searchQuery: "",
  showSearch: false,
};

export const BOOK_COVER_DIMENSIONS = {
  WIDTH: 80,
  HEIGHT: 110,
};
