import React from 'react'
import {BrowserRouter, Routes, Route} from "react-router-dom"
import Register from './pages/Register'
// import Navbar from './components/Navbar'
import Login from './pages/Login'
import PrivateRoute from './utils/PrivateRoute'
import Home from './components/Home'
import NotFound from './pages/NotFound'
import StudentDashboard from './pages/StudentDashboard'
import StudentApplication from './pages/StudentApplication'
import ResumeAnalyzer from './pages/ResumeAnalyzer'
import StudentJobs from './pages/StudentJobs'
import StudentProfile from './pages/StudentProfile'
import RecruiterDashboard from './pages/RecruiterDashboard'
import RecruiterApplicants from './pages/RecruiterApplicants'
import RecruiterAnalytics from './pages/RecruiterAnalytics'
import RecruiterJobs from './pages/RecruiterJobs'
import RecruiterProfile from './pages/RecruiterProfile'
import AdminDashboard from './pages/AdminDashboard'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import PostJob from './pages/PostJob'
import Company from './pages/Company'
import AdminProfile from './pages/AdminProfile'
import Setting from './pages/Setting'
import EditCompany from './pages/EditComapny'
import JobDetails from './pages/JobDetails'
import Message from './pages/Message'
import AdminUsers from './pages/AdminUsers'
import AdminJobs from './pages/AdminJobs'
import AdminApplication from './pages/AdminApplication'
import Reports from './pages/Reports'




const App = () => {
  return (
    <>
      <BrowserRouter>
        {/* <Navbar/> */}
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<PrivateRoute role="admin" />}>
            <Route index element={<AdminDashboard />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="jobs" element={<AdminJobs />} />
            <Route path="applications" element={<AdminApplication />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          <Route element={<PrivateRoute />}>
            <Route path="/setting" element={<Setting />} />
          </Route>

          <Route path="/student" element={<PrivateRoute role="student" />}>
            <Route index element={<StudentDashboard />} />
            <Route path="application" element={<StudentApplication />} />
            <Route path="resume" element={<ResumeAnalyzer />} />
            <Route path="jobs" element={<StudentJobs />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="job/:id" element={<JobDetails />} />
            <Route path="messages" element={<Message />} />
          </Route>

          <Route path="/recruiter" element={<PrivateRoute role="recruiter" />}>
            <Route index element={<RecruiterDashboard />} />
            <Route path="applicants" element={<RecruiterApplicants />} />
            <Route path="analytics" element={<RecruiterAnalytics />} />
            <Route path="jobs" element={<RecruiterJobs />} />
            <Route path="profile" element={<RecruiterProfile />} />
            <Route path="post-job" element={<PostJob />} />
            <Route path="create-company" element={<Company />} />
            <Route path="company/:id/edit" element={<EditCompany />} />
            <Route path="messages" element={<Message />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
  
}

export default App
