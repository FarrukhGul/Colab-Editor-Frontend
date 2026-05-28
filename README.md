# 🎉 Collaborative Document Editor

A production-ready **real-time collaborative text editor** built with **MERN Stack** (MongoDB, Express, React, Node.js) and **Socket.io**. Multiple users can edit documents simultaneously with live cursor tracking, version history, and role-based access control.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-ISC-green)
![Node](https://img.shields.io/badge/node-%3E%3D16.x-brightgreen)

## 🌟 Key Features

### 🔄 Real-time Collaboration
- **Live Document Sync** - Changes sync instantly across all connected users
- **CRDT Technology** - Uses Yjs for conflict-free concurrent edits
- **Cursor Tracking** - See exactly where other users are typing with colored cursors
- **Active User Indicators** - Know who's currently viewing the document

### 🔐 Authentication & Security
- **JWT Authentication** - Secure token-based authentication
- **Refresh Tokens** - Automatic token rotation for enhanced security
- **Role-based Access** - Editor and Viewer roles per document
- **Password Hashing** - bcryptjs with 10 salt rounds
- **Security Headers** - Helmet.js for HTTP security

### 📝 Rich Text Editing
- **Text Formatting** - Bold, italic, underline, font color, font size
- **Text Alignment** - Left, center, right, justify alignment
- **Undo/Redo** - Full undo/redo support
- **Code Blocks** - Format text as code
- **Custom Extensions** - Extensible TipTap editor framework

### 📜 Version Control
- **Auto Snapshots** - Document versions saved automatically
- **Restore Versions** - Revert to any previous version
- **Version History** - Timeline view of all changes
- **Metadata** - Track who made changes and when

### 🎨 User Interface
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Mode Ready** - Tailwind CSS with dark mode support
- **Intuitive Dashboard** - Easy document management
- **Search & Filter** - Find documents quickly

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│              Frontend (React + Vite)            │
│  - Pages: Dashboard, Editor, Login, Register   │
│  - Components: Toolbar, Editor, ActiveUsers    │
│  - Services: API client with JWT interceptors  │
│  - Socket: Real-time updates via Socket.io     │
└────────────────┬────────────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
    ↓ REST API & WebSocket    │
┌─────────────────────────────────────────────────┐
│           Backend (Node.js + Express)           │
│  - Routes: Auth, Documents, Collaborators      │
│  - Controllers: Business logic                 │
│  - Models: User, Document, Version, Blacklist  │
│  - Socket: Real-time sync handlers             │
└────────────────┬────────────────────────────────┘
                 │
                 ↓ Mongoose ODM
         ┌───────────────┐
         │   MongoDB     │
         │  Collections  │
         └───────────────┘
```

## 📂 Project Structure

```
collaborative-editor/
├── frontend/                      # React frontend
│   ├── src/
│   │   ├── pages/               # Page components
│   │   ├── components/          # Reusable components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API services
│   │   ├── context/             # Auth context
│   │   └── assets/              # Images and icons
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json              # Vercel deployment
│   └── README.md                # Frontend documentation
│
├── backend/                       # Node.js backend
│   ├── src/
│   │   ├── controllers/         # Request handlers
│   │   ├── models/              # Mongoose schemas
│   │   ├── routes/              # API routes
│   │   ├── middleware/          # Express middleware
│   │   ├── validators/          # Input validation
│   │   ├── socket/              # Socket.io handlers
│   │   └── config/              # Configuration
│   ├── server.js                # Entry point
│   ├── package.json
│   ├── render.yaml              # Render.com deployment
│   ├── .env.example
│   └── README.md                # Backend documentation
│
└── README.md                      # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 16.x
- **npm** >= 8.x
- **MongoDB** 4.4+ (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/collaborative-editor.git
cd collaborative-editor
```

### 2. Setup Backend

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MongoDB URI and JWT secrets
# MONGODB_URI=mongodb://localhost:27017/collab-editor
# ACCESS_TOKEN_SECRET=your-secret-key
# REFRESH_TOKEN_SECRET=your-secret-key

# Start development server
npm run dev
```

Backend runs on `http://localhost:3000`

### 3. Setup Frontend

```bash
cd ../frontend
npm install

# Create .env.local file
echo "VITE_API_URL=http://localhost:3000/api" > .env.local

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

### 4. Start Collaborating!
- Open `http://localhost:5173` in multiple browser windows
- Register new accounts
- Create a document and invite collaborators
- Start editing in real-time!

## 🔐 Environment Configuration

### Backend (.env)
```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/collab-editor

# JWT
ACCESS_TOKEN_SECRET=your_secret_key_min_32_chars
REFRESH_TOKEN_SECRET=your_secret_key_min_32_chars
ACCESS_TOKEN_EXPIRE=1h
REFRESH_TOKEN_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:3000/api
```

## 🧪 Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm run lint
```

## 📦 Key Technologies

### Frontend
- **React 19** - UI library
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS
- **Socket.io Client** - Real-time communication
- **TipTap** - Headless rich text editor
- **Yjs** - CRDT for collaboration
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Express.js** - Web framework
- **Socket.io** - WebSocket library
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Zod** - Schema validation
- **Helmet** - Security headers

## 📚 Documentation

- **[Frontend README](./frontend/README.md)** - React app documentation
- **[Backend README](./backend/README.md)** - Node.js server documentation

## 🚀 Deployment

### Frontend Deployment (Vercel)
1. Push code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Set environment variables
4. Deploy automatically

### Backend Deployment (Render)
1. Push code to GitHub
2. Create new service on [Render](https://render.com)
3. Set environment variables
4. Automatic deployment on push

**Included config files:**
- `frontend/vercel.json` - Vercel configuration
- `backend/render.yaml` - Render configuration

## 🔄 API Overview

### Authentication Endpoints
```
POST   /api/auth/register       - Create new user
POST   /api/auth/login          - Login user
POST   /api/auth/logout         - Logout user
POST   /api/auth/refresh        - Refresh token
GET    /api/auth/me             - Get current user
```

### Document Endpoints
```
GET    /api/documents           - List user's documents
POST   /api/documents           - Create document
GET    /api/documents/:id       - Get document
PUT    /api/documents/:id       - Update document
DELETE /api/documents/:id       - Delete document
```

### Collaborators
```
GET    /api/documents/:id/collaborators              - List collaborators
POST   /api/documents/:id/collaborators              - Add collaborator
DELETE /api/documents/:id/collaborators/:userId      - Remove collaborator
```

### Version Control
```
GET    /api/documents/:id/versions                   - Get version history
POST   /api/documents/:id/versions/restore           - Restore version
```

## 🔌 Real-time Events (Socket.io)

**Client → Server:**
- `join-document` - Join a document
- `content-changed` - Document content update
- `save-document` - Save to database
- `cursor-move` - Broadcast cursor position

**Server → Client:**
- `document-loaded` - Initial document state
- `content-update` - Incoming changes
- `active-users` - Connected users list
- `user-joined` - User connected
- `user-left` - User disconnected

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running locally or check Atlas connection string
- Verify IP whitelist on MongoDB Atlas

### CORS Errors
- Check `FRONTEND_URL` in backend `.env`
- Ensure frontend URL matches CORS allowlist in `app.js`

### Socket Connection Issues
- Verify both frontend and backend are running
- Check browser console for errors
- Ensure tokens are valid

### Auto-refresh Token Loop
- Check JWT secrets are the same across server restarts
- Verify system time synchronization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 Code Quality

- ESLint configuration for code style
- Mongoose schema validation
- Zod validation for API requests
- JWT token verification on protected routes

## 📊 Performance Considerations

- Auto-save every 30 seconds (configurable)
- Yjs CRDT for efficient synchronization
- MongoDB indexing on frequently queried fields
- JWT token expiration and refresh mechanism

## 🔒 Security Features

✅ Password hashing with bcryptjs  
✅ JWT token-based authentication  
✅ Helmet.js security headers  
✅ CORS configuration  
✅ Input validation with Zod  
✅ Socket.io authentication middleware  
✅ Token blacklist for logout  
✅ MongoDB injection prevention  

## 📄 License

This project is licensed under the **ISC License** - see LICENSE file for details

## 🙋 Support & Issues

- Check the documentation in each folder
- Review [troubleshooting guides](./backend/README.md#troubleshooting)
- Open an issue on GitHub with detailed description

## 🎯 Roadmap

- [ ] Dark mode toggle
- [ ] Comments and mentions
- [ ] Document sharing links
- [ ] Real-time notifications
- [ ] Document templates
- [ ] Rich media embedding
- [ ] Offline support
- [ ] Mobile app

## 👨‍💻 Author

**Created with ❤️ for seamless collaboration**

---

**Start collaborating now! [Open Editor](http://localhost:5173)**
