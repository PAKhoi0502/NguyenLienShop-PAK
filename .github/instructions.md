# AI Coding Agent Instructions

This document provides essential guidance for AI agents working in the NguyenLienShop e-commerce codebase.

## Project Architecture Overview

This is a full-stack e-commerce platform with clear separation between frontend and backend:

### Core Components
- **Backend**: Node.js/Express API (`Backend-NodeJs-NguyenLienProject/`)
- **Frontend**: React SPA with admin panel (`Frontend-ReactJs-NguyenLienProject/`)
- **Database**: MySQL with Sequelize ORM
- **File Uploads**: Handled via `uploads/` directory with timestamped filenames

### Key Architectural Patterns

#### Backend Structure (Node.js + Express + Sequelize)
```
src/
├── server.js              # Entry point with CORS config for localhost:3000
├── config/                # DB connection, view engine setup
├── controllers/           # Route handlers following errCode pattern
├── services/              # Business logic layer
├── models/                # Sequelize models with associations
├── routes/                # Separated: /api (REST) and / (views)
├── middlewares/           # JWT auth, file upload, validation
└── migrations/            # Database schema changes
```

#### Frontend Structure (React + Redux + React Router)
```
src/
├── App.js                 # Provider setup with redux, router, toast
├── routes/AppRoutes.js    # Role-based routing (Public/Admin layouts)
├── layouts/               # AdminLayout.js, PublicLayout.js
├── services/              # API integration with axios interceptors
├── store/                 # Redux setup with actions/reducers
├── components/            # Organized by containerAdmin/ and containerPublic/
└── pages/                 # Route components
```

## Critical Development Patterns

### Backend Response Format
All API responses follow this standard error code pattern:
```javascript
// Success: errCode: 0
{ errCode: 0, data: {...}, message: "Success" }

// Error: errCode: 1 (validation), -1 (server error)
{ errCode: 1, errMessage: "User-friendly error message" }
```

### Authentication Flow
- JWT tokens stored in localStorage on frontend
- Backend middleware: `verifyToken` for protected routes
- Frontend interceptors automatically attach `Bearer ${token}` headers
- Admin routes require `/api/admin/` prefix for token validation

### Database Associations (Sequelize)
Key relationships to understand:
- `Product` ↔ `Category` (many-to-many via ProductCategory)
- `Product` → `ProductImage` (one-to-many)
- `User` ↔ `Product` (many-to-many via Wishlist)
- `Product` ↔ `DiscountCode` (many-to-many via ProductDiscount)

### File Upload Pattern
- Images uploaded to `/uploads/` with timestamp naming: `1753361225076.jpg`
- Multer middleware handles multipart/form-data
- Frontend sends FormData for file uploads

## Essential Development Workflows

### Running the Application
```bash
# Backend (from Backend-NodeJs-NguyenLienProject/)
npm start          # Uses nodemon + babel-node
npm run migrate    # Run Sequelize migrations
npm run seed       # Seed initial data

# Frontend (from Frontend-ReactJs-NguyenLienProject/)
npm start          # Development server on localhost:3000
npm run build      # Production build

# Frontend Production Server
cd server && npm start  # Serves built React app
```

### Database Operations
- Models use CommonJS exports (`module.exports`)
- Migrations in `src/migrations/` for schema changes
- Environment variables in `.env` for DB configuration
- Connection: MySQL on localhost:3306 (default)

### CORS Configuration
Backend explicitly allows `localhost:3000` with credentials. When modifying CORS:
- Update both `cors()` config and manual headers in `server.js`
- Ensure Authorization header is allowed

## Service Layer Patterns

### Frontend API Services
Each service follows this pattern with error handling:
```javascript
// services/productService.js
export const methodName = async (params) => {
    try {
        const response = await instance.get('/api/admin/product', {
            params: { id },
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return { errCode: 0, data: response.data };
    } catch (error) {
        return { errCode: -1, errMessage: 'User-friendly message' };
    }
};
```

### Backend Controllers
Controllers delegate to services and maintain consistent error responses:
```javascript
// controllers/productController.js
let handleGetProducts = async (req, res) => {
    try {
        const products = await productService.getProducts();
        return res.status(200).json(products);
    } catch (err) {
        return res.status(500).json({ errMessage: 'Lỗi khi lấy sản phẩm' });
    }
};
```

## Route Organization

### Backend Routes
- `/api/*` - REST API endpoints (JSON responses)
- `/*` - Server-side rendered views (if needed)
- Separation in `routes/apiRoutes.js` vs `routes/webRoutesBackend.js`

### Frontend Routes
- Public routes: Home, Login, Register (wrapped in `PublicRoute` HOC)
- Admin routes: Dashboard, User/Product/Banner management (wrapped in `PrivateRoute` HOC)
- Role-based layouts automatically applied based on route structure

## State Management (Redux)

- Store configuration in `src/redux.js` with redux-persist
- Actions in `store/actions/` follow domain-based organization
- Reducers in `store/reducers/` handle specific data domains
- Use existing action patterns when adding new features

## Key Integration Points

- **API Base URL**: Backend runs on port 8080, frontend assumes `localhost:8080`
- **Image Serving**: Static files served from `/uploads/` on backend
- **Environment Variables**: Backend uses `.env`, frontend uses `REACT_APP_` prefixed vars
- **Token Management**: Automatic refresh and attachment via axios interceptors
- **Error Handling**: Toast notifications via react-hot-toast and react-toastify

When implementing new features, follow the established controller → service → model pattern on backend, and component → service → Redux flow on frontend.
