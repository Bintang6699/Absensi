import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';
import StudentLoginPage from './pages/auth/StudentLoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import DashboardHome from './pages/admin/DashboardHome';
import StudentList from './pages/admin/StudentList';
import AttendancePage from './pages/admin/AttendancePage';
import GradesPage from './pages/admin/GradesPage';
import SettingsPage from './pages/admin/SettingsPage';
import StudentLayout from './components/StudentLayout';
import StudentDashboardHome from './pages/student/StudentDashboardHome';

import StudentBiodata from './pages/student/StudentBiodata';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentGrades from './pages/student/StudentGrades';

import LandingPage from './pages/LandingPage';
import BannedPage from './pages/auth/BannedPage';
import AdminMessagePage from './pages/admin/AdminMessagePage';
import StudentMessagePage from './pages/student/StudentMessagePage';
import ReportsPage from './pages/admin/ReportsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/admin" element={<AdminLoginPage />} />
          <Route path="/login/student" element={<StudentLoginPage />} />
          <Route path="/banned" element={<BannedPage />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="students" element={<StudentList />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="grades" element={<GradesPage />} />
              <Route path="messages" element={<AdminMessagePage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<StudentDashboardHome />} />
              <Route path="biodata" element={<StudentBiodata />} />
              <Route path="attendance" element={<StudentAttendance />} />
              <Route path="grades" element={<StudentGrades />} />
              <Route path="messages" element={<StudentMessagePage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
