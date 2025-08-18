# 🕌 Silsila-ul-Ahwaal - Masjid Dashboard

A comprehensive Progressive Web App (PWA) for community management and masjid administration. This project has been audited and refactored for improved performance, readability, and maintainability.

## 🌟 Key Features

- **Robust Authentication:** Secure JWT-based authentication with roles for Admin, User, and Guest.
- **Community Management:** Add, edit, and manage community houses and member profiles with ease.
- **Advanced Filtering:** Powerful search and filtering capabilities for houses and members.
- **Data Export:** Export community data to Excel and PDF formats.
- **Masjid Administration:** Manage prayer times, resources, and community announcements.
- **PWA Ready:** Fully responsive and installable on mobile devices with offline support.
- **Comprehensive Testing:** Full test coverage for the backend API and critical frontend components.
- **Clean Codebase:** Refactored and optimized code with consistent styling enforced by ESLint and Prettier.

## 🛠️ Tech Stack

- **Frontend:** React.js, React Hooks, PWA
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Testing:** Jest, React Testing Library, Supertest
- **Code Quality:** ESLint, Prettier

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd silsila-ul-ahwaal
    ```

2.  **Install dependencies for both frontend and backend:**
    ```bash
    npm install
    cd server && npm install && cd ..
    ```

3.  **Set up environment variables:**
    -   Copy `server/config.env.example` to `server/config.env`.
    -   Fill in the required variables, such as `MONGODB_URI` and `JWT_SECRET`.

4.  **Set up the admin user:**
    ```bash
    npm run setup-admin
    ```

5.  **Start the development servers:**
    ```bash
    npm run dev
    ```
    This will start the React frontend on `http://localhost:3000` and the Node.js backend on `http://localhost:5000`.

## 🧪 Testing

This project has a comprehensive test suite.

-   **Run all tests (frontend and backend):**
    ```bash
    npm test
    ```

-   **Run only frontend tests:**
    ```bash
    npm run test:frontend
    ```

-   **Run only backend tests:**
    ```bash
    npm run test:backend
    ```

-   **Get test coverage:**
    ```bash
    npm run test:coverage
    ```

## 💅 Code Quality

This project uses ESLint and Prettier to maintain code quality and consistency.

-   **Check for linting errors:**
    ```bash
    npm run lint
    ```

-   **Automatically format all code:**
    ```bash
    npm run format
    ```

## 🗂️ Project Structure

The project is organized into a monorepo structure with a `server` directory for the backend and a `src` directory for the frontend.

```
silsila-ul-ahwaal/
├── server/               # Backend (Node.js/Express)
│   ├── __tests__/        # Backend tests
│   ├── config/           # Database and environment config
│   ├── middleware/       # Express middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   └── utils/            # Server-side utilities
├── src/                  # Frontend (React)
│   ├── __tests__/        # Frontend tests
│   ├── components/       # React components
│   │   └── dashboard/    # Dashboard sub-components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services
│   └── utils/            # Frontend utilities
├── public/               # Static assets for the frontend
└── ...                   # Root configuration files
```

## 🤝 Contributing

Contributions are welcome! Please fork the repository, create a feature branch, and submit a pull request.

## 📄 License

This project is licensed under the MIT License.
