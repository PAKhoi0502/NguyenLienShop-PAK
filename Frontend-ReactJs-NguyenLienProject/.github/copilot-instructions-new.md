# AI Coding Agent Instructions

Essential guidance for AI agents working in the NguyenLienShop full-stack e-commerce project.

## Project Architecture

### Full-Stack Overview
- **Frontend**: React 18 + Redux Toolkit + React Router v6 (port 3000)
- **Backend**: Node.js + Express + Sequelize ORM + MySQL (development)
- **Database**: MySQL with comprehensive e-commerce schema (users, products, orders, etc.)
- **File Storage**: Local uploads in `Backend-NodeJs-NguyenLienProject/uploads/`

### Cross-Service Communication
```javascript
// Frontend axios instance (src/axios.js) automatically adds Bearer tokens
const instance = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL, // Backend endpoint
    withCredentials: true,
});
```

Backend CORS configured for `http://localhost:3000` with credentials support.

## Critical Development Workflows

### Starting the Full Stack
```bash
# Backend (in Backend-NodeJs-NguyenLienProject/)
npm start  # Uses nodemon + babel-node for hot reload

# Frontend (in Frontend-ReactJs-NguyenLienProject/)
npm start  # Standard CRA development server
```

### Database Operations
```bash
# Backend directory
npm run migrate  # Run Sequelize migrations
npm run seed     # Seed initial data
```

## Project-Specific Patterns

### API Service Architecture
Services use centralized axios instance with automatic error handling:
```javascript
// src/services/authService.js example
export const login = async ({ identifier, password }) => {
    try {
        const res = await axios.post('/api/auth/login', { identifier, password });
        return res; // axios interceptor handles errCode logic
    } catch (err) {
        // Standardized error response
        return {
            errCode: err?.response?.status || -1,
            errMessage: err?.response?.data?.message || 'Server error',
        };
    }
};
```

### Backend Controller Pattern
All controllers return consistent `{ errCode, errMessage }` format:
```javascript
// Backend controllers always return:
// errCode: 0 (success), 1 (validation error), -1 (system error)
return res.status(200).json({
    errCode: result.errCode,
    errMessage: result.errMessage || result.message
});
```

### Role-Based Architecture
- **Role IDs**: 1 = Admin, 2 = User (defined in `roleId` field)
- **Route Protection**: `PrivateRoute` with role prop validation
- **Component Organization**: `containerAdmin/` vs `containerPublic/`

### Authentication Flow
1. Login stores JWT in `localStorage.getItem('token')`
2. `src/axios.js` interceptor auto-adds `Authorization: Bearer ${token}`
3. `useAuth` hook manages auth state across components
4. Route protection via `PrivateRoute` component checking role

## Data Model Key Relationships
```javascript
// Core Sequelize associations (src/models/)
User.belongsTo(Role, { foreignKey: 'roleId' })
Product.belongsToMany(Category, { through: 'ProductCategory' })
Order.belongsTo(User), User.hasMany(Order)
Cart.belongsTo(User), CartItem.belongsTo(Product)
```

## File Upload Pattern
Backend uses multer for file handling. Images stored in `/uploads/` with timestamp naming (e.g., `1753361225076.jpg`).

## Toast Notification System
Dual notification setup:
- `react-hot-toast` with `<Toaster />` in App.js
- `react-toastify` with `<ToastContainer />` for specific use cases
Use `CustomToast` component for internationalized error messages.

## Development Conventions
1. **Phone Validation**: Must match `/^0\d{9}$/` pattern
2. **Password Validation**: `/^(?=.*[a-z])(?=.*\d).{6,}$/` (lowercase + digit + 6+ chars)
3. **Error Codes**: 0=success, 1=validation, -1=system, 400=bad request, 409=conflict
4. **API Routes**: `/api/auth/*`, `/api/admin/*`, `/api/user/*`, `/api/public/*`
5. **Component Naming**: Features use `{Feature}Manager` + `{Feature}Create/Update/Detail` pattern

## Key Integration Points
- Environment variables: `REACT_APP_BACKEND_URL` (frontend), `DB_*` (backend)
- Development ports: Frontend 3000, Backend configurable
- File uploads handled via FormData with multipart/form-data
- Redux persistence via `redux-persist` for auth state

## Debugging Quick Reference
- Backend logs: Check console for database connection status and API errors
- Frontend network: Axios interceptors log detailed request/response information
- Auth issues: Verify token in localStorage and role matching in PrivateRoute
- Database: Use Sequelize logging (set to `true` in connectDB.js)
