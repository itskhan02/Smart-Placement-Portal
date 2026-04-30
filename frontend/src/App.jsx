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
import Jobpage from './pages/Jobpage'
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
          <Route path="/jobs" element={<Jobpage />} />

          {/*  <Route path='/layout' element={<Layout/>}/> */}
          <Route path="/admin" element={<PrivateRoute role="admin" />}>
            <Route index element={<AdminDashboard />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="jobs" element={<AdminJobs />} />
            <Route path="applications" element={<AdminApplication />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/application" element={<StudentApplication />} />
          <Route path="/student/resume" element={<ResumeAnalyzer />} />
          <Route path="/student/jobs" element={<StudentJobs />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/job/:id" element={<JobDetails />} />

          <Route path="/recruiter" element={<RecruiterDashboard />} />
          <Route
            path="/recruiter/applicants"
            element={<RecruiterApplicants />}
          />
          <Route path="/recruiter/analytics" element={<RecruiterAnalytics />} />
          <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
          <Route path="/recruiter/profile" element={<RecruiterProfile />} />
          <Route path="/recruiter/post-job" element={<PostJob />} />
          <Route path="/recruiter/create-company" element={<Company />} />
          <Route path="/recruiter/company/:id/edit" element={<EditCompany />} />

          <Route path="/student/messages" element={<Message />} />
          <Route path="/recruiter/messages" element={<Message />} />

          {/*  <Route path='/layout' element={<Layout/>}/> */}

          <Route path="/setting" element={<Setting />} />
          <Route element={<PrivateRoute />}>
            <Route path="/home" element={<Home />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
  
}

export default App
