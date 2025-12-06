## 비움 (bium) 개발 환경 명세

이 명세는 Docker Compose를 사용하여 프론트엔드와 백엔드를 동시에 로컬 환경에서 실행하는 방법을 안내합니다.

### 1. 프로젝트 구조 (Project Structure)

```
my-empty-queue/
├── docker-compose.yml      # Docker 실행 통합 관리 파일 (루트)
├── .env                     # 환경 변수 파일 (선택적)
├── backend/
│   ├── Dockerfile          # 백엔드 빌드 파일
│   ├── package.json
│   └── src/server.ts
└── frontend/
    ├── Dockerfile          # 프론트엔드 빌드 파일
    └── package.json
```

---

### 2. Dockerfile 명세

#### 2.1. `backend/Dockerfile`

Node.js 기반의 Express 서버를 위한 Dockerfile입니다.

dockerfile

```dockerfile
# Stage 1: Build Stage (의존성 설치)
FROM node:18-alpine AS dependency-installer
WORKDIR /app
COPY package.json .
RUN npm install

# Stage 2: Production Stage (실행 환경)
FROM node:18-alpine
WORKDIR /app
COPY --from=dependency-installer /app/node_modules ./node_modules
COPY . .

# Lowdb 데이터를 저장할 디렉토리 생성
RUN mkdir -p data

# 3000번 포트 노출
EXPOSE 3000

# 서버 실행 (ts-node를 사용하지 않고 미리 컴파일한다는 가정 하에)
# 개발 단계에서는 nodemon을 사용할 수 있으나, 배포의 간결성을 위해 일반 실행 명령을 사용합니다.
CMD ["npm", "start"]
```

#### 2.2. `frontend/Dockerfile`

React/Vite 앱을 빌드하고 Nginx를 통해 서비스하는 Dockerfile입니다.

dockerfile

```dockerfile
# Stage 1: Build Stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build # Vite 빌드 명령

# Stage 2: Serve Stage (Nginx를 사용하여 정적 파일 서빙)
FROM nginx:alpine
# 빌드된 React 파일을 Nginx의 웹 루트 디렉토리로 복사
COPY --from=builder /app/dist /usr/share/nginx/html
# 80번 포트 노출
EXPOSE 80
# 기본 CMD를 사용하여 Nginx 시작 (변경 불필요)
```

---

### 3. Docker Compose 명세

#### `docker-compose.yml` (루트 디렉토리)

Frontend와 Backend 서비스를 정의하고, 특히 데이터 영속성을 위해 backend의 data 폴더를 볼륨으로 마운트합니다.

yaml

```yaml
version: "3.8"

services:
  # --------------------
  # Backend Service (Node.js/Express)
  # --------------------
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: meq-backend
    restart: always
    ports:
      - "3000:3000" # 로컬 3000 포트와 컨테이너 3000 포트 매핑
    volumes:
      # 로컬 개발 시 코드 변경을 반영하기 위한 볼륨 (선택 사항)
      - ./backend/src:/app/src
      # Lowdb 데이터 파일의 영속성을 위한 볼륨 (필수)
      - ./backend/data:/app/data
    environment:
      - NODE_ENV=development
      - PORT=3000

  # --------------------
  # Frontend Service (React/Vite/Nginx)
  # --------------------
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: meq-frontend
    restart: always
    ports:
      - "80:80" # 로컬 80 포트(http://localhost)와 컨테이너 80 포트 매핑
    depends_on:
      - backend # 백엔드보다 먼저 시작되지 않도록 의존성 설정
    environment:
      # React 앱이 백엔드 API를 호출할 주소 지정
      # Nginx 컨테이너 내부에서는 'backend' 서비스 이름으로 접속 가능합니다.
      - REACT_APP_API_URL=http://backend:3000/api
```

---

### 4. 실행 및 접속 가이드

#### 4.1. 준비 단계

**backend/package.json**에 필요한 의존성(express, lowdb, cors, typescript, ts-node 등)과 start 스크립트를 정의합니다.

json

```json
// backend/package.json 예시
"scripts": {
  "start": "ts-node src/server.ts"
}
```

**frontend/package.json**에 필요한 의존성(react, tailwindcss, dnd-kit 등)과 build 스크립트를 정의합니다.

json

```json
// frontend/package.json 예시
"scripts": {
  "build": "vite build"
}
```

#### 4.2. 실행 명령어 (루트 디렉토리에서 실행)

bash

```bash
# 1. 모든 서비스 빌드 및 실행
# 첫 실행 시 시간이 다소 소요됩니다.
docker-compose up --build -d

# 2. 실행 중인 컨테이너 확인
docker-compose ps

# 3. 로컬호스트 접속
# Frontend 서비스는 로컬 80 포트로 실행됩니다.
# 웹 브라우저에서 아래 주소로 접속합니다.
# http://localhost

# 4. 서비스 중지 및 컨테이너 제거
docker-compose down
```
