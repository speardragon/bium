![메인 배너](./public/main.png)

<p align="center">
  <a href="./README.md">한국어</a> |
  <a href="./docs/README_EN.md">English</a> |
  <a href="./docs/README_JA.md">日本語</a> |
  <a href="./docs/README_ZH.md">中文</a>
</p>

# 비움 (Bium)

> **"비워야 채운다"**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)

---

## 프로젝트 소개

**비움(Bium)**은 '할 일' 중심이 아닌 **'시간 구조' 중심**의 스케줄링 도구입니다.

대부분의 할 일 관리 앱은 끝없이 늘어나는 태스크 목록을 보여주며, 우리에게 "더 해야 한다"는 압박감을 줍니다. 비움은 다릅니다. **시간은 유한한 그릇**이라는 철학에서 시작합니다.

### 핵심 컨셉: 용량이 있는 시간의 그릇

비움에서 당신의 하루는 **빈 큐(Queue)**로 시작합니다. 각 큐는 정해진 용량을 가진 컨테이너입니다.

- 큐에 할 일을 담으면 **수위가 차오릅니다**
- 70% 이하면 파란색 (여유 있음)
- 70~100%면 주황색 (주의)
- 100%를 초과하면 **빨간색 경고**와 함께 넘침을 시각화

이 시각적 피드백은 "시간이 부족하다"는 사실을 직관적으로 보여주어, 무리한 계획을 세우는 대신 **현실적인 우선순위 결정**을 돕습니다.

---

## 설치 및 실행

### 요구사항

- [Docker](https://www.docker.com/get-started) & Docker Compose
- 또는 Node.js 18+

### 방법 1: Docker로 실행 (권장)

```bash
# 저장소 클론
git clone https://github.com/your-username/bium.git
cd bium

# Docker Compose로 실행
docker-compose up --build -d

# 브라우저에서 접속
open http://localhost
```

### 방법 2: 로컬 개발 환경

```bash
# 저장소 클론
git clone https://github.com/your-username/bium.git
cd bium

# Backend 실행
cd backend
npm install
npm run dev

# 새 터미널에서 Frontend 실행
cd frontend
npm install
npm run dev

# 브라우저에서 접속
open http://localhost:5173
```

### 종료

```bash
# Docker 사용 시
docker-compose down

# 로컬 실행 시
# 각 터미널에서 Ctrl+C
```

---

## 주요 기능

### 1. Inbox - 재료 준비하기

왼쪽 사이드바의 Inbox는 머릿속 할 일을 쏟아내는 공간입니다.

- **할 일 추가**: 제목과 예상 소요 시간을 입력
- **시간 필수**: 모든 할 일에는 시간이 필요합니다 (기본 30분)
- **드래그 가능**: 카드를 드래그하여 Queue로 이동

### 2. Weekly Plan View - 그릇 채우기

메인 화면에서 이번 주의 시간 구조를 한눈에 볼 수 있습니다.

- **요일별 Queue 배치**: 월~금 각 요일에 설정된 시간 블록
- **실시간 용량 계산**: Queue에 할 일이 추가될 때마다 남은 시간 표시
- **Buffer 시각화**: 여유 시간은 빗금 패턴으로 표시

### 3. Queue - 용량이 있는 시간 컨테이너

비움의 핵심 기능입니다. 각 Queue는:

| 상태 | 용량    | 시각적 표현                   |
| ---- | ------- | ----------------------------- |
| 여유 | ~70%    | 파란색 수위 게이지            |
| 적정 | 70~100% | 주황색 수위 게이지            |
| 초과 | 100%+   | 빨간색 경고 + 넘침 애니메이션 |

### 4. Drag & Drop

Inbox의 할 일 카드를 드래그하여 원하는 Queue에 드롭하세요.

- **스냅 효과**: Queue 근처에서 자석처럼 달라붙음
- **실시간 피드백**: 드롭 대상 Queue가 하이라이트됨
- **되돌리기**: Queue 안의 태스크를 클릭하면 Inbox로 복귀

### 5. Empty All Queues - 리셋

"이번 주는 망했어"라는 생각이 들 때, 모든 Queue를 비우고 다시 시작할 수 있습니다.

```
[Empty All Queues] 버튼 클릭 → 모든 태스크가 Inbox로 복귀
```

---

## 기술 스택

| 영역         | 기술                                                       |
| ------------ | ---------------------------------------------------------- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Zustand, dnd-kit |
| **Backend**  | Node.js, Express, TypeScript, Lowdb                        |
| **Infra**    | Docker, Docker Compose, Nginx                              |

---

## 프로젝트 구조

```
bium/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── server.ts      # Express API 서버
│       ├── db.ts          # Lowdb 데이터베이스
│       └── types.ts       # 타입 정의
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    └── src/
        ├── App.tsx
        ├── components/
        │   ├── Header.tsx
        │   ├── Inbox.tsx
        │   ├── QueueCard.tsx
        │   └── WeeklyPlanView.tsx
        ├── store/
        │   └── useStore.ts
        └── utils/
            └── index.ts
```

---

## API 엔드포인트

| Method | Endpoint                     | 설명                |
| ------ | ---------------------------- | ------------------- |
| GET    | `/api/queues`                | 모든 Queue 조회     |
| POST   | `/api/queues`                | Queue 생성          |
| GET    | `/api/tasks`                 | 모든 Task 조회      |
| POST   | `/api/tasks`                 | Task 생성           |
| POST   | `/api/weekly-plan/assign`    | Task를 Queue에 할당 |
| POST   | `/api/weekly-plan/unassign`  | Task를 Inbox로 이동 |
| POST   | `/api/weekly-plan/empty-all` | 모든 Queue 비우기   |

---

## 라이선스

MIT License - 자유롭게 사용, 수정, 배포할 수 있습니다.

---

<p align="center">
  <b>비워야 채운다</b><br>
  시간의 한계를 인정할 때, 진정한 생산성이 시작됩니다.
</p>
