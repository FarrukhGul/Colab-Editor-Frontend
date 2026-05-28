# 📝 Collaborative Editor - Frontend

A real-time collaborative text editor built with **React**, **Socket.io**, **TipTap**, and **Yjs CRDT**. Multiple users can edit documents simultaneously with live cursor tracking, version history, and role-based access control.

## 🚀 Features

- ✨ **Real-time Collaboration** - Multiple users editing the same document simultaneously
- 👥 **Active Users Display** - See who's online with colored avatar indicators and live cursor positions
- 🔐 **Authentication** - JWT-based user authentication with refresh token support
- 👤 **Role-based Access** - Editor and Viewer roles for document collaborators
- 📜 **Version History** - Track document changes and restore previous versions
- 🎨 **Rich Text Formatting** - Bold, italic, underline, font color, font size, text alignment, and more
- 🔄 **Auto-save** - Automatic document saving every 30 seconds
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 📤 **Export Options** - Download as PDF or Markdown
- 🌐 **Live Sync** - CRDT-based synchronization using Yjs for conflict-free updates

## 📋 Prerequisites

- **Node.js** >= 16.x
- **npm** >= 8.x
- Backend server running (see [Backend README](../backend/README.md))

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/collaborative-editor.git
   cd collaborative-editor/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your backend URL:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

## 🎯 Getting Started

### Development Server
```bash
npm run dev
```
The app will run at `http://localhost:5173`

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm preview
```

### Lint Code
```bash
npm run lint
```

## 📁 Project Structure

```
src/
├── pages/                          # Page components
│   ├── Dashboard.jsx              # Document list & management
│   ├── Editor.jsx                 # Collaborative editor page
│   ├── Login.jsx                  # Login page
│   └── Register.jsx               # Registration page
├── components/
│   ├── editor/
│   │   ├── EditorToolbar.jsx      # Text formatting toolbar
│   │   ├── ActiveUsers.jsx        # Connected users display
│   │   └── extensions/
│   │       └── FontSize.js        # Custom TipTap font size extension
│   ├── dashboard/
│   │   ├── DocumentCard.jsx       # Document preview card
│   │   └── CreateDocumentModal.jsx # Create document modal
│   └── Routes/
│       └── ProtectedRoutes.jsx    # Auth guard component
├── context/
│   ├── AuthContext.jsx            # Auth context definition
│   └── AuthProvider.jsx           # Auth state provider
├── hooks/
│   ├── useAuth.js                 # Custom auth hook
│   └── useSocket.js               # Socket.io connection hook
├── services/
│   └── api.js                     # Axios API client with interceptors
├── App.jsx                        # Main app router
├── main.jsx                       # React entry point
└── index.css                      # Global styles (Tailwind)
```

## 🔌 API Integration

The frontend communicates with the backend via:

1. **REST API** - HTTP requests for auth, documents, collaborators, versions
2. **WebSocket** - Real-time collaboration and active user updates

### Key API Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/documents` - Get all user documents
- `POST /api/documents` - Create new document
- `GET /api/documents/:id` - Get document content
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

## 🔐 Authentication Flow

1. User registers/logs in → Gets `accessToken` and `refreshToken`
2. Tokens stored in `localStorage`
3. API interceptor adds `accessToken` to all requests
4. On 401 response → Auto-refresh token via `/auth/refresh`
5. WebSocket connection authenticated with JWT token

## ⚡ Socket.io Events

**Client → Server:**
- `join-document` - Join a document collaboration room
- `content-changed` - Document content update
- `save-document` - Save document to database
- `cursor-move` - Broadcast cursor position
- `disconnect` - Clean up when leaving

**Server → Client:**
- `document-loaded` - Document content and metadata
- `content-update` - Incoming document changes
- `active-users` - List of connected users
- `user-joined` - New user connected
- `user-left` - User disconnected

## 🎨 Available Commands in Editor

- **Bold** - Ctrl+B / Cmd+B
- **Italic** - Ctrl+I / Cmd+I
- **Underline** - Ctrl+U / Cmd+U
- **Undo** - Ctrl+Z / Cmd+Z
- **Redo** - Ctrl+Y / Cmd+Y

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `react` | UI library |
| `react-router-dom` | Routing |
| `axios` | HTTP client |
| `socket.io-client` | Real-time communication |
| `@tiptap/react` | Rich text editor |
| `yjs` | CRDT library |
| `y-websocket` | WebSocket provider for Yjs |
| `tailwindcss` | CSS framework |
| `react-icons` | Icon library |

## 🚀 Deployment

### Deploy to Vercel (Recommended)
1. Push code to GitHub
2. Connect Vercel to your GitHub repository
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Deploy to Other Platforms
Update `.env` with production backend URL and build:
```bash
npm run build
```

## 🔧 Configuration

### Environment Variables
```env
VITE_API_URL=https://your-backend-url.com/api
```

### Customization
- **Colors** - Edit `src/index.css` and Tailwind config
- **Toolbar Icons** - Update `EditorToolbar.jsx`
- **Auto-save Interval** - Modify `Editor.jsx` (default: 30s)
- **Avatar Colors** - Update `AVATAR_COLORS` array in `Editor.jsx`

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| WebSocket connection fails | Check backend is running and CORS is configured correctly |
| 401 Unauthorized errors | Clear localStorage and re-login |
| Content not syncing | Ensure both users are in the same document room |
| Token refresh loops | Check JWT secret in backend env variables |

## 📝 Best Practices

1. **Auto-save** happens every 30 seconds - manual save via toolbar
2. **Role-based Access** - Viewers can only read, Editors can modify
3. **Version History** - Always available in the version panel
4. **Disconnection Handling** - Auto-reconnect with exponential backoff
5. **Token Management** - Automatic refresh on 401 responses

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Check the [troubleshooting guide](#troubleshooting)
- Review the [backend README](../backend/README.md)
- Open an issue on GitHub

---

**Happy Collaborating! 🎉**
