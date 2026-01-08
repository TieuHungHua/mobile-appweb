// Categories data for filtering books
export const BOOK_CATEGORIES = [
  {
    id: "fiction",
    label: "Văn học (Fiction)",
    subcategories: [
      { id: "novel", label: "Tiểu thuyết" },
      { id: "short-story", label: "Truyện ngắn" },
      { id: "poetry", label: "Thơ" },
      { id: "horror", label: "Kinh dị (Horror)" },
      { id: "fantasy", label: "Giả tưởng / Kỳ ảo (Fantasy)" },
      { id: "sci-fi", label: "Khoa học viễn tưởng (Science Fiction / Sci-fi)" },
      { id: "detective", label: "Trinh thám / Hình sự" },
      { id: "romance", label: "Lãng mạn (Romance)" },
      { id: "adventure", label: "Phiêu lưu" },
      { id: "historical-fiction", label: "Lịch sử hư cấu" },
      { id: "realistic-fiction", label: "Văn học hiện thực" },
      { id: "young-adult", label: "Văn học thiếu niên" },
    ],
  },
  {
    id: "non-fiction",
    label: "Phi hư cấu (Non-fiction)",
    subcategories: [
      { id: "autobiography", label: "Tự truyện / Hồi ký" },
      { id: "biography", label: "Tiểu sử" },
      { id: "history", label: "Lịch sử" },
      { id: "science", label: "Khoa học" },
      { id: "business", label: "Kinh doanh / Quản trị" },
      { id: "life-skills", label: "Kỹ năng sống" },
      { id: "self-development", label: "Phát triển bản thân" },
      { id: "psychology", label: "Tâm lý học" },
      { id: "education", label: "Giáo dục" },
      { id: "politics", label: "Chính trị / Xã hội" },
      { id: "philosophy", label: "Triết học" },
    ],
  },
  {
    id: "children",
    label: "Sách Thiếu nhi",
    subcategories: [
      { id: "children-comic", label: "Truyện tranh thiếu nhi" },
      { id: "fairy-tale", label: "Truyện cổ tích" },
      { id: "fable", label: "Truyện ngụ ngôn" },
      { id: "picture-book", label: "Sách tranh (Picture book)" },
      { id: "children-skills", label: "Sách kỹ năng cho trẻ em" },
      { id: "early-education", label: "Sách giáo dục sớm" },
    ],
  },
  {
    id: "academic",
    label: "Sách Giáo dục & Học thuật",
    subcategories: [
      { id: "textbook", label: "Giáo trình" },
      { id: "reference", label: "Sách tham khảo" },
      { id: "exam-prep", label: "Sách luyện thi" },
      { id: "research", label: "Sách nghiên cứu" },
      { id: "monograph", label: "Sách chuyên khảo" },
    ],
  },
  {
    id: "religion",
    label: "Tôn giáo & Tâm linh",
    subcategories: [
      { id: "religious-texts", label: "Kinh sách tôn giáo" },
      { id: "spirituality", label: "Tâm linh" },
      { id: "meditation", label: "Thiền / Chánh niệm" },
      { id: "buddhism", label: "Phật học" },
      { id: "christianity", label: "Kitô giáo" },
      { id: "folk-belief", label: "Tín ngưỡng dân gian" },
    ],
  },
  {
    id: "professional",
    label: "Sách Chuyên ngành & Thực hành",
    subcategories: [
      { id: "cooking", label: "Nấu ăn / Ẩm thực" },
      { id: "art", label: "Nghệ thuật" },
      { id: "music", label: "Âm nhạc" },
      { id: "photography", label: "Nhiếp ảnh" },
      { id: "design", label: "Thiết kế" },
      { id: "architecture", label: "Kiến trúc" },
      { id: "medicine", label: "Y học" },
      { id: "technology", label: "Công nghệ / Lập trình" },
      { id: "economics", label: "Kinh tế" },
      { id: "law", label: "Luật" },
    ],
  },
];

// Flatten all categories and subcategories for easy lookup
export const ALL_CATEGORIES = BOOK_CATEGORIES.reduce((acc, category) => {
  acc.push({ id: category.id, label: category.label, parentId: null });
  category.subcategories.forEach((sub) => {
    acc.push({ id: sub.id, label: sub.label, parentId: category.id });
  });
  return acc;
}, []);

// Get category label by ID
export const getCategoryLabel = (categoryId) => {
  const category = ALL_CATEGORIES.find((c) => c.id === categoryId);
  return category ? category.label : categoryId;
};
