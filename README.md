# Velozity Global Solutions | Real-Time Client Project Dashboard

> A high-performance, real-time client project management platform with strict API-level Role-Based Access Control (RBAC), WebSocket telemetry, and automated task lifecycle tracking.

---

## 🚀 Quick Demo Accounts

| Role | Name | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Victoria Vance | `admin@velozity.com` | `Admin@123` | Full global access — clients, projects, tasks, presence, global activity |
| **Project Manager** | Sarah Connor | `pm1@velozity.com` | `Password@123` | Creates/manages owned projects, assigns tasks, receives review notifications |
| **Project Manager** | Alex Murphy | `pm2@velozity.com` | `Password@123` | Isolated to second project portfolio; cannot access PM 1's projects |
| **Developer** | Ravi Kumar | `dev1@velozity.com` | `Password@123` | Can only view & transition assigned tasks; scoped activity feed |
| **Developer** | Priya Sharma | `dev2@velozity.com` | `Password@123` | Assigned to overdue & in-progress deliverables |
| **Developer** | John Doe | `dev3@velozity.com` | `Password@123` | Assigned across multi-model AI projects |
| **Developer** | Elena Rostova | `dev4@velozity.com` | `Password@123` | Assigned across telemedicine & RAG projects |

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS, Lucide Icons, Socket.IO Client, Axios with token refresh interceptors.
- **Backend**: Node.js & Express with TypeScript, Socket.IO, Node-Cron, Zod payload validation, Cookie-Parser, BCrypt.
- **Database & ORM**: PostgreSQL with Prisma ORM (relational schema, cascades, and compound indexes).
- **Real-Time**: Socket.IO with WebSocket transport, presence heartbeat, and room-partitioned event distribution.

---

## ⚙️ Local Setup Instructions

### Option A: Running with Docker Compose (Recommended)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd vsp
   ```
2. Start all services (PostgreSQL, Backend API, Frontend SPA):
   ```bash
   docker-compose up --build
   ```
3. Open your browser:
   - **Frontend Application**: `http://localhost:3000`
   - **Backend API**: `http://localhost:5000/api`
   - **API Health Check**: `http://localhost:5000/health`

---

### Option B: Manual Setup (Local Node + PostgreSQL)

#### 1. Backend Setup
```bash
cd backend
cp .env.example .env
# Ensure PostgreSQL is running and update DATABASE_URL in .env if needed
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev
```

#### 2. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5173` to use the application.

---

## 🗄️ Database Schema & Indexing Decisions

### Schema Architecture
```
+---------------------------------------------------------------------------------+
|                                 USER (users)                                    |
| id (PK) | email (UQ) | password | name | role [ADMIN, PROJECT_MANAGER, DEVELOPER] |
+---------------------------------------------------------------------------------+
         | 1                                        | 1
         | managedProjects                          | assignedTasks
         v N                                        v N
+------------------------------------+   +------------------------------------+
|         PROJECT (projects)         |   |            TASK (tasks)            |
| id (PK) | title | status | pmId(FK)|<--| id (PK) | taskNumber | title       |
| clientId (FK)                      |   | status [TO_DO, IN_PROGRESS,        |
+------------------------------------+   |         IN_REVIEW, DONE]           |
         | 1                             | priority [LOW, MEDIUM, HIGH,       |
         | belongs to                    |           CRITICAL]                |
         v N                             | dueDate | isOverdue                |
+------------------------------------+   | projectId (FK) | assignedToId (FK) |
|         CLIENT (clients)           |   +------------------------------------+
| id (PK) | name | email | company   |           | 1             | 1
+------------------------------------+           v N             v N
                                         +---------------+ +------------------+
                                         | ACTIVITY_LOG  | | NOTIFICATION     |
                                         | id (PK)       | | id (PK)          |
                                         | action        | | title | message  |
                                         | details (JSON)| | read (Bool)      |
                                         | message       | | userId (FK)      |
                                         | userId (FK)   | | taskId (FK)      |
                                         | taskId (FK)   | | projectId (FK)   |
                                         | projectId(FK) | +------------------+
                                         +---------------+
```

### Indexing Decisions & Rationale
1. `@@index([projectId, status])` on `Task`: Critical for Kanban board filtering and project status aggregations.
2. `@@index([assignedToId])` on `Task`: Enables instant retrieval of Developer workspace deliverables without sequential table scans.
3. `@@index([dueDate, isOverdue])` on `Task`: Allows the scheduled background cron job to query overdue tasks efficiently in sub-millisecond time.
4. `@@index([createdAt(sort: Desc)])` on `ActivityLog`: Guarantees high-speed retrieval for the last 20 missed events on reconnect.
5. `@@index([userId, read])` on `Notification`: Powers immediate unread count badge lookups for every active user.

---

## 🏗️ Architectural Decisions

### 1. WebSocket Choice: Socket.IO over Native WebSockets
- **Decision**: Implemented `Socket.IO` with WebSocket transport.
- **Justification**: Socket.IO provides built-in room abstractions (`admin:feed`, `pm:<id>`, `dev:<id>`, `project:<id>`), automatic exponential reconnection backoff, and disconnection handling. Native WebSockets require building custom pub/sub room routers and heartbeat registries from scratch.

### 2. Job Queue / Scheduler: `node-cron` over Bull Queue
- **Decision**: Implemented `node-cron` running an automated 60-second overdue evaluator.
- **Justification**: For the scale of this application, `node-cron` provides zero-external-dependency background execution without requiring a separate Redis cluster. It evaluates uncompleted tasks whose `dueDate < NOW()`, flags `isOverdue = true`, persists an activity log, dispatches in-app notifications, and broadcasts live board updates.

### 3. Authentication & Token Storage: HttpOnly Cookies + Memory
- **Decision**: Dual-token architecture using Access Token (15m expiry) and Refresh Token (7d expiry).
- **Security**: The refresh token is stored exclusively in an **`HttpOnly`, `SameSite=Lax`, `Secure`** cookie. It is inaccessible to JavaScript, eliminating token theft via Cross-Site Scripting (XSS). Access tokens are refreshed automatically on 401 response interceptors.

---

## 🛡️ Role-Based Access Enforcement

Permissions are strictly checked on the backend at the controller and middleware level:
- **Admin**: Full access across all projects, clients, tasks, and users.
- **Project Manager**: Access restricted to projects they created (`pmId === req.user.id`). Attempting to query, update, or assign tasks to another PM's project yields `403 Forbidden`.
- **Developer**: Access restricted to tasks assigned to them (`assignedToId === req.user.id`). Direct API requests to inspect or modify other developers' tasks or modify project details are rejected with `403 Forbidden`.

---

## 📝 Required Explanation (150–250 Words)

### Hardest Problem Solved, Real-Time Role-Filtered Feed, and Future Improvements

> The most challenging aspect of this project was synchronizing real-time WebSocket state across strictly isolated role boundaries while guaranteeing reliable catch-up for offline clients.
> 
> To achieve genuine role-filtered live activity feeds, we engineered a multi-room pub/sub model in Socket.IO. When an action occurs (e.g., a status transition from *In Progress* → *In Review*), the backend writes the event to the database and dispatches it selectively: to the global `admin:feed` room, the project manager’s private `pm:<pmId>` room, the assigned developer’s `dev:<assignedToId>` room, and the active `project:<projectId>` room. If a user was offline, the initial handshake triggers a database query returning their last 20 scoped activity records (filtered by role and ownership), ensuring zero dependency on transient in-memory buffers.
> 
> If building this for a distributed multi-instance deployment, we would replace the single-process Socket.IO adapter and `node-cron` with a Redis Pub/Sub adapter (`@socket.io/redis-adapter`) and BullMQ with distributed locks (Redlock). This would prevent redundant cron execution across horizontal replicas while maintaining seamless WebSocket broadcast synchronization across clustered server nodes.

---

## ⚠️ Known Limitations
- Background scheduler currently runs on a single node instance. For clustered horizontal scaling, a distributed Redis-backed queue like BullMQ is recommended.
- File attachment uploads on tasks are not included in the scope.
