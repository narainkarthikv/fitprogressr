![License](https://img.shields.io/github/license/narainkarthikv/fitprogressr)
![Version](https://img.shields.io/badge/version-1.1.4-blue)
![Last Commit](https://img.shields.io/github/last-commit/narainkarthikv/fitprogressr)
[![CI](https://github.com/narainkarthikv/fitprogressr/actions/workflows/ci.yml/badge.svg)](https://github.com/narainkarthikv/fitprogressr/actions/workflows/ci.yml)
[![GitHub issues](https://img.shields.io/github/issues/narainkarthikv/fitprogressr)](https://github.com/narainkarthikv/fitprogressr/issues)
[![GitHub stars](https://img.shields.io/github/stars/narainkarthikv/fitprogressr)](https://github.com/narainkarthikv/fitprogressr/stargazers)

# FitProgressr

**Your complete fitness journey companion built with the MERN stack.**

FitProgressr is a powerful, open-source fitness logging application that helps you track workouts, visualize progress, and stay motivated. Built with modern web technologies and designed for fitness enthusiasts of all levels.

## ✨ Features

- **📊 Exercise Logging**: Track unlimited exercises with reps, sets, and weight
- **🗓️ Activity Heatmap**: Visual calendar showing your workout consistency
- **📈 Progress Analytics**: Charts and statistics to monitor your fitness journey
- **💪 Workout Routines**: Create and manage custom workout plans
- **💬 Daily Motivation**: Inspirational fitness quotes to keep you going
- **👤 User Profiles**: Personalized dashboard with your fitness data
- **🌙 Modern UI**: Clean, responsive design with Material-UI components
- **🔐 Secure Authentication**: JWT-based user authentication and authorization
- **📱 Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile
- **🐳 Docker Ready**: One-command setup with Docker Compose

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **MongoDB Atlas** account (or local MongoDB)
- **Docker** & **Docker Compose** (optional, for containerized setup)

### 🐳 Quick Start with Docker (Recommended)

Get the entire application running in seconds:

```bash
# Clone the repository
git clone https://github.com/narainkarthikv/fitprogressr.git
cd FitProgressr

# Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and API keys

# Start all services
docker-compose up -d --build

# View logs
docker-compose logs -f
```

**Access the application:**

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

**Deployments:**

- **Production**: https://fitprogressr.netlify.app/
- **Development**: https://fitprogressr-dev.vercel.app/

**Useful Docker Commands:**

```bash
# View running containers
docker-compose ps

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose stop

# Remove services and volumes
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Restart services
docker-compose restart

# Execute commands in container
docker-compose exec backend npm install
docker-compose exec frontend npm install
```

### 📦 Local Installation

#### 1️⃣ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp ../.env.example .env
```

Configure `backend/.env`:

```bash
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=7d
ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/fitprogressr
```

Start the server:

```bash
# Development mode with auto-reload
npm run dev

# Production mode
node server.js
```

#### 2️⃣ Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp ../.env.example .env
```

Configure `frontend/.env`:

```bash
VITE_API_URL=http://localhost:5000/
VITE_APININJAS=your-api-ninjas-key-here
```

Start the development server:

```bash
npm run dev
```

The application will be available at **http://localhost:5173**

## 🛠️ Tech Stack

### Frontend

- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **Redux Toolkit** - State management
- **Material-UI** - Component library
- **Emotion** - CSS-in-JS styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Calendar Heatmap** - Activity visualization
- **Lottie** - Animation library
- **Vitest** - Testing framework

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### DevOps

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD pipelines
- **Netlify/Vercel** - Frontend deployment

<p align="center">
  <img src="https://skillicons.dev/icons?i=react,vite,redux,materialui,nodejs,express,mongodb,docker,github" alt="Tech Stack" />
</p>

## 📁 Project Structure

### Frontend Structure

```
frontend/
├── public/
│   └── _redirects              # Netlify routing configuration
├── src/
│   ├── assets/
│   │   └── lottie/            # Animation files
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   │   └── AuthModal.jsx
│   │   ├── common/            # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── InputField.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Snackbar.jsx
│   │   ├── dashboard/         # Landing page components
│   │   │   ├── Hero.jsx
│   │   │   ├── Features.jsx
│   │   │   └── Footer.jsx
│   │   ├── Exercise/          # Exercise management
│   │   │   ├── Exercise.jsx
│   │   │   ├── ExerciseForm.jsx
│   │   │   └── ExerciseTable.jsx
│   │   ├── Heatmap/           # Activity heatmap
│   │   │   ├── Heatmap.css
│   │   │   ├── HeatmapControls.jsx
│   │   │   └── ExerciseModal.jsx
│   │   ├── Navbar/            # Navigation
│   │   │   ├── NavBar.jsx
│   │   │   └── UserDropdown.jsx
│   │   └── profile/           # User profile
│   │       └── EditProfileModal.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx      # Main app page
│   │   └── Home.jsx           # Landing page
│   ├── slices/                # Redux slices
│   │   ├── exercisesSlice.js
│   │   ├── heatMapSlice.js
│   │   └── userRoutineSlice.js
│   ├── store/
│   │   └── store.js           # Redux store configuration
│   ├── theme/
│   │   └── theme.js           # Material-UI theme
│   ├── App.jsx                # Root component
│   └── main.jsx               # Entry point
├── Dockerfile
├── package.json
└── vite.config.js
```

### Backend Structure

```
backend/
├── models/
│   ├── user.model.js          # User schema & methods
│   └── exercise.model.js      # Exercise schema
├── routes/
│   ├── user.js                # User authentication & profile
│   ├── exercises.js           # Exercise CRUD operations
│   └── health.js              # Health check endpoint
├── middleware/
│   └── jwtAuth.js             # JWT verification middleware
├── server.js                  # Express app & server config
├── Dockerfile
└── package.json
```

## 🔑 Environment Variables

### Backend Configuration

Create a `.env` file in the root directory:

```bash
# Server Configuration
NODE_ENV=development
PORT=5000

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRATION=7d

# Database
ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/fitprogressr?retryWrites=true&w=majority

# Docker Configuration
BACKEND_PORT=5000
FRONTEND_PORT=5173
```

### Frontend Configuration

Frontend environment variables (included in root `.env`):

```bash
# API Configuration
VITE_API_URL=http://localhost:5000/

# External APIs (Optional)
VITE_APININJAS=your-api-ninjas-key-for-quotes
```

### Getting API Keys

1. **MongoDB Atlas** (Required):
   - Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a cluster
   - Get connection string from "Connect" → "Connect your application"
   - Replace `<username>`, `<password>`, and database name

2. **API Ninjas** (Optional - for motivational quotes):
   - Sign up at [api-ninjas.com](https://api-ninjas.com/)
   - Get free API key from dashboard
   - Add to `VITE_APININJAS` in `.env`

## 🧪 Development

### Available Scripts

#### Backend

```bash
cd backend

# Development mode with hot reload
npm run dev

# Production mode
node server.js

# Run tests (to be implemented)
npm test
```

#### Frontend

```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Fix linting issues
npm run lint -- --fix

# Run tests
npm test
```

### Code Style Guidelines

- **Formatting**: ESLint + Prettier (2-space indentation)
- **Max Line Length**: 100 characters
- **React**: Functional components with hooks
- **State Management**: Redux Toolkit
- **Styling**: Material-UI with Emotion
- **API Calls**: Axios with async/await
- **Error Handling**: Try-catch blocks with proper error messages
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/)
  - `feat: add exercise deletion feature`
  - `fix: resolve JWT expiration bug`
  - `docs: update installation guide`
  - `refactor: optimize heatmap rendering`

### Formatting (Prettier)

Run these from the repository root so Prettier checks both frontend and backend:

```bash
# Check formatting
npx prettier --check .

# Write formatting fixes
npx prettier --write .
```

### API Endpoints

#### Authentication

```
POST   /api/user/register       # Register new user
POST   /api/user/login          # Login user
GET    /api/user/profile        # Get user profile (protected)
PUT    /api/user/profile        # Update user profile (protected)
```

#### Exercises

```
GET    /api/exercises           # Get all user exercises (protected)
POST   /api/exercises           # Create new exercise (protected)
GET    /api/exercises/:id       # Get exercise by ID (protected)
PUT    /api/exercises/:id       # Update exercise (protected)
DELETE /api/exercises/:id       # Delete exercise (protected)
```

#### Health Check

```
GET    /api/health              # Check API status
```

## 🤝 Contributing

We welcome contributions from the community! Here's how to get started:

### Ways to Contribute

- 🐛 **Fix bugs** and improve stability
- ✨ **Add features** that enhance the fitness tracking experience
- 📚 **Improve documentation** and tutorials
- 🎨 **Enhance UI/UX** and accessibility
- ⚡ **Optimize performance** and code quality
- 🧪 **Add tests** to increase coverage
- 🌍 **Add translations** for internationalization

### Contribution Workflow

1. **Fork the repository** and clone it locally
2. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes** and commit with descriptive messages:
   ```bash
   git commit -m "feat: add workout streak counter"
   ```
4. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request** to the `develop` branch
6. **Respond to feedback** from maintainers

### Branch Naming Convention

- Features: `feature/description`
- Bug fixes: `fix/description`
- Documentation: `docs/description`
- Refactoring: `refactor/description`
- Chores: `chore/description`

### Pull Request Guidelines

- Keep PRs focused on a single feature/fix
- Link related issues in the PR description
- Add screenshots for UI changes
- Ensure all tests pass
- Update documentation if needed
- Request review from maintainers

**Good First Issues**: Look for issues labeled `good first issue` to get started!

For detailed guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md)

## 🐛 Troubleshooting

### Common Issues

#### Docker Issues

**Containers won't start:**

```bash
# Check Docker daemon is running
docker ps

# View detailed logs
docker-compose logs -f

# Remove old containers and rebuild
docker-compose down -v
docker-compose up -d --build
```

**Port conflicts:**

```bash
# Check what's using the ports
lsof -i :5000   # Backend
lsof -i :5173   # Frontend

# Or kill processes on those ports
kill -9 $(lsof -ti:5000)
kill -9 $(lsof -ti:5173)
```

**Hot reload not working:**

```bash
# Rebuild without cache
docker-compose up -d --build --no-cache

# Check file permissions
ls -la backend/
ls -la frontend/
```

#### Local Development Issues

**MongoDB connection failed:**

- Verify `ATLAS_URI` is correct in `.env`
- Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for development)
- Ensure database user has read/write permissions

**Frontend can't connect to backend:**

- Verify `VITE_API_URL` in frontend `.env`
- Check backend is running on correct port
- Verify CORS is enabled in `server.js`

**Dependencies issues:**

```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Build errors:**

```bash
git clone https://github.com/narainkarthikv/FitProgressr.git
cd FitProgressr
cp .env.example .env
docker-compose up -d --build

# Clear Vite cache
rm -rf .vite node_modules/.vite
npm run dev
```

**JWT authentication fails:**

- Ensure `JWT_SECRET` is set in backend `.env`
- Check token is included in request headers
- Verify token hasn't expired

### Getting Help

- 📖 Check the [documentation](./CONTRIBUTING.md)
- 🐛 [Report bugs](https://github.com/narainkarthikv/fitprogressr/issues)
- 💬 [Ask questions](https://github.com/narainkarthikv/fitprogressr/discussions)
- 💡 [Request features](https://github.com/narainkarthikv/fitprogressr/issues)

## 📖 Documentation

- [Contributing Guide](./CONTRIBUTING.md) - How to contribute
- [Code of Conduct](./CODE_OF_CONDUCT.md) - Community guidelines
- [Contributors](./Contributors.md) - Our amazing contributors
- [License](./MIT-LICENSE.txt) - MIT License details

## 👥 Contributors

Thanks to everyone who has helped make FitProgressr awesome! 💪

<a href="https://github.com/narainkarthikv/fitprogressr/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=narainkarthikv/fitprogressr" alt="Contributors" />
</a>

See the [Contributors Page](./Contributors.md) for the full list.

## 📜 License

This project is licensed under the **MIT License** - see [MIT-LICENSE.txt](./MIT-LICENSE.txt) for details.

**Summary:** You are free to use, modify, and distribute this software for any purpose, including commercial use.

## 💬 Community & Support

- **Issues**: [Report bugs or request features](https://github.com/narainkarthikv/fitprogressr/issues)
- **Discussions**: [Ask questions and share ideas](https://github.com/narainkarthikv/fitprogressr/discussions)
- **Pull Requests**: [Contribute code improvements](https://github.com/narainkarthikv/fitprogressr/pulls)

## 🌟 Show Your Support

If FitProgressr helps you on your fitness journey:

- ⭐ Star the repository
- 🐛 Report issues you encounter
- 💡 Share your feature ideas
- 🤝 Contribute code or documentation
- 📢 Tell others about the project
- 💬 Join discussions and help others

## 🔗 Links

- Repository: https://github.com/narainkarthikv/FitProgressr
- Issues: https://github.com/narainkarthikv/FitProgressr/issues
- Discussions: https://github.com/narainkarthikv/FitProgressr/discussions

Want to help build these features? Check out our [Contributing Guide](./CONTRIBUTING.md)!

## 💻 Development Setup Tips

### Recommended VS Code Extensions

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **ES7+ React/Redux** - React snippets
- **Docker** - Docker support
- **MongoDB for VS Code** - Database management
- **GitLens** - Git integration
- **Thunder Client** - API testing

### Recommended Tools

- **MongoDB Compass** - GUI for MongoDB
- **Postman** or **Insomnia** - API testing
- **React Developer Tools** - Browser extension
- **Redux DevTools** - Browser extension

## 🙏 Acknowledgments

- Thanks to all our [contributors](./Contributors.md) who have helped build FitProgressr
- Built with amazing open-source technologies
- Inspired by the fitness and developer communities

---

**Built with ❤️ by the Wisdom Fox community**

_Let's build the best fitness tracker together! 🚀_

## End-to-End Testing

This project uses Playwright for browser-based end-to-end testing.

### Run tests locally

```bash
cd frontend
npm install
npx playwright install
npx playwright test
```

### Run tests in a specific browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Debug tests

```bash
npx playwright test --headed
npx playwright test --debug
```

Test files are located in `frontend/tests/e2e/`.
