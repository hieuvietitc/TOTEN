# Kế Hoạch Triển Khai App TOTEN
## Vietnam Tennis Federation (VTF) — TOTEN National Rollout

> **Tài liệu tham chiếu**: 210.DOC.pdf — Đề án AI vận hành & War-Room Playbook 120 ngày  
> **Phiên bản**: 1.0 | **Ngày**: 2026-05-01 | **Trạng thái**: Lưu hành nội bộ

---

## 1. Tổng Quan

TOTEN là nền tảng thể thao AI-powered do Liên đoàn Quần vợt Việt Nam (VTF) chủ trì, xây dựng **AI Operating System** cho toàn bộ hệ sinh thái tennis quần chúng.

**Thông điệp cốt lõi**: Smart Play. Full Power Play.

**Mục tiêu 120 ngày**:
| Chỉ số | Mục tiêu |
|--------|---------|
| CLB / điểm chơi | 100 (≥ 4 vùng) |
| Người chơi thử | 20.000 |
| Chơi thường xuyên | 10.000 |
| Member trả phí | 5.000 |
| Giải CLB / Local | ≥ 120 |
| Giải quốc gia pilot | 01 |
| Doanh thu tích luỹ | 15 – 25 tỷ đồng |

---

## 2. Kiến Trúc Hệ Thống (3 Lớp)

```
LỚP 1 — NGƯỜI DÙNG
Người chơi · Hội viên · Chủ sân · CLB · Trọng tài · BTC giải · Nhà tài trợ · Admin

              ▼

LỚP 2 — DỮ LIỆU TRUNG TÂM
Dữ liệu người chơi · sân · giải đấu · tài chính · hành vi tiêu dùng

              ▼

LỚP 3 — AI CORE ENGINE (10 Engines)
Membership · Matchmaking · Ranking · Tournament · Booking
Fraud · Marketing · Sponsorship · Finance · Control Tower
```

---

## 3. Tech Blueprint

### 3.1 Frontend
| Layer | Technology |
|-------|-----------|
| Mobile App | Flutter (iOS/Android) |
| Web Admin | React + TypeScript |
| Web Portal | React (Sponsor / CLB) |

### 3.2 Backend (Microservices)
- **Runtime**: Node.js (NestJS) hoặc Python FastAPI
- **API Gateway**: Kong hoặc Nginx
- **Services**: User, Membership, Booking, Match, Ranking, Tournament, Payment, Notification, Fraud, Sponsor, Finance

### 3.3 Database
| Database | Mục đích |
|----------|---------|
| PostgreSQL | Dữ liệu giao dịch (users, matches, rankings) |
| Redis | Realtime cache, session, queue |
| Data Lake (S3/MinIO) | Big data, analytics |
| Vector DB (Pinecone/Qdrant) | AI search, recommendation |

### 3.4 AI Layer
- Recommendation model (Matchmaking, Court suggestion)
- Fraud Detection model (kết quả bất thường, cày điểm)
- Ranking Adjustment model (ELO-like + ATP points)
- Churn Prediction model
- Sponsor Matching model
- Marketing Segmentation model

### 3.5 Integrations
- **Payment**: VNPay / Momo / ZaloPay
- **Notification**: Zalo OA / Firebase FCM / Email
- **QR Check-in**: Camera / QR scanner
- **Social**: Facebook, TikTok, YouTube

### 3.6 Infrastructure
- **Cloud**: AWS / GCP
- **Container**: Docker + Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Grafana + Prometheus

---

## 4. Cấu Trúc Dự Án

```
TOTEN/
├── apps/
│   ├── mobile/              # Flutter app
│   ├── web-admin/           # React admin dashboard
│   └── web-portal/          # Sponsor/CLB portal
├── services/
│   ├── user-service/
│   ├── auth-service/
│   ├── membership-service/
│   ├── match-service/
│   ├── ranking-service/
│   ├── tournament-service/
│   ├── booking-service/
│   ├── notification-service/
│   ├── fraud-service/
│   ├── payment-service/
│   ├── sponsor-service/
│   └── finance-service/
├── infra/
│   ├── docker-compose.yml
│   ├── k8s/
│   └── terraform/
├── shared/
│   ├── types/
│   └── utils/
└── docs/
    ├── rulebook-v1.md
    ├── ranking-formula.md
    └── data-dictionary.md
```

---

## 5. Roadmap Triển Khai — 5 Phase (16 Tuần)

### Timeline Tổng Quan
```
Phase 0  |██                              | Tuần 1–2   Lock Foundation
Phase 1  |    ████                        | Tuần 3–6   Pilot Hard
Phase 2  |            ████                | Tuần 7–10  Controlled Launch
Phase 3  |                ████            | Tuần 11–14 Scale Regional
Phase 4  |                        ██      | Tuần 15–16 National Moment
```

---

### PHASE 0 — Tuần 1–2: LOCK FOUNDATION

**Mục tiêu**: Khoá nền tảng kỹ thuật + mở kênh data

**Checklist kỹ thuật**:
- [ ] Setup monorepo (apps/, services/, infra/, shared/, docs/)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Database schema v1 (users, clubs, courts, matches, rankings)
- [ ] Auth service (JWT + OAuth)
- [ ] Landing page + Free ID Registration MVP
- [ ] Docker Compose local dev

**Checklist nghiệp vụ**:
- [ ] Ban hành Rule v0.95 (đóng băng để test)
- [ ] Sản xuất 3 mẫu bóng (A / B / C)
- [ ] Sản xuất 2 mẫu vợt (mini tennis — có dây)
- [ ] Ký 10 CLB nòng cốt (MOU)
- [ ] Đào tạo HLV / Trọng tài pilot (1 ngày)
- [ ] Video demo (60s + 3 phút)

**KPI Phase 0**:
| Chỉ số | Mục tiêu |
|--------|---------|
| Đăng ký | ≥ 2.000 |
| Trial | ≥ 500 |
| HLV/Referee pilot | ≥ 50 |

---

### PHASE 1 — Tuần 3–6: PILOT HARD

**Mục tiêu**: Test thực địa — chốt Ball v1.0 / Rule v1.0

**Checklist kỹ thuật**:
- [ ] Membership Engine MVP (Free → Basic flow)
- [ ] Court Booking Engine cơ bản
- [ ] Match Result Entry + QR Check-in
- [ ] Basic Ranking Engine (điểm cơ bản)
- [ ] Admin Dashboard (quản lý CLB, trận, người chơi)
- [ ] Notification Engine (push / Zalo)

**Membership tiers**:
| Hạng | Phí | Quyền lợi chính |
|------|-----|----------------|
| Free ID | 0đ | Tạo tài khoản, xem ranking, đăng ký chơi thử |
| Basic Member | 300–500K | Được tính ranking, tham gia giải chính thức, ưu đãi sân |
| Ranked Member | 800K–1.2M | Ưu tiên đăng ký giải, phân tích phong độ cá nhân |
| Elite Member | Theo gói | Tham gia league cao cấp, sự kiện nhà tài trợ |

**Checklist nghiệp vụ**:
- [ ] 10 CLB chạy 2–4 buổi / tuần
- [ ] ≥ 100 trận test / tuần (ghi data)
- [ ] Test 2 mức lưới
- [ ] 6–10 mini events
- [ ] Survey người mới / tennis player / HLV

**KPI Phase 1** (cộng dồn):
| Chỉ số | Mục tiêu |
|--------|---------|
| Người chơi thử | ≥ 5.000 |
| Basic Member | ≥ 1.500 |
| Trận có data | ≥ 1.000 |
| Output | Ball v1.0 + Rule v1.0 |

---

### PHASE 2 — Tuần 7–10: CONTROLLED LAUNCH

**Mục tiêu**: Mở rộng có kiểm soát + bắt đầu doanh thu

**Checklist kỹ thuật**:
- [ ] Matchmaking Engine (Match Fit Score)
- [ ] Rating System Beta
- [ ] Ranking System Beta
- [ ] Fraud Detection Engine cơ bản
- [ ] Tournament Engine (tạo giải, xếp bảng, lịch)
- [ ] Payment Gateway (VNPay/Momo)
- [ ] Marketing Engine (automation, push campaigns)

**Công thức Matchmaking (Match Fit Score)**:
```
MFS = 30% Trình độ + 20% Vị trí + 20% Lịch rảnh + 15% Lịch sử + 15% Mục tiêu
```

**Công thức Rating (Elo-like)**:
```
R_new = R_old + K × (R – E) × G × C
  K = hệ số theo số trận
  E = kỳ vọng theo chênh rating
  G = hệ số theo chênh game
  C = độ tin cậy kết quả
```

**Thang Rating**:
| Mức | Trình độ |
|-----|---------|
| 1.0 – 2.5 | Beginner |
| 2.6 – 4.0 | Amateur |
| 4.1 – 6.0 | Club Player |
| 6.1 – 8.0 | Advanced |
| 8.1 – 10.0 | Elite |

**Fraud Detection — 4 cấp cảnh báo**:
| Cấp | Tên | Hành động |
|-----|-----|-----------|
| 1 | Nhắc nhở | AI tự động |
| 2 | Tạm giữ điểm | AI tự động |
| 3 | Chuyển Ban kiểm tra | AI tự động |
| 4 | Khoá tài khoản / Cấm giải | Phải có người duyệt |

**Checklist nghiệp vụ**:
- [ ] Mở 30 CLB
- [ ] Mở Basic & Ranked Member
- [ ] Rating (beta) + Ranking (beta) chạy
- [ ] 30–40 giải CLB / Local
- [ ] Bán Starter Kit (1 vợt + 3 bóng + túi + QR member)
- [ ] Ký 1–2 sponsor

**KPI Phase 2** (cộng dồn):
| Chỉ số | Mục tiêu |
|--------|---------|
| Người chơi thử | ≥ 10.000 |
| Basic / Ranked | 3.000 / 1.500 |
| Doanh thu | ≥ 6–10 tỷ |

---

### PHASE 3 — Tuần 11–14: SCALE REGIONAL

**Mục tiêu**: Phủ 4 vùng trọng điểm (HCM, HN, ĐN, Tây Nam Bộ)

**Checklist kỹ thuật**:
- [ ] Sponsorship Engine (AI tạo proposal tự động)
- [ ] Finance Engine (realtime P&L dashboard)
- [ ] Control Tower v1 (National Dashboard)
- [ ] Certified Club/Coach/Referee program
- [ ] Funnel optimization tools

**Sponsor Packages**:
| Gói | Quyền lợi |
|-----|----------|
| Title Sponsor | Quyền đặt tên hệ thống · Branding toàn quốc · Data insight |
| City Sponsor | Tài trợ giải theo địa phương |
| Equipment Partner | Vợt, bóng, trang phục |
| Digital Partner | App, payment, loyalty |

**Checklist nghiệp vụ**:
- [ ] 60–80 CLB
- [ ] Provincial Cup (≥ 8 tỉnh / thành)
- [ ] Certified Club / Coach / Referee (beta)
- [ ] Tối ưu funnel (Trial → Member)

**KPI Phase 3** (cộng dồn):
| Chỉ số | Mục tiêu |
|--------|---------|
| Người chơi thử | ≥ 15.000 |
| Member | ≥ 7.000 |
| Số giải | ≥ 80–100 |
| Doanh thu | 10–18 tỷ |

---

### PHASE 4 — Tuần 15–16: NATIONAL MOMENT

**Mục tiêu**: Điểm nổ quốc gia

**Checklist kỹ thuật**:
- [ ] AI Control Tower Engine (realtime, full)
- [ ] Dynamic Pricing (Court Booking)
- [ ] Advanced Ranking (full anti-fraud)
- [ ] Sponsor Reporting Dashboard
- [ ] Broadcast-ready competition system

**Checklist nghiệp vụ**:
- [ ] National Pilot Championship (broadcast)
- [ ] Công bố Top Ranking
- [ ] Ký Title Sponsor
- [ ] PR toàn quốc

**KPI Phase 4** (cộng dồn 120 ngày):
| Chỉ số | Mục tiêu |
|--------|---------|
| CLB | 100 |
| Người chơi thử / Active | 20K / 10K |
| Paid Member | 5.000 |
| Doanh thu | 15–25 tỷ |
| National Championship | 01 |

---

## 6. 10 AI Engines — Chi Tiết

| # | Engine | Chức năng chính | Phase | Ưu tiên |
|---|--------|----------------|-------|---------|
| 01 | Membership Engine | Quản trị vòng đời hội viên | Phase 1 | P0 |
| 02 | Matchmaking Engine | Ghép trận theo Match Fit Score | Phase 2 | P1 |
| 03 | Ranking Engine | Rating + Ranking minh bạch | Phase 2 | P0 |
| 04 | Tournament Engine | Vận hành giải từ A đến Z | Phase 2 | P1 |
| 05 | Court Booking Engine | Tối ưu công suất sân & doanh thu | Phase 1 | P0 |
| 06 | Fraud Detection Engine | Bảo vệ tính minh bạch | Phase 2 | P1 |
| 07 | Marketing Engine | Kéo người chơi, tăng member | Phase 2 | P2 |
| 08 | Sponsorship Engine | Bán tài trợ bằng dữ liệu | Phase 3 | P2 |
| 09 | Finance Engine | Theo dõi dòng tiền realtime | Phase 3 | P1 |
| 10 | Control Tower Engine | Trung tâm điều hành cấp cao | Phase 4 | P1 |

### Engine 01 — Membership Engine
- Tự động: đăng ký, xác thực, phân hạng, gia hạn, nhắc phí, gợi ý nâng hạng
- Cảnh báo churn: người chơi 30 ngày không thi đấu → AI gửi ưu đãi quay lại
- **KPI**: Tỷ lệ gia hạn ≥ 70% · Free→Paid ≥ 20% · MAU ≥ 45%

### Engine 02 — Matchmaking Engine
- Ghép theo Match Fit Score: `MFS = 30% Trình độ + 20% Vị trí + 20% Lịch rảnh + 15% Lịch sử + 15% Mục tiêu`
- **KPI**: Chấp nhận lời mời ≥ 35% · Hoàn thành trận ≥ 75% · Quay lại sau trận đầu ≥ 50%

### Engine 03 — Ranking Engine
- Rating (1.0–10.0): phản ánh trình độ thật (Elo-like)
- Ranking: phản ánh thành tích (ATP-style, top 10–12 kết quả/52 tuần)
- Chống gian lận: GPS + QR cross-check + pattern detection
- **KPI**: Trận hợp lệ 100% · Xác nhận 2 chiều ≥ 95% · Khiếu nại < 2%/tháng

### Engine 04 — Tournament Engine
- 5 bước tự động: Mở giải → Đăng ký → Xếp bảng → Vận hành → Sau giải
- **KPI**: Tự động hoá ≥ 90% · Cập nhật kết quả ≤ 5 phút · Báo cáo ≤ 24 giờ

### Engine 05 — Court Booking Engine
- Dynamic pricing: giờ cao/thấp điểm, ngày trong tuần, mức lấp đầy, sự kiện gần
- **KPI**: Công suất năm 1 ≥ 55% · No-show < 5% · Doanh thu/sân +15%

### Engine 06 — Fraud Detection Engine
- Cross-check: GPS · QR check-in · Xác nhận 2 chiều · Tốc độ thay đổi ranking
- **KPI**: Phát hiện bất thường ≥ 90% · Log 100% · AI tự ý cấm vĩnh viễn = 0%

### Engine 07 — Marketing Engine
- Phân nhóm hành vi → kịch bản tự động theo từng nhóm
- **KPI**: Mở thông báo ≥ 35% · Quay lại sau campaign ≥ 15% · Conversion ≥ 20%

### Engine 08 — Sponsorship Engine
- AI tạo báo cáo sponsor (số người, độ tuổi, khu vực, lượt check-in, chỉ số chuyển đổi)
- **KPI**: 90 ngày ≥ 10 proposal · 6 tháng 20–30 tỷ ký kết

### Engine 09 — Finance Engine
- Realtime P&L: membership, giải, sân, thiết bị, tài trợ, chi phí
- 5 dashboard: Toàn hệ thống, Tỉnh/thành, Từng sân, Từng giải, Từng campaign
- **KPI**: Báo cáo realtime · Giao dịch 100% qua hệ thống · Sai lệch < 1%

### Engine 10 — Control Tower Engine
- Trả lời mỗi ngày: người chơi, trận, member mới, doanh thu, CLB yếu/mạnh, rủi ro
- **KPI**: Dashboard realtime · Alert tự động · Đề xuất hành động có cơ sở data

---

## 7. Cấu Trúc War-Room

### Core Command (6 Director)
| Vai trò | Trách nhiệm | KPI chính |
|---------|------------|-----------|
| Program Director (PD) | P&L, quyết định cuối | Doanh thu, CLB, Member |
| Sport Director (SD) | Luật, bóng, vợt, HLV | Rule v1.0, Ball v1.0 |
| Growth Director (GD) | Marketing, funnel | Signups, Conversion |
| Ops Director (OD) | CLB, sân, giải | #CLB, #Giải, On-time |
| Data & Tech Lead (DTL) | Membership, Rating/Ranking | DAU, Matches, Data integrity |
| Commercial Lead (CL) | Tài trợ, thiết bị | Sponsorship, Equipment revenue |

### 4 Squad Vận Hành
| Squad | Phạm vi |
|-------|--------|
| CLUB SQUAD | Mở & chuẩn hoá CLB |
| PLAYER SQUAD | Acquisition → Conversion → Retention |
| COMPETITION SQUAD | Lịch giải, trọng tài, vận hành |
| PRODUCT SQUAD | Bóng, vợt, kit, giá |

---

## 8. Nhịp Điều Hành

| Chu kỳ | Thời gian | Nội dung chính |
|--------|-----------|---------------|
| **Daily** | 30–45 phút | New signups · Active players · Matches · Lỗi kỹ thuật · Sự cố CLB |
| **Weekly** (Thứ 2) | 90 phút | KPI tuần · Top/Bottom 10 CLB · Conversion funnel · Doanh thu · Go/Stop/Scale |
| **Monthly** | Half-day | Review toàn quốc · Điều chỉnh luật/bóng (tối đa 1 lần) · Ký CLB & sponsor |

---

## 9. Funnel Tăng Trưởng

```
TRAFFIC
   ↓
SIGNUP          100%
   ↓
TRIAL           ≥ 30%
   ↓
BASIC           ≥ 40%
   ↓
RANKED          ≥ 30%
   ↓
RETENTION 30d   ≥ 60%
```

---

## 10. Dashboard Quốc Gia (Realtime)

| Module | Metrics |
|--------|--------|
| Player Metrics | New ID/ngày · Active players · Matches · Retention |
| Club Metrics | CLB active · Sessions/CLB/tuần · Players/CLB · Revenue |
| Competition | Số giải/tuần · Số trận/giải · Participation rate · On-time rate |
| Commercial | Membership revenue · Equipment revenue · Sponsorship · ARPU |

---

## 11. Ngân Sách 120 Ngày

| Hạng mục | Ngân sách |
|----------|-----------|
| R&D bóng/vợt + sản xuất mẫu | 1,5–3 tỷ |
| Tech (MVP + ranking beta) | 1,5–3 tỷ |
| Marketing 120 ngày | 3–6 tỷ |
| Setup CLB & thiết bị | 2–5 tỷ |
| Giải đấu (local → national) | 2–4 tỷ |
| Nhân sự War-Room | 1–2 tỷ |
| **TỔNG CỘNG** | **11–23 tỷ** |

**Nguyên tắc phân bổ**:
- Phase 0–1: Ưu tiên R&D + Tech
- Phase 2: Ưu tiên Marketing + CLB
- Phase 3–4: Dồn lực cho Giải đấu + National Moment

---

## 12. Chuẩn Sản Phẩm

### Bóng v1.0
| Loại | Đường kính | Khối lượng | Độ nảy |
|------|-----------|-----------|--------|
| Soft Ball | 70–74 mm | 18–24 g | 35–45 cm |
| Match Ball | 68–72 mm | 22–28 g | 40–55 cm |

### Vợt
- Mini tennis có dây: 160–190g, 60–80% kích thước chuẩn
- Tuyệt đối không dùng paddle

### Starter Kit
- 1 vợt + 3 bóng + túi + QR member card
- Giá bán: 1,2–2 triệu | Margin: 25–40%

---

## 13. RACI

| Hạng mục | R | A | C | I |
|----------|---|---|---|---|
| Rule / Tech | SD | PD | OD | All |
| Marketing | GD | PD | CL | All |
| CLB | OD | PD | GD | All |
| Ranking | DTL | PD | SD | All |
| Sponsor | CL | PD | GD | All |

---

## 14. Risk Control

| Rủi ro | Kiểm soát |
|--------|----------|
| Ranking thiếu minh bạch | Công khai logic điểm · Log từng trận · Cơ chế khiếu nại · Hội đồng ranking |
| Gian lận kết quả | QR check-in · Xác nhận 2 chiều · GPS · AI anomaly detection |
| App khó dùng | MVP đơn giản · 3 thao tác: đặt sân – chơi – nhập kết quả |
| Chủ sân không hợp tác | Chứng minh tăng công suất · Chia sẻ data · Hỗ trợ marketing |
| Sponsor không thấy hiệu quả | Báo cáo định kỳ · Chỉ số exposure rõ · Activation có data thật |
| Lệch DNA tennis | Bắt buộc vợt có dây + điểm 15–30–40 |
| Bóng không chuẩn | Chốt v1.0 ≤ tuần 6 — không thay đổi liên tục |

---

## 15. Nguyên Tắc Vàng

1. Không xây app quá lớn ngay từ đầu — MVP phải chạy được trong 60 ngày
2. Ranking phải minh bạch từ ngày đầu tiên
3. Mọi giao dịch phải đi qua hệ thống
4. AI chỉ tự động hoá phần lặp lại — Quyết định nhạy cảm phải có người duyệt
5. Data là tài sản chiến lược số 1
6. Sponsor phải được bán bằng dữ liệu, không bán cảm tính
7. Community phải đi trước doanh thu
8. Control Tower phải nhìn được realtime
9. CLB là trung tâm — không triển khai rời rạc
10. Chốt bóng sớm (≤ tuần 6) — không thay đổi liên tục

---

## 16. Kết Luận

> Nếu triển khai đúng nhịp, sau 120 ngày TOTEN đã là một **mini-ecosystem tennis hoạt động trên toàn quốc**, sẵn sàng bước sang giai đoạn 12–24 tháng để scale mạnh và mở quốc tế.

**Tầm nhìn dài hạn**: Không chỉ là "một môn thể thao mới" — TOTEN là **MỘT HỆ ĐIỀU HÀNH THỂ THAO ĐẠI CHÚNG** có khả năng nhân rộng toàn quốc và xuất khẩu ra khu vực.

---

*VTF · TOTEN National Rollout · Phiên bản chính thức · Lưu hành nội bộ*
