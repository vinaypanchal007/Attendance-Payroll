import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminEmployees from './pages/admin/Employees';

// Employee pages
import EmployeeDashboard from './pages/employee/Dashboard';
import Attendance from './pages/employee/Attendance';
import Profile from './pages/employee/Profile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/" 
            element={
              <PrivateRoute
                element={
                  ({ user }) => (
                    <Navigate 
                      to={user?.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard'} 
                      replace 
                    />
                  )
                }
              />
            } 
          />
          
          {/* Admin Routes */}
          <Route element={<Layout />}>
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute
                  element={<AdminDashboard />}
                  requireRole="admin"
                />
              }
            />
            <Route
              path="/admin/employees"
              element={
                <PrivateRoute
                  element={<AdminEmployees />}
                  requireRole="admin"
                />
              }
            />
          </Route>

          {/* Employee Routes */}
          <Route element={<Layout />}>
            <Route
              path="/employee/dashboard"
              element={
                <PrivateRoute
                  element={<EmployeeDashboard />}
                  requireRole="employee"
                />
              }
            />
            <Route
              path="/employee/attendance"
              element={
                <PrivateRoute
                  element={<Attendance />}
                  requireRole="employee"
                />
              }
            />
            <Route
              path="/employee/profile"
              element={
                <PrivateRoute
                  element={<Profile />}
                  requireRole="employee"
                />
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
