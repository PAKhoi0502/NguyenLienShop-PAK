# AI Coding Agent Instructions

This document provides essential guidance for AI agents working in the NguyenLienShop frontend codebase.

## Project Architecture

### Core Structure
- React frontend with role-based layouts (Admin/Public)
- Redux for state management (`src/store/`)
- Route-based code organization (`src/routes/`)
- Centralized service layer for API communication (`src/services/`)

### Key Components
- Layouts: `AdminLayout.js` and `PublicLayout.js` define base page structures
- Routes: `AppRoutes.js` handles role-based routing and authentication
- Services: RESTful API integration (e.g., `productService.js`, `bannerService.js`)

## Development Patterns

### API Service Pattern
Services follow a consistent pattern:
```javascript
// src/services/productService.js example
export const methodName = async (params) => {
    try {
        const response = await axios.method(`${API_URL}/endpoint`, {
            // Request config
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error description:', error);
        return { errCode: -1, errMessage: 'User-friendly error message' };
    }
};
```

### Component Structure
Components are organized by feature and role:
- `src/components/containerAdmin/` - Admin dashboard components
- `src/components/containerPublic/` - Public-facing components
- Common components use consistent prop patterns and styling

### State Management
- Redux actions in `src/store/actions/` follow type-based pattern
- Reducers in `src/store/reducers/` handle specific domains
- Use `useAuth` hook for authentication state

## Common Operations

### Authentication
- Token-based auth using localStorage
- Role-based route protection via `PrivateRoute.js`/`PublicRoute.js`
- Auth state managed through `useAuth` hook

### Error Handling
- Services return `{ errCode, errMessage }` format
- Use `CustomToast` component for user notifications
- Consistent error logging pattern in catch blocks

### Internationalization
- Translation files in `src/translations/`
- Use `IntlProviderWrapper` for i18n support

## Key Integration Points
- Backend API endpoints defined in `.env`
- Authentication token required for protected routes
- File upload handling in relevant services
- Redux store as central state management

## Project-Specific Conventions
1. Error codes:
   - 0: Success
   - 1: Validation error
   - -1: System error
2. Route protection based on user roles (isRole(1) for admin)
3. Custom component naming: container{Admin|Public}

## Testing & Debugging
- Components include error boundaries
- Console logging follows severity pattern (error/warn/info)
- Service layer includes detailed error tracking
