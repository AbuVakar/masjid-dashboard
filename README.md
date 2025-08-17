# 🕌 Silsila-ul-Ahwaal - Masjid Dashboard

A comprehensive Progressive Web App (PWA) for community management and masjid administration.

## 🌟 Features

### 🔐 Authentication System
- **Multi-role Access**: Admin, User, and Guest modes
- **JWT Authentication**: Secure token-based authentication
- **Guest Mode**: Temporary access without registration
- **Session Persistence**: Automatic login state management

### 📊 Community Management
- **House Management**: Add, edit, and organize community houses
- **Member Profiles**: Detailed member information and tracking
- **Advanced Filtering**: Search by house number, street, occupation, education
- **Data Export**: Excel and PDF export capabilities

### 🕌 Masjid Features
- **Prayer Times**: Customizable prayer time management
- **Notifications**: Browser notifications for prayer times
- **Resources**: Islamic resources and community information
- **Analytics**: Community statistics and insights

### 🚀 PWA Capabilities
- **Offline Support**: Works without internet connection
- **Mobile Optimized**: Responsive design for all devices
- **Installable**: Can be installed as a mobile app
- **Service Worker**: Background sync and caching

## 🛠️ Tech Stack

### Frontend
- **React.js**: Modern UI framework
- **Custom Hooks**: Reusable state management
- **PWA**: Progressive Web App features
- **Service Worker**: Offline capabilities

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication tokens

### Development
- **ESLint**: Code quality
- **Error Handling**: Comprehensive error management
- **Logging**: Winston-based logging system
- **Testing**: Jest test framework

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd masjid-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd server && npm install
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Create environment file
   cp server/config.env.example server/config.env
   
   # Edit config.env with your settings
   MONGODB_URI=mongodb://localhost:27017/masjid-dashboard
   JWT_SECRET=your-secret-key
   PORT=5000
   ```

4. **Database Setup**
   ```bash
   cd server
   node seedAdmin.js
   cd ..
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1: Start backend
   cd server && npm start
   
   # Terminal 2: Start frontend
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🔐 Default Credentials

### Admin Access
- **Username**: `admin`
- **Password**: `admin123`

### Guest Mode
- Click "Continue as Guest" for temporary access

## 📱 PWA Installation

1. Open the app in Chrome/Edge
2. Click the install icon in the address bar
3. Or use "Add to Home Screen" from browser menu

## 🗂️ Project Structure

```
masjid-dashboard/
├── public/                 # Static files
│   ├── sw.js              # Service Worker
│   └── manifest.json      # PWA manifest
├── src/                   # Frontend source
│   ├── components/        # React components
│   ├── hooks/            # Custom hooks
│   ├── services/         # API services
│   └── utils/            # Utilities
├── server/               # Backend source
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   └── utils/            # Server utilities
└── tests/                # Test files
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/masjid-dashboard` |
| `JWT_SECRET` | JWT signing secret | Required |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `CORS_ORIGIN` | CORS allowed origin | `http://localhost:3000` |

### PWA Configuration

Edit `public/manifest.json` for app metadata:
```json
{
  "name": "Silsila-ul-Ahwaal",
  "short_name": "Masjid Dashboard",
  "description": "Community Management System",
  "theme_color": "#1e293b",
  "background_color": "#ffffff"
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run backend tests
cd server && npm test

# Run frontend tests
npm test -- --watchAll=false
```

## 📦 Deployment

### Frontend (Netlify/Vercel)
```bash
npm run build
# Deploy build/ folder
```

### Backend (Heroku/Railway)
```bash
cd server
# Deploy server/ folder
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## 🙏 Acknowledgments

- Community members for feedback
- Open source contributors
- Islamic community organizations

---

**Built with ❤️ for the Muslim Community**
