# TOTEN — AI Operating System for Tennis Ecosystem

> **Smart Play. Full Power Play.**
>
> An AI-powered platform by Vietnam Tennis Federation (VTF) to revolutionize tennis grassroots movement in Vietnam.

## Overview

TOTEN is a comprehensive ecosystem built on a **3-layer architecture** and powered by **10 AI Engines** that automate 70–80% of repetitive tasks while maintaining human control over critical decisions.

### Key Facts
- **Phase**: Phase 0 — Foundation (Weeks 1–2)
- **Deployment Timeline**: 120 days, 5 phases, 16 weeks
- **Target**: 20,000 trial players, 5,000 paid members, 100 clubs, 15–25B VND revenue
- **Scope**: 4 regions (HCM, Hanoi, Da Nang, Mekong Delta)

---

## Architecture

### 3-Layer Design
```
Layer 1: Users (Players, Members, Clubs, Referees, Sponsors, Admin)
       ↓
Layer 2: Central Data Hub (Players, Courts, Tournaments, Finance, Behavior)
       ↓
Layer 3: AI Core Engines (10 specialized microservices)
```

### 10 AI Engines
1. **Membership Engine** — Manage member lifecycle
2. **Matchmaking Engine** — Match Fit Score (MFS) algorithm
3. **Ranking Engine** — Rating (Elo-like) + Ranking (ATP-style)
4. **Tournament Engine** — Full tournament automation
5. **Court Booking Engine** — Dynamic pricing, capacity optimization
6. **Fraud Detection Engine** — Anomaly detection, anti-cheat
7. **Marketing Engine** — Behavioral segmentation, automation
8. **Sponsorship Engine** — Data-driven sponsor matching
9. **Finance Engine** — Realtime P&L tracking
10. **Control Tower Engine** — Command center dashboard

---

## Tech Stack

### Frontend
- **Mobile**: Flutter (iOS/Android)
- **Web Admin**: React + TypeScript
- **Portal**: React (Sponsor/Club)

### Backend
- **Runtime**: Node.js (NestJS) / Python FastAPI
- **Database**: PostgreSQL (transactions) + Redis (cache) + MinIO (data lake)
- **API Gateway**: Nginx
- **Containerization**: Docker + Kubernetes
- **CI/CD**: GitHub Actions

### AI/ML
- Recommendation models
- Fraud detection (rule-based → ML)
- Ranking adjustment
- Churn prediction
- Sponsor matching
- Marketing segmentation

---

## Project Structure

```
TOTEN/
├── apps/
│   ├── mobile/              # Flutter app
│   ├── web-admin/           # React admin dashboard
│   └── web-portal/          # Sponsor/CLB portal
├── services/
│   ├── user-service/        # User management
│   ├── auth-service/        # Authentication & authorization
│   ├── membership-service/  # Membership lifecycle
│   ├── match-service/       # Match recording & tracking
│   ├── ranking-service/     # Rating + Ranking computation
│   ├── tournament-service/  # Tournament management
│   ├── booking-service/     # Court booking + dynamic pricing
│   ├── notification-service/# Push, email, SMS
│   ├── fraud-service/       # Fraud detection engine
│   ├── payment-service/     # Payment gateway integration
│   ├── sponsor-service/     # Sponsorship management
│   └── finance-service/     # Financial tracking & reporting
├── infra/
│   ├── docker-compose.yml   # Local dev stack
│   ├── nginx.conf           # API Gateway config
│   ├── k8s/                 # Kubernetes manifests
│   └── terraform/           # Infrastructure as Code
├── shared/
│   ├── types/               # TypeScript types & schemas
│   └── utils/               # Common utilities
├── docs/
│   ├── TOTEN_DEPLOYMENT_PLAN.md  # Full deployment plan
│   ├── rulebook-v1.md             # Game rules
│   ├── ranking-formula.md          # Rating + Ranking formulas
│   └── data-dictionary.md          # Database schema
└── README.md
```

---

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- PostgreSQL 15
- Redis 7

### Local Development

```bash
# Setup infrastructure
docker-compose -f infra/docker-compose.yml up -d

# Check services
curl http://localhost:8080/health

# Verify databases
psql -U toten -d toten_db -h localhost  # PostgreSQL
redis-cli -h localhost                   # Redis
```

### Services Health
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- MinIO: `localhost:9000` (admin: minioadmin)
- Nginx: `localhost:8080`

---

## Roadmap — 5 Phases (16 Weeks)

| Phase | Week | Focus | Key Deliverables | KPI |
|-------|------|-------|------------------|-----|
| **Phase 0** | 1–2 | Foundation | DB schema, Auth, Landing, 10 CLBs | 2K signups |
| **Phase 1** | 3–6 | Pilot Hard | Membership MVP, Booking, Basic Ranking, Admin UI | 5K trial players |
| **Phase 2** | 7–10 | Controlled Launch | Matchmaking, Rating/Ranking Beta, Tournament, Payment | 10K trial, 3K/1.5K members |
| **Phase 3** | 11–14 | Scale Regional | Sponsorship, Finance Engine, Provincial Cups, 60–80 CLBs | 15K trial, 7K members |
| **Phase 4** | 15–16 | National Moment | Control Tower, National Championship, Title Sponsor | 20K trial, 5K members, 15–25B VND |

---

## Key Features by Phase

### Phase 1 (Weeks 3–6)
- [ ] Free ID registration
- [ ] Basic/Ranked membership tiers
- [ ] Court booking system
- [ ] Match result entry with QR check-in
- [ ] Basic rating system
- [ ] Admin dashboard (clubs, players, matches)
- [ ] Notification engine

### Phase 2 (Weeks 7–10)
- [ ] Matchmaking Engine (Match Fit Score)
- [ ] Rating System (Elo-like formula)
- [ ] Ranking System (ATP-style points)
- [ ] Tournament automation (bracket, schedule, results)
- [ ] Fraud detection (4-tier alert system)
- [ ] Payment gateway (VNPay/Momo)
- [ ] Marketing automation (segment + campaign)

### Phase 3 (Weeks 11–14)
- [ ] Sponsorship Engine (AI proposal generation)
- [ ] Finance Engine (realtime P&L dashboard)
- [ ] Provincial Cup system
- [ ] Certified Club/Coach/Referee program
- [ ] Control Tower v1 (national dashboard)
- [ ] Sponsor reporting

### Phase 4 (Weeks 15–16)
- [ ] Control Tower (full realtime)
- [ ] Dynamic pricing engine
- [ ] Advanced fraud detection (ML models)
- [ ] National Pilot Championship (broadcast-ready)
- [ ] Ranking announcement
- [ ] Title sponsor integration

---

## Data Model

Core tables:
- `users` — Player profiles
- `membership` — Member status & expiry
- `clubs` — Club info & certification
- `courts` — Court inventory
- `matches` — Match records
- `ratings` — Player ratings (Elo-like)
- `rankings` — Player rankings (ATP-style)
- `tournaments` — Tournament info
- `court_bookings` — Booking history
- `fraud_alerts` — Fraud detection logs
- `sponsorships` — Sponsor agreements
- `financial_transactions` — All revenue/cost

See `docs/data-dictionary.md` for full schema.

---

## Ranking & Rating System

### Rating (Trình độ)
- **Formula**: `R_new = R_old + K × (R – E) × G × C`
- **Scale**: 1.0–10.0 (Beginner → Elite)
- **Updated**: After each valid match

### Ranking (Thành tích)
- **Formula**: `Points = Base × Event_Level × Opponent_Strength × Result`
- **Counting**: Top 10–12 results / 52 weeks
- **Reset**: Annually (Jan 1)

See `docs/ranking-formula.md` for details.

---

## Game Rules (TOTEN v1.0)

- **Ball**: Soft (70–74mm, 18–24g) or Match (68–72mm, 22–28g)
- **Racket**: Mini tennis with strings, 160–190g
- **Court**: Mini tennis court (17.07m × 8.23m)
- **Scoring**: Tennis standard (0, 15, 30, 40, Game)
- **Minimum games**: 4 (Casual) or 6 (Ranked)
- **No paddle or equipment variants allowed**

See `docs/rulebook-v1.md` for complete rules.

---

## Fraud Detection (4-Tier System)

| Level | Type | Action | Review |
|-------|------|--------|--------|
| 1 | Warning | Auto | None |
| 2 | Hold Points | Auto | None |
| 3 | Investigation | Auto | None |
| 4 | Account Ban | **Human** | **Required** |

AI monitors: GPS, QR check-in, result confirmation, rating velocity, match patterns.

---

## War-Room Structure

### Core Command (6 Directors)
- **Program Director** — P&L owner
- **Sport Director** — Rules, equipment, coaching
- **Growth Director** — Marketing, funnel
- **Ops Director** — Clubs, courts, tournaments
- **Data & Tech Lead** — Membership, rating/ranking
- **Commercial Lead** — Sponsorship, equipment

### 4 Squads
- **CLUB SQUAD** — Club onboarding & standards
- **PLAYER SQUAD** — Acquisition → conversion → retention
- **COMPETITION SQUAD** — Tournament scheduling & execution
- **PRODUCT SQUAD** — Ball, racket, kit, pricing

---

## Daily Rhythms

| Frequency | Duration | Focus |
|-----------|----------|-------|
| **Daily** | 30–45 min | Signups, active players, matches, errors, incidents |
| **Weekly** (Mon) | 90 min | KPI review, top/bottom 10 clubs, funnel, revenue, Go/Stop/Scale |
| **Monthly** | Half-day | National review, rule changes, new partnerships |

---

## Financial Model (120 Days)

| Source | Budget |
|--------|--------|
| R&D (Ball/Racket) | 1.5–3B VND |
| Tech (MVP + AI) | 1.5–3B VND |
| Marketing | 3–6B VND |
| Club & Equipment | 2–5B VND |
| Tournaments | 2–4B VND |
| War-Room Staff | 1–2B VND |
| **TOTAL** | **11–23B VND** |

**Revenue Targets**:
- Membership: 3–5B VND
- Equipment: 5–10B VND
- Tournaments: 2–4B VND
- Sponsorship: 5–10B VND
- **Total**: 15–25B VND (120 days)

---

## Key Principles

1. ✓ Don't over-build — MVP must run in 60 days
2. ✓ Ranking transparency from Day 1
3. ✓ All transactions go through system
4. ✓ AI automates repetitive tasks only — sensitive decisions require human review
5. ✓ Data is asset #1
6. ✓ Sell sponsorship with data, not emotion
7. ✓ Community first, revenue second
8. ✓ Control Tower must be realtime
9. ✓ Clubs are the center — not fragmented
10. ✓ Lock ball early (Week 6) — don't change constantly

---

## Running the Project

### Start Local Stack
```bash
docker-compose -f infra/docker-compose.yml up -d
```

### Check Health
```bash
curl http://localhost:8080/health
```

### Run Tests
```bash
npm run test
```

### Deploy (Future)
```bash
kubectl apply -f infra/k8s/
```

---

## Documentation

- `TOTEN_DEPLOYMENT_PLAN.md` — Full 120-day deployment plan
- `docs/rulebook-v1.md` — Game rules & policies
- `docs/ranking-formula.md` — Rating + Ranking algorithms
- `docs/data-dictionary.md` — Database schema & design

---

## Timeline to MVP

| Week | Milestone |
|------|-----------|
| 1–2 | Phase 0 — Foundation (this stage) |
| 3–6 | Phase 1 — Pilot Hard (basic features) |
| 7–10 | Phase 2 — Controlled Launch (ranking, tournaments) |
| 11–14 | Phase 3 — Scale Regional (100 clubs) |
| 15–16 | Phase 4 — National Moment (championship, sponsor) |

---

## Contributors

- Vietnam Tennis Federation (VTF)
- Tech Team (Claude AI)

---

## License

PROPRIETARY — Vietnam Tennis Federation

---

## Contact

Vietnam Tennis Federation  
Email: [support@vtf.org.vn](mailto:support@vtf.org.vn)  
Phone: +84-28-xxxx-xxxx

---

*TOTEN v0.1.0 — Phase 0 Foundation Build*