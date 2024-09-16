# Cài đặt phần mềm

## 1. Cài đặt thư viện

Chạy câu lệnh sau

```bash
npm instal
```

## 2. Cập nhật `.env`

Bước này cần phải làm vào lần đầu cài đặt app, và mỗi khi URL của app có thay đổi. Các giá trị cần sửa trong file này là `PUBLIC_HOSTNAME` và `TAB_API_URI`.

Giả sử, URL của app là `https://st-msteams.com`. Vậy thì cần sửa như sau:

### `PUBLIC_HOSTNAME`

Từ

```bash
PUBLIC_HOSTNAME=abc.com
```

chuyển thành

```bash
PUBLIC_HOSTNAME=st-msteams.com
```

### `TAB_API_URI`

Từ

```bash
TAB_APP_URI=api://abc.com/e2c44ec0-bc10-45c0-8cd6-df8c2f13095e
```

chuyển thành

```bash
TAB_APP_URI=api://st-msteams.com/e2c44ec0-bc10-45c0-8cd6-df8c2f13095e
```

Trong đó, `e2c44ec0-bc10-45c0-8cd6-df8c2f13095e` là ID của app trên Azure, và ID này không bao giờ đổi

### `API_URL`
Đây là địa chỉ của backend. 

**Lưu ý: phải có dấu `/` ở cuối. VD: https://msteam-api.bern.asia/** 

## 3. Thiết lập trên Azure

Sau khi đăng nhập thành công vào Azure, lần lượt thực hiện các bước sau

-   Vào Microsoft Entra ID
-   Ở sidebar bên trái, chọn **Manage > App registrations**, rồi trên giao diện chính, chọn app **VPHV**
-   Ở sidebar bên trái, chọn **Manage > Expose an API**, rồi trên giao diện chính, ở dòng **Application ID URI**, chọn nút **Edit** bên phải
-   Điền giá trị của `TAB_API_URI` vào đấy

## 4. Chạy chương trình

Dùng lệnh sau để vừa tạo file `.zip` và vừa chạy chương trình

```bash
npx gulp serve
```

Quá trình chạy có thể mất gần 1 phút. Sau khi chạy xong, file `.zip` sẽ nằm trong thư mục `package`
