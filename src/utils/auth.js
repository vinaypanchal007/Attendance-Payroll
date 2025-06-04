import { jwtDecode } from 'jwt-decode';

export const verifyToken = (token) => {
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    
    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      return null;
    }

    // Verify role is valid
    if (!['admin', 'employee'].includes(decoded.role)) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    return null;
  }
};

export const getRedirectPath = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'employee':
      return '/employee/dashboard';
    default:
      return '/login';
  }
}; 