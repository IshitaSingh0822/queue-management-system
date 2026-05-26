# QueueFlow — Smart Queue Management System

A full-featured, real-time Queue Management System built with the **MERN Stack** (MongoDB, Express, React, Node.js) and **Bootstrap 5**, featuring a sleek dark futuristic UI with live Socket.io updates.

---

## Features

- ** Dashboard** — Real-time overview of all queues and statistics
- ** Token Generation** — Customer-facing page to generate service tokens
- ** Display Board** — Live TV-style display board showing currently serving tokens
- ** Queue Management** — Create, edit, pause, resume, and delete queues
- ** Real-time Updates** — Socket.io powered live updates across all clients
- ** Priority Tokens** — Support for normal and priority customers
- ** Responsive Design** — Works on desktop, tablet, and mobile
- ** Toast Notifications** — Instant feedback for every action

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, React Router 6, Bootstrap 5 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose |
| **Real-time** | Socket.io |
| **Styling** | Custom CSS with CSS Variables, Bootstrap Icons |
| **Fonts** | Syne (display), DM Sans (body) |

---

## Getting Started

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- npm or yarn

---

### Step 1 — Clone / Extract the Project

```bash
# Navigate to the project folder
cd queue-management-system
```

---

### Step 2 — Setup the Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment (edit .env if needed)
# Default: connects to mongodb://localhost:27017/queue_management
# Edit .env to point to your MongoDB URI

# Start the backend server
npm run dev        # Development (with nodemon)
# OR
npm start          # Production
```

The backend will start on **http://localhost:5000**

---

### Step 3 — Setup the Frontend

Open a **new terminal tab/window**:

```bash
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

The frontend will open at **http://localhost:3000**

---

### Step 4 — Open the App

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Main Dashboard |
| `http://localhost:3000/queues` | Queue Management |
| `http://localhost:3000/generate` | Generate Token (Customer) |
| `http://localhost:3000/display` | Display Board (for TV) |
| `http://localhost:5000/api/health` | Backend Health Check |

---

## Project Structure

```
queue-management-system/
 backend/
    models/
       Queue.js          # Queue schema
       Token.js          # Token schema
    routes/
       queues.js         # Queue CRUD + actions
       tokens.js         # Token CRUD + generation
    .env                  # Environment config
    package.json
    server.js             # Express + Socket.io server

 frontend/
     public/
        index.html
     src/
         api.js                    # Axios API helper
         App.js                    # Router + layout
         index.js                  # Entry point
         components/
            Navbar.js             # Navigation bar
         context/
            SocketContext.js      # Socket.io context
            ToastContext.js       # Toast notifications
         pages/
            Dashboard.js          # Main dashboard
            Queues.js             # Queue list + creation
            QueueDetail.js        # Single queue management
            GenerateToken.js      # Token generation
            DisplayBoard.js       # Live display board
         styles/
             global.css            # Global custom styles
```

---

## Environment Variables

### Backend `.env`
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/queue_management
CLIENT_URL=http://localhost:3000
```

### Using MongoDB Atlas
Replace `MONGODB_URI` with your Atlas connection string:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/queue_management
```

---

## API Endpoints

### Queues
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/queues` | Get all queues |
| GET | `/api/queues/:id` | Get single queue |
| POST | `/api/queues` | Create queue |
| PUT | `/api/queues/:id` | Update queue |
| DELETE | `/api/queues/:id` | Delete queue |
| POST | `/api/queues/:id/next` | Call next token |
| POST | `/api/queues/:id/reset` | Reset queue |

### Tokens
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tokens/queue/:queueId` | Get tokens for queue |
| GET | `/api/tokens/all` | Get display board data |
| POST | `/api/tokens/generate` | Generate new token |
| PUT | `/api/tokens/:id/status` | Update token status |
| DELETE | `/api/tokens/:id` | Delete token |
| GET | `/api/tokens/stats/summary` | Get statistics |

---

## UI Features

- **Dark futuristic theme** with CSS variables
- **Gradient accents** with Indigo/Violet/Cyan palette
- **Glassmorphism** navbar with backdrop blur
- **Smooth animations** — card hover lifts, shimmer skeletons, pulse dots
- **Real-time pulse indicators** for queue status
- **Responsive grid layouts** that adapt to screen size
- **Display board** optimized for large TV screens

---

## Socket Events

| Event | Description |
|-------|-------------|
| `queue_created` | New queue added |
| `queue_updated` | Queue details changed |
| `queue_deleted` | Queue removed |
| `queue_reset` | Queue tokens cleared |
| `token_generated` | New token issued |
| `token_called` | Token called for service |
| `token_updated` | Token status changed |
| `token_deleted` | Token removed |

---

## Troubleshooting

**MongoDB Connection Error**
- Ensure MongoDB is running: `mongod --dbpath /data/db`
- Or use MongoDB Atlas and update `MONGODB_URI` in `.env`

**Port Already in Use**
- Backend: Change `PORT` in `.env`
- Frontend: Create `.env` in frontend folder with `PORT=3001`

**CORS Errors**
- Ensure `CLIENT_URL` in backend `.env` matches your frontend URL

---

## License

MIT License — Free to use and modify.

---

Built with MERN Stack + Bootstrap
