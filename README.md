# Task Management System

A full-stack task management application with a modern React frontend and a robust Node.js/Express backend. The system features user authentication, task management, project collaboration, and real-time communication.

## Features

- **User Authentication:** Login, registration, and OAuth integration (Google, GitHub)
- **Two-Factor Authentication:** Enhanced security with 2FA
- **Task Management:** Create, update, and track tasks
- **Project Collaboration:** Team-based project management
- **Role-Based Access Control:** Fine-grained permission system
- **Real-time Notifications:** WebSocket-based notifications
- **Dashboard Analytics:** Visual representation of task statistics
- **Responsive UI:** Material UI-based responsive design

## Tech Stack

### Backend
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT, Passport.js (OAuth)
- **Real-time Communication:** Socket.io
- **Queue Management:** BullMQ
- **Testing:** Jest, Supertest
- **Security:** Helmet, Express Rate Limit
- **Email Service:** Nodemailer

### Frontend
- **Framework:** React 18
- **UI Library:** Material UI
- **Form Management:** React Hook Form, Formik
- **Validation:** Yup
- **Routing:** React Router 6
- **HTTP Client:** Axios
- **State Management:** React Context API
- **Date Handling:** date-fns
- **Testing:** Jest, React Testing Library

## Project Structure

```
├── backend/                # Backend application
│   ├── src/                # Source code
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── domain/         # Domain logic
│   │   ├── helpers/        # Helper utilities
│   │   ├── middlewares/    # Express middlewares
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── seeds/          # Database seed data
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── tests/              # Test files
│   ├── docs/               # Documentation
│   └── index.js            # Application entry point
│
├── frontend/               # Frontend application
│   ├── public/             # Static files
│   ├── src/                # Source code
│   │   ├── assets/         # Images, fonts, etc.
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── features/       # Feature-based modules
│   │   ├── layouts/        # Layout components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── shared/         # Shared utilities
│   │   ├── tests/          # Test files
│   │   ├── App.jsx         # Main app component
│   │   └── index.js        # Frontend entry point
│   └── build/              # Production build
│
├── package.json            # Root package.json for dev dependencies
└── .env                    # Environment variables
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- NPM or Yarn

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd task-management
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   - Create `.env` file in the root directory
   - Create `.env` file in the backend directory with MongoDB connection string and other configurations

4. Run development servers
   ```
   # Run both frontend and backend
   npm run dev
   
   # Run only backend
   npm run server
   
   # Run only frontend
   npm run client
   ```

5. Access the application
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)

## Database Seeding

To initialize the database with test data:

```
cd backend
npm run seed
```

For test data only:
```
npm run seed:test
```

## Testing

```
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## License

This project is licensed under the MIT License.
