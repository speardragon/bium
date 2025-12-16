![main banner](../public/main.png)

<p align="center">
  <a href="../README.md">한국어</a> |
  <a href="./README_EN.md">English</a> |
  <a href="./README_JA.md">日本語</a> |
  <a href="./README_ZH.md">中文</a>
</p>

# Bium

> **"Empty to Fill"**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docker Hub](https://img.shields.io/docker/v/speardragon/bium?label=Docker%20Hub&logo=docker&logoColor=white)](https://hub.docker.com/r/speardragon/bium)
[![Docker Pulls](https://img.shields.io/docker/pulls/speardragon/bium?logo=docker&logoColor=white)](https://hub.docker.com/r/speardragon/bium)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)

---

## Inspiration

This project was inspired by the article ["The Three-Stage Evolution of Time Management: Why You Should Create an Empty Queue First"](https://unnud.com/the-three-stage-evolution-of-time-management-why-you-should-create-an-empty-queue-first/) from unnud Magazine.

> "Time is not an empty slot to fill, but a container to hold precious things. The right order is to prepare good containers first, then choose what to put in them."

---

## About

**Bium** is a scheduling tool that focuses on **'time structure'** rather than tasks.

Most to-do apps show an endless list of tasks, pressuring us to "do more." Bium is different. It starts from the philosophy that **time is a finite container**.

### Core Concept: Time as a Container with Capacity

In Bium, your day starts with **empty queues**. Each queue is a container with a fixed capacity.

- When you add tasks to a queue, the **water level rises**
- Below 70%: Blue (plenty of room)
- 70-100%: Orange (caution)
- Over 100%: **Red warning** with overflow visualization

This visual feedback intuitively shows that "time is limited," helping you make **realistic priority decisions** instead of overplanning.

![Screenshot](../public/screenshot.png)

---

## Installation & Setup

### Requirements

- [Docker](https://www.docker.com/get-started) & Docker Compose
- Or Node.js 18+

### Option 1: Using the Run Script (Recommended)

```bash
# Download the script
curl -O https://raw.githubusercontent.com/speardragon/bium/main/bium
chmod +x bium

# Run (automatically pulls the latest version)
./bium start

# Open in browser
open http://localhost
```

Script commands:
| Command | Description |
|---------|-------------|
| `./bium start` | Pull latest image and start |
| `./bium stop` | Stop |
| `./bium restart` | Restart with latest version |
| `./bium status` | Check status |
| `./bium logs` | View logs |

### Option 2: Run from Docker Hub

```bash
# Run with a single command!
docker run -d -p 80:80 -v bium-data:/app/data --name bium speardragon/bium:latest

# Open in browser
open http://localhost
```

### Option 3: Run with Docker Compose

```bash
# Download docker-compose.yml
curl -O https://raw.githubusercontent.com/speardragon/bium/main/docker-compose.yml

# Run
docker-compose up -d

# Open in browser
open http://localhost
```

### Option 4: Build from Source

```bash
# Clone repository
git clone https://github.com/speardragon/bium.git
cd bium

# Build and run Docker image
docker-compose up --build -d

# Open in browser
open http://localhost
```

### Option 5: Local Development

```bash
# Clone repository
git clone https://github.com/speardragon/bium.git
cd bium

# Start Backend
cd backend
npm install
npm run dev

# In a new terminal, start Frontend
cd frontend
npm install
npm run dev

# Open in browser
open http://localhost:5173
```

### Shutdown

```bash
# When using Docker
docker stop bium && docker rm bium
# Or when using Docker Compose
docker-compose down

# When running locally
# Press Ctrl+C in each terminal
```

### Update

```bash
# When using the script (automatically checks for latest version)
./bium restart

# Or manually
docker pull speardragon/bium:latest
docker stop bium && docker rm bium
docker run -d -p 80:80 -v bium-data:/app/data --name bium speardragon/bium:latest
```

---

## Features

### 1. Inbox - Prepare Your Tasks

The Inbox in the left sidebar is where you dump all your tasks.

- **Add tasks**: Enter title and estimated duration
- **Time required**: Every task needs a time estimate (default: 30 min)
- **Draggable**: Drag cards to move them to Queues

### 2. Weekly Plan View - Fill Your Containers

See your week's time structure at a glance on the main screen.

- **Daily Queue layout**: Time blocks set for each weekday (Mon-Fri)
- **Real-time capacity**: Remaining time updates as tasks are added
- **Buffer visualization**: Free time shown with diagonal pattern

### 3. Queue - Time Container with Capacity

The core feature of Bium. Each Queue shows:

| Status   | Capacity | Visual                           |
| -------- | -------- | -------------------------------- |
| Safe     | ~70%     | Blue water gauge                 |
| Warning  | 70~100%  | Orange water gauge               |
| Overflow | 100%+    | Red warning + overflow animation |

### 4. Drag & Drop

Drag task cards from Inbox and drop them into your desired Queue.

- **Snap effect**: Tasks snap to Queue like a magnet
- **Real-time feedback**: Target Queue highlights on hover
- **Undo**: Click a task in Queue to return it to Inbox

### 5. Empty All Queues - Reset

When you feel like "this week is ruined," empty all Queues and start fresh.

```
Click [Empty All Queues] → All tasks return to Inbox
```

---

## Tech Stack

| Area         | Technology                                                 |
| ------------ | ---------------------------------------------------------- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Zustand, dnd-kit |
| **Backend**  | Node.js, Express, TypeScript, Lowdb                        |
| **Infra**    | Docker, Docker Compose, Nginx                              |

---

## Project Structure

```
bium/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── server.ts      # Express API server
│       ├── db.ts          # Lowdb database
│       └── types.ts       # Type definitions
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

## API Endpoints

| Method | Endpoint                     | Description          |
| ------ | ---------------------------- | -------------------- |
| GET    | `/api/queues`                | Get all Queues       |
| POST   | `/api/queues`                | Create Queue         |
| GET    | `/api/tasks`                 | Get all Tasks        |
| POST   | `/api/tasks`                 | Create Task          |
| POST   | `/api/weekly-plan/assign`    | Assign Task to Queue |
| POST   | `/api/weekly-plan/unassign`  | Move Task to Inbox   |
| POST   | `/api/weekly-plan/empty-all` | Empty all Queues     |

---

## License

MIT License - Free to use, modify, and distribute.

---

<p align="center">
  <b>Empty to Fill</b><br>
  True productivity begins when you accept the limits of time.
</p>
