![main banner](../public/main.png)

<p align="center">
  <a href="../README.md">한국어</a> |
  <a href="./README_EN.md">English</a> |
  <a href="./README_JA.md">日本語</a> |
  <a href="./README_ZH.md">中文</a>
</p>

# Bium (ビウム)

> **「空けてこそ満たせる」**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docker Hub](https://img.shields.io/docker/v/speardragon/bium?label=Docker%20Hub&logo=docker&logoColor=white)](https://hub.docker.com/r/speardragon/bium)
[![Docker Pulls](https://img.shields.io/docker/pulls/speardragon/bium?logo=docker&logoColor=white)](https://hub.docker.com/r/speardragon/bium)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)

---

## プロジェクト紹介

**Bium（ビウム）**は、「やること」中心ではなく**「時間構造」中心**のスケジューリングツールです。

ほとんどのタスク管理アプリは、終わりのないタスクリストを表示し、「もっとやらなければ」というプレッシャーを与えます。Bium は違います。**時間は有限な器**という哲学から始まります。

### コアコンセプト：容量のある時間の器

Bium では、あなたの一日は**空のキュー（Queue）**から始まります。各キューは決まった容量を持つコンテナです。

- キューにタスクを入れると**水位が上がります**
- 70%以下：青色（余裕あり）
- 70〜100%：オレンジ色（注意）
- 100%超過：**赤い警告**とオーバーフローの可視化

この視覚的フィードバックは「時間が足りない」という事実を直感的に示し、無理な計画を立てる代わりに**現実的な優先順位決定**を助けます。

![スクリーンショット](../public/screenshot.png)

---

## インストールと実行

### 必要条件

- [Docker](https://www.docker.com/get-started) & Docker Compose
- または Node.js 18+

### 方法 1：Docker Hub から直接実行（最も簡単）

```bash
# 1行で実行！
docker run -d -p 80:80 -v bium-data:/app/data --name bium speardragon/bium:latest

# ブラウザでアクセス
open http://localhost
```

### 方法 2：Docker Compose で実行

```bash
# docker-compose.yml をダウンロード
curl -O https://raw.githubusercontent.com/speardragon/bium/main/docker-compose.yml

# 実行
docker-compose up -d

# ブラウザでアクセス
open http://localhost
```

### 方法 3：ソースからビルド

```bash
# リポジトリをクローン
git clone https://github.com/speardragon/bium.git
cd bium

# Dockerイメージをビルドして実行
docker-compose up --build -d

# ブラウザでアクセス
open http://localhost
```

### 方法 4：ローカル開発環境

```bash
# リポジトリをクローン
git clone https://github.com/speardragon/bium.git
cd bium

# Backendを実行
cd backend
npm install
npm run dev

# 新しいターミナルでFrontendを実行
cd frontend
npm install
npm run dev

# ブラウザでアクセス
open http://localhost:5173
```

### 終了

```bash
# Docker使用時
docker stop bium && docker rm bium
# またはDocker Compose使用時
docker-compose down

# ローカル実行時
# 各ターミナルでCtrl+C
```

### アップデート

```bash
# 最新イメージをpull
docker pull speardragon/bium:latest

# コンテナを再起動
docker stop bium && docker rm bium
docker run -d -p 80:80 -v bium-data:/app/data --name bium speardragon/bium:latest
```

---

## 主な機能

### 1. Inbox - 材料を準備する

左サイドバーの Inbox は、頭の中のタスクを吐き出す場所です。

- **タスク追加**：タイトルと予想所要時間を入力
- **時間必須**：すべてのタスクには時間が必要です（デフォルト 30 分）
- **ドラッグ可能**：カードをドラッグして Queue に移動

### 2. Weekly Plan View - 器を満たす

メイン画面で今週の時間構造を一目で確認できます。

- **曜日別 Queue 配置**：月〜金の各曜日に設定された時間ブロック
- **リアルタイム容量計算**：Queue にタスクが追加されるたびに残り時間を表示
- **Buffer 可視化**：余裕時間は斜線パターンで表示

### 3. Queue - 容量のある時間コンテナ

Bium のコア機能です。各 Queue は：

| 状態 | 容量     | 視覚的表現                              |
| ---- | -------- | --------------------------------------- |
| 余裕 | 〜70%    | 青い水位ゲージ                          |
| 適正 | 70〜100% | オレンジの水位ゲージ                    |
| 超過 | 100%+    | 赤い警告 + オーバーフローアニメーション |

### 4. Drag & Drop

Inbox のタスクカードをドラッグして、希望の Queue にドロップしてください。

- **スナップ効果**：Queue 付近で磁石のようにくっつく
- **リアルタイムフィードバック**：ドロップ対象の Queue がハイライト
- **元に戻す**：Queue 内のタスクをクリックすると Inbox に戻る

### 5. Empty All Queues - リセット

「今週はダメだ」と思ったとき、すべての Queue を空にして最初からやり直せます。

```
[Empty All Queues]ボタンをクリック → すべてのタスクがInboxに戻る
```

---

## 技術スタック

| 領域         | 技術                                                       |
| ------------ | ---------------------------------------------------------- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Zustand, dnd-kit |
| **Backend**  | Node.js, Express, TypeScript, Lowdb                        |
| **Infra**    | Docker, Docker Compose, Nginx                              |

---

## プロジェクト構造

```
bium/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── server.ts      # Express APIサーバー
│       ├── db.ts          # Lowdbデータベース
│       └── types.ts       # 型定義
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

## API エンドポイント

| Method | Endpoint                     | 説明                      |
| ------ | ---------------------------- | ------------------------- |
| GET    | `/api/queues`                | すべての Queue 取得       |
| POST   | `/api/queues`                | Queue 作成                |
| GET    | `/api/tasks`                 | すべての Task 取得        |
| POST   | `/api/tasks`                 | Task 作成                 |
| POST   | `/api/weekly-plan/assign`    | Task を Queue に割り当て  |
| POST   | `/api/weekly-plan/unassign`  | Task を Inbox に移動      |
| POST   | `/api/weekly-plan/empty-all` | すべての Queue を空にする |

---

## ライセンス

MIT License - 自由に使用、修正、配布できます。

---

<p align="center">
  <b>空けてこそ満たせる</b><br>
  時間の限界を認めたとき、真の生産性が始まります。
</p>
