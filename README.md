Chạy DB:

docker compose up -d


Thông tin connect:

Host: 127.0.0.1

Port: 3307

User: ojt

Pass: 123456

DB: astracine

Tắt DB:

docker compose down


Reset sạch (xoá dữ liệu DB):

docker compose down -v

Lưu ý quan trọng cho team

Nếu máy ai đó bị trùng port 3307, họ đổi trong compose:
"3307:3306" → "3308:3306" (hoặc số khác), rồi Java/Workbench dùng port mới.