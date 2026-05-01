# TOTEN Ranking & Rating Formula

## 1. Rating System (Trình độ)

Rating phản ánh **trình độ thật** của người chơi dựa trên Elo-like formula.

### Formula
```
R_new = R_old + K × (R – E) × G × C
```

**Thành phần**:
- **R_old**: Rating hiện tại
- **K**: Hệ số theo số trận
  - Trận 1–10: K = 32
  - Trận 11–50: K = 24
  - Trận 50+: K = 16
- **R**: Kết quả thực (1 = thắng, 0.5 = hòa, 0 = thua)
- **E**: Kỳ vọng (expected): `E = 1 / (1 + 10^((R_opponent - R_player)/400))`
- **G**: Hệ số game point
  - Thắng với chênh < 5 game: G = 1.0
  - Thắng với chênh ≥ 5 game: G = 1.5
  - Thua: G = 0.5
- **C**: Độ tin cậy (confidence)
  - QR check-in + xác nhận 2 chiều: C = 1.0
  - Chỉ 1 chiều xác nhận: C = 0.8
  - Thiếu dữ liệu: C = 0.5

### Thang Rating
| Mức | Khoảng | Trình độ |
|-----|--------|---------|
| 1 | 1.0–2.5 | Beginner |
| 2 | 2.6–4.0 | Amateur |
| 3 | 4.1–6.0 | Club Player |
| 4 | 6.1–8.0 | Advanced |
| 5 | 8.1–10.0 | Elite |

### Cập nhật Rating
- **Tần suất**: Sau mỗi trận hợp lệ
- **Điều kiện hợp lệ**:
  - ✓ QR check-in tại sân
  - ✓ Xác nhận kết quả 2 chiều
  - ✓ Không có cảnh báo gian lận
  - ✓ Trận không quá 3 set (quần vợt tiêu chuẩn)

---

## 2. Ranking System (Thành tích)

Ranking phản ánh **thành tích thi đấu** dựa trên ATP-style points.

### Công thức điểm (Match Points)
```
Match_Points = Base_Points × Event_Level × Opponent_Strength × Result_Factor
```

**Thành phần**:
- **Base_Points**: Điểm nền = 10
- **Event_Level**: Cấp giải
  - Level 1 (Local): 1.0×
  - Level 2 (City): 1.5×
  - Level 3 (Provincial): 2.0×
  - Level 4 (National): 3.0×
- **Opponent_Strength**: Sức mạnh đối thủ
  - Nếu `|R_opponent - R_player| < 2.0`: Opponent_Strength = 1.0
  - Nếu `|R_opponent - R_player| ≥ 2.0`: Opponent_Strength = (R_opponent / R_player)
- **Result_Factor**: Kết quả
  - Thắng: 2.0×
  - Hòa: 1.0×
  - Thua: 0×

### Cơ cấu Ranking
- **Tính từ**: Top 10 (Amateur) / Top 12 (Open) kết quả tốt nhất / 52 tuần
- **Điểm rơi**: 52 tuần (hết hiệu lực)
- **Cập nhật**: Hàng tuần
- **Reset**: Hàng năm (01/01)

### Ví dụ tính toán
```
Match: Player A (Rating 5.5) thắng Player B (Rating 4.2) ở giải City Cup (Level 2)

Base_Points = 10
Event_Level = 1.5 (City)
Opponent_Strength = 5.5 / 4.2 = 1.31
Result_Factor = 2.0 (thắng)

Match_Points = 10 × 1.5 × 1.31 × 2.0 = 39.3 ≈ 39 điểm
```

---

## 3. Chống Gian Lận

### AI Detection Rules

**Rule 1**: Kết quả bất thường
- Nếu người chơi mới thắng 10 trận liên tiếp vs rating cao hơn 2+ → Cảnh báo cấp 2

**Rule 2**: Cày điểm (Smurf)
- Nếu 2 tài khoản thường xuyên đánh nhau + kết quả lệch > 80% → Cảnh báo cấp 3

**Rule 3**: Không có vật lý hóa
- Nếu kết quả nhập nhưng không có QR check-in → Tạm giữ điểm (cấp 2)

**Rule 4**: Xác nhận mâu thuẫn
- Nếu kết quả không khớp xác nhận 2 chiều → Chuyển Ban kiểm tra (cấp 3)

**Rule 5**: Tốc độ thay đổi ngoại lệ
- Nếu rating thay đổi > 0.5/tuần trong 4 tuần → Kiểm tra (cấp 2)

### Cấp độ Cảnh báo
| Cấp | Tên | Hành động | Duyệt |
|-----|-----|----------|-------|
| 1 | Nhắc nhở | AI tự động | Không |
| 2 | Tạm giữ điểm | AI tự động | Không |
| 3 | Chuyển Ban kiểm tra | AI tự động | Không |
| 4 | Khoá tài khoản / Cấm giải | Phải có người duyệt | **CÓ** |

---

## 4. Hệ số Phạt Điểm

| Hành vi | Mức phạt |
|--------|---------|
| Rút giải muộn | −20 → −50 → −100 |
| Bỏ trận | −50 → −100 |
| Gian lận (chứng miễn) | −200 + khoá tài khoản |
| Phi thể thao | −50 → −300 |
| Không thi đấu quá 180 ngày | −50% điểm |

---

## 5. Leaderboard & Public Display

**Hàng tuần** công bố top ranking:
- Top 10 mỗi cấp độ (Beginner, Amateur, Club, Advanced, Elite)
- Top 20 giả tưởng "TOTEN Warriors"
- Top 5 "Trending Players" (thay đổi nhanh nhất tuần)

**Dashboard realtime**:
- Rating trend (7 ngày gần nhất)
- Win rate (20 trận gần nhất)
- Head-to-head stats vs người chơi khác
