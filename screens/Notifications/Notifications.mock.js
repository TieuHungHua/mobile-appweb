export const mockNotifications = [
  {
    id: 1,
    type: "overdue",
    title: "Overdue Item: Physics II",
    description: "This item was due yesterday. Please return it to avoid fines.",
    timestamp: "2h ago",
    read: false,
    urgent: true,
  },
  {
    id: 2,
    type: "due",
    title: "Due Tomorrow",
    description: "Clean Code by Robert Martin is due on Oct 24.",
    timestamp: "5h ago",
    read: false,
    urgent: false,
  },
  {
    id: 3,
    type: "hold",
    title: "Hold Ready for Pickup",
    description: "AI: A Modern Approach is ready at the Main Desk.",
    timestamp: "1d ago",
    read: true,
    urgent: false,
  },
  {
    id: 4,
    type: "info",
    title: "Library Holiday Hours",
    description:
      "The library will close early on Friday at 4:00 PM for maintenance.",
    timestamp: "2d ago",
    read: true,
    urgent: false,
  },
  {
    id: 5,
    type: "returned",
    title: "Successfully Returned",
    description: '"Data Structures in C++" was successfully returned.',
    timestamp: "3d ago",
    read: true,
    urgent: false,
  },
];

