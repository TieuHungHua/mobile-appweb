# Hướng Dẫn Setup Firebase Cloud Messaging (FCM)

## ⚠️ Lưu Ý Quan Trọng

Project này đang dùng **Expo**, và `@react-native-firebase/messaging` chỉ hoạt động với:
- **Expo Development Build** (khuyến nghị)
- **Bare React Native** (nếu eject khỏi Expo)

Không hoạt động với **Expo Go** vì Expo Go không hỗ trợ native modules.

## Cài Đặt

### Bước 1: Cài đặt packages

```bash
cd LibraryManagementApp
npm install @react-native-firebase/app @react-native-firebase/messaging
```

### Bước 2: Tạo Expo Development Build

Vì đây là Expo project, bạn cần tạo development build:

```bash
# Cài đặt EAS CLI (nếu chưa có)
npm install -g eas-cli

# Login vào Expo account
eas login

# Tạo development build
eas build --profile development --platform android
# hoặc
eas build --profile development --platform ios
```

### Bước 3: Cấu hình Firebase cho React Native

#### Android:
1. Download `google-services.json` từ Firebase Console
2. Đặt vào `android/app/google-services.json`
3. Cập nhật `android/build.gradle`:
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```
4. Cập nhật `android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'
```

#### iOS:
1. Download `GoogleService-Info.plist` từ Firebase Console
2. Đặt vào `ios/GoogleService-Info.plist`
3. Enable Push Notifications capability trong Xcode

### Bước 4: Cấu hình app.json (Expo)

Thêm vào `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "@react-native-firebase/app",
        {
          "android": {
            "googleServicesFile": "./google-services.json"
          },
          "ios": {
            "googleServicesFile": "./GoogleService-Info.plist"
          }
        }
      ]
    ]
  }
}
```

## Sử Dụng

Code đã được tích hợp vào:
- `utils/fcmService.js` - Service để lấy FCM token và xử lý notifications
- `App.js` - Tự động setup FCM khi user đăng nhập

### Tự Động Hoạt Động:

1. **Khi user đăng nhập:**
   - App tự động request notification permissions
   - Lấy FCM token
   - Gửi token lên backend qua `PUT /notifications/fcm-token`

2. **Khi nhận notification:**
   - **Foreground**: Hiển thị Alert với nút "Xem" và "Đóng"
   - **Background**: Hiển thị notification system
   - **Tap notification**: Tự động navigate đến màn hình phù hợp

3. **Navigation từ notification:**
   - Nếu có `borrowId` → Navigate đến MyBookshelf (tab "borrowed")
   - Nếu có `bookId` → Navigate đến BookDetail
   - Nếu không có → Navigate đến NotificationsScreen

## Cấu Trúc Notification Data

Khi nhận notification, `remoteMessage.data` có cấu trúc:

```javascript
{
  borrowId: "uuid",        // ID của khoản mượn
  bookId: "uuid",          // ID của sách
  bookTitle: "Tên sách",   // Tên sách
  daysUntilDue: "0",       // Số ngày còn lại ("0", "1", "3")
  type: "due"              // Loại notification (optional)
}
```

## Test

### 1. Test với Backend API

Backend có endpoint để test:
```bash
POST /notifications/trigger-reminder
```

### 2. Test với Firebase Console

1. Vào Firebase Console > Cloud Messaging
2. Tạo test notification
3. Gửi đến FCM token của device

## Troubleshooting

### Lỗi: "Cannot find module '@react-native-firebase/messaging'"
- Đảm bảo đã cài đặt packages
- Nếu dùng Expo Go, cần chuyển sang Development Build

### Lỗi: "Token is null"
- Kiểm tra Firebase config đã đúng chưa
- Kiểm tra permission (iOS cần request permission)
- Kiểm tra `google-services.json` (Android) hoặc `GoogleService-Info.plist` (iOS)

### Không nhận được notification
- Kiểm tra token đã được gửi lên backend chưa
- Kiểm tra `is_push_enabled = true` trong database
- Kiểm tra Firebase Admin SDK đã được setup đúng chưa

## Alternative: Dùng Expo Notifications

Nếu không muốn dùng Development Build, có thể dùng `expo-notifications`:
- Tương thích với Expo Go
- Dễ setup hơn
- Nhưng cần Expo Push Notification service (không phải FCM trực tiếp)

Xem file `NOTIFICATIONS_SETUP.md` (nếu có) để biết cách setup với expo-notifications.
