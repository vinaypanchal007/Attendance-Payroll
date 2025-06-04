import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { verifyToken, getRedirectPath } from '../utils/auth';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and decode role
      const decoded = verifyToken(token);
      if (!decoded) {
        setLoading(false);
        return;
      }

      // Verify token and get user data
      api.get('/auth/me')
        .then(response => {
          // Verify role matches token
          if (response.data.role !== decoded.role) {
            throw new Error('Role mismatch');
          }
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      // Verify token and role
      const decoded = verifyToken(token);
      if (!decoded || decoded.role !== user.role) {
        throw new Error('Invalid token or role mismatch');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', user.role);
      
      setUser(user);
      
      toast.success('Login successful!');
      navigate(getRedirectPath(user.role));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password
      });
      
      const { token, user } = response.data;
      
      // Verify token and role
      const decoded = verifyToken(token);
      if (!decoded || decoded.role !== user.role) {
        throw new Error('Invalid token or role mismatch');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', user.role);
      
      setUser(user);
      
      toast.success('Registration successful!');
      navigate(getRedirectPath(user.role));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setUser(null);
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    login,
    logout,
    register,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 