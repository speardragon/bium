![main banner](../public/main.png)

<p align="center">
  <a href="../README.md">한국어</a> |
  <a href="./README_EN.md">English</a> |
  <a href="./README_JA.md">日本語</a> |
  <a href="./README_ZH.md">中文</a>
</p>

# Bium (比乌姆)

> **「清空才能填满」**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docker Hub](https://img.shields.io/docker/v/speardragon/bium?label=Docker%20Hub&logo=docker&logoColor=white)](https://hub.docker.com/r/speardragon/bium)
[![Docker Pulls](https://img.shields.io/docker/pulls/speardragon/bium?logo=docker&logoColor=white)](https://hub.docker.com/r/speardragon/bium)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)

---

## 项目介绍

**Bium（比乌姆）**是一款以**「时间结构」**为中心而非以任务为中心的日程管理工具。

大多数待办事项应用展示着无尽的任务列表，给我们带来"还要做更多"的压力。Bium 不同。它从**时间是有限容器**的哲学出发。

### 核心概念：有容量的时间容器

在 Bium 中，你的一天从**空队列（Queue）**开始。每个队列都是一个有固定容量的容器。

- 当你向队列添加任务时，**水位会上升**
- 70%以下：蓝色（充裕）
- 70-100%：橙色（注意）
- 超过 100%：**红色警告**并可视化溢出

这种视觉反馈直观地展示"时间不够"的事实，帮助你做出**现实的优先级决策**，而不是过度计划。

![截图](../public/screenshot.png)

---

## 安装与运行

### 环境要求

- [Docker](https://www.docker.com/get-started) & Docker Compose
- 或 Node.js 18+

### 方式 1：从 Docker Hub 直接运行（最简单）

```bash
# 一行命令即可运行！
docker run -d -p 80:80 -v bium-data:/app/data --name bium speardragon/bium:latest

# 在浏览器中访问
open http://localhost
```

### 方式 2：使用 Docker Compose 运行

```bash
# 下载 docker-compose.yml
curl -O https://raw.githubusercontent.com/speardragon/bium/main/docker-compose.yml

# 运行
docker-compose up -d

# 在浏览器中访问
open http://localhost
```

### 方式 3：从源码构建

```bash
# 克隆仓库
git clone https://github.com/speardragon/bium.git
cd bium

# 构建并运行Docker镜像
docker-compose up --build -d

# 在浏览器中访问
open http://localhost
```

### 方式 4：本地开发环境

```bash
# 克隆仓库
git clone https://github.com/speardragon/bium.git
cd bium

# 运行Backend
cd backend
npm install
npm run dev

# 在新终端中运行Frontend
cd frontend
npm install
npm run dev

# 在浏览器中访问
open http://localhost:5173
```

### 关闭

```bash
# 使用Docker时
docker stop bium && docker rm bium
# 或使用Docker Compose时
docker-compose down

# 本地运行时
# 在每个终端中按Ctrl+C
```

### 更新

```bash
# 拉取最新镜像
docker pull speardragon/bium:latest

# 重启容器
docker stop bium && docker rm bium
docker run -d -p 80:80 -v bium-data:/app/data --name bium speardragon/bium:latest
```

---

## 主要功能

### 1. Inbox - 准备材料

左侧边栏的 Inbox 是倾倒脑中任务的地方。

- **添加任务**：输入标题和预计所需时间
- **时间必填**：所有任务都需要时间（默认 30 分钟）
- **可拖拽**：拖动卡片移动到 Queue

### 2. Weekly Plan View - 填充容器

在主界面一目了然地查看本周的时间结构。

- **按天排列 Queue**：周一至周五各天设置的时间块
- **实时容量计算**：每次添加任务时显示剩余时间
- **Buffer 可视化**：空闲时间用斜线图案显示

### 3. Queue - 有容量的时间容器

Bium 的核心功能。每个 Queue 显示：

| 状态 | 容量    | 视觉表现            |
| ---- | ------- | ------------------- |
| 充裕 | ~70%    | 蓝色水位仪表        |
| 适中 | 70~100% | 橙色水位仪表        |
| 超出 | 100%+   | 红色警告 + 溢出动画 |

### 4. Drag & Drop

从 Inbox 拖动任务卡片放入所需的 Queue。

- **吸附效果**：靠近 Queue 时像磁铁一样吸附
- **实时反馈**：目标 Queue 高亮显示
- **撤销**：点击 Queue 中的任务返回 Inbox

### 5. Empty All Queues - 重置

当你觉得"这周完蛋了"时，可以清空所有 Queue 重新开始。

```
点击[Empty All Queues]按钮 → 所有任务返回Inbox
```

---

## 技术栈

| 领域         | 技术                                                       |
| ------------ | ---------------------------------------------------------- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Zustand, dnd-kit |
| **Backend**  | Node.js, Express, TypeScript, Lowdb                        |
| **Infra**    | Docker, Docker Compose, Nginx                              |

---

## 项目结构

```
bium/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── server.ts      # Express API服务器
│       ├── db.ts          # Lowdb数据库
│       └── types.ts       # 类型定义
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

## API 端点

| Method | Endpoint                     | 描述                 |
| ------ | ---------------------------- | -------------------- |
| GET    | `/api/queues`                | 获取所有 Queue       |
| POST   | `/api/queues`                | 创建 Queue           |
| GET    | `/api/tasks`                 | 获取所有 Task        |
| POST   | `/api/tasks`                 | 创建 Task            |
| POST   | `/api/weekly-plan/assign`    | 将 Task 分配到 Queue |
| POST   | `/api/weekly-plan/unassign`  | 将 Task 移回 Inbox   |
| POST   | `/api/weekly-plan/empty-all` | 清空所有 Queue       |

---

## 许可证

MIT License - 可自由使用、修改和分发。

---

<p align="center">
  <b>清空才能填满</b><br>
  当你承认时间的有限，真正的生产力才会开始。
</p>
