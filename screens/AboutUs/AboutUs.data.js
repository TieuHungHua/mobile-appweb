export const aboutSections = [
  {
    title: "Giới thiệu",
    content:
      "Thư viện Đại học Bách Khoa TP.HCM là một trong những thư viện lớn và hiện đại nhất tại Việt Nam, phục vụ hàng chục nghìn sinh viên, giảng viên và nhân viên của trường. Chúng tôi cam kết cung cấp nguồn tài liệu phong phú và dịch vụ thư viện chất lượng cao.",
  },
  {
    title: "Sứ mệnh",
    content:
      "Sứ mệnh của chúng tôi là:\n\n• Cung cấp nguồn tài liệu học thuật đa dạng và cập nhật\n• Hỗ trợ nghiên cứu và học tập của sinh viên, giảng viên\n• Xây dựng môi trường học tập hiện đại và thân thiện\n• Phát triển văn hóa đọc trong cộng đồng\n• Áp dụng công nghệ tiên tiến để nâng cao trải nghiệm người dùng",
  },
  {
    title: "Tầm nhìn",
    content:
      "Trở thành thư viện số hàng đầu tại Việt Nam, là nơi kết nối tri thức, thúc đẩy sáng tạo và nghiên cứu khoa học, góp phần xây dựng một cộng đồng học thuật phát triển bền vững.",
  },
  {
    title: "Dịch vụ",
    content:
      "Chúng tôi cung cấp các dịch vụ:\n\n• Mượn/trả sách trực tuyến\n• Tìm kiếm và tra cứu tài liệu\n• Đọc sách điện tử (e-book)\n• Phòng đọc và không gian học tập\n• Hỗ trợ nghiên cứu và tư vấn thông tin\n• Đào tạo kỹ năng thông tin\n• Dịch vụ photocopy và in ấn",
  },
  {
    title: "Bộ sưu tập",
    content:
      "Thư viện sở hữu:\n\n• Hơn 500,000 đầu sách in\n• Hơn 50,000 tài liệu điện tử\n• Hàng nghìn tạp chí khoa học\n• Cơ sở dữ liệu học thuật quốc tế\n• Tài liệu tham khảo đa dạng các lĩnh vực\n• Bộ sưu tập tài liệu quý hiếm",
  },
  {
    title: "Đội ngũ",
    content:
      "Chúng tôi có đội ngũ nhân viên chuyên nghiệp, nhiệt tình và giàu kinh nghiệm, luôn sẵn sàng hỗ trợ bạn trong việc tìm kiếm thông tin và sử dụng các dịch vụ thư viện.",
  },
  {
    title: "Công nghệ",
    content:
      "Ứng dụng thư viện được phát triển với:\n\n• Giao diện hiện đại, thân thiện với người dùng\n• Hệ thống quản lý thông minh\n• Tìm kiếm nhanh chóng và chính xác\n• Thông báo tự động về hạn trả sách\n• Quản lý tài khoản cá nhân dễ dàng\n• Bảo mật thông tin cao",
  },
];

export const contactInfo = [
  {
    icon: "location",
    label: "Địa chỉ",
    value: "268 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM",
    action: null,
  },
  {
    icon: "call",
    label: "Điện thoại",
    value: "(028) 3865 0000",
    action: "tel:02838650000",
  },
  {
    icon: "mail",
    label: "Email",
    value: "library@hcmut.edu.vn",
    action: "mailto:library@hcmut.edu.vn",
  },
  {
    icon: "globe",
    label: "Website",
    value: "https://library.hcmut.edu.vn",
    action: "https://library.hcmut.edu.vn",
  },
  {
    icon: "time",
    label: "Giờ làm việc",
    value: "Thứ 2 - Thứ 6: 7:30 - 17:00\nThứ 7: 7:30 - 11:30",
    action: null,
  },
];

export const getSectionIcon = (index) => {
  const icons = [
    "information-circle",
    "flag",
    "eye",
    "grid",
    "book",
    "people",
    "hardware-chip",
  ];
  return icons[index] || "help-circle";
};
