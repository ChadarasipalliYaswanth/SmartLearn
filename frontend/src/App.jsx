import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { HelmetProvider } from "react-helmet-async";
import theme from "./theme";
import Home from "./pages/home/Home";
import Header from "./components/header/Header";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Verify from "./pages/auth/Verify";
import Footer from "./components/footer/Footer";
import About from "./pages/about/About";
import Account from "./pages/account/Account";
import { UserData } from "./context/UserContext";
import { MeetingProvider } from "./context/MeetingContext";
import Loading from "./components/loading/Loading";
import Courses from "./pages/courses/Courses";
import CourseDescription from "./pages/coursedescription/CourseDescription";
//import PaymentSuccess from "./pages/paymentsuccess/PaymentSuccess";
import Dashbord from "./pages/dashbord/Dashbord";
import CourseStudy from "./pages/coursestudy/CourseStudy";
import Lecture from "./pages/lecture/Lecture";
import AdminDashbord from "./admin/Dashboard/AdminDashbord";
import AdminCourses from "./admin/Courses/AdminCourses";
import AdminUsers from "./admin/Users/AdminUsers";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import MyAssignments from "./pages/assignments/MyAssignments";
import AdminAssignments from "./admin/Assignments/AdminAssignments";
import SubmissionsList from "./admin/Assignments/SubmissionsList";
import Chat from "./pages/chat/Chat";
import Meetings from "./pages/meetings/Meetings";
import Certificates from "./pages/certificates/Certificates";
import GlobalChatbot from "./components/chatbot/GlobalChatbot";
//import Chat from "./components/Chat/Chat"; // Import Chat component

const App = () => {
  const { isAuth, user, loading, logout } = UserData();
  
  const logoutHandler = () => {
    logout();
  };
  
  return (
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {loading ? (
          <Loading />
        ) : (
          <MeetingProvider>
            <BrowserRouter>
              <Header isAuth={isAuth} user={user} logoutHandler={logoutHandler} />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/courses" element={<Courses />} />
                <Route
                  path="/account"
                  element={isAuth ? <Account user={user} /> : <Login />}
                />
                <Route path="/login" element={isAuth ? <Home /> : <Login />} />
                <Route
                  path="/register"
                  element={isAuth ? <Home /> : <Register />}
                />
                <Route path="/verify" element={isAuth ? <Home /> : <Verify />} />
                <Route
                  path="/forgot"
                  element={isAuth ? <Home /> : <ForgotPassword />}
                />
                <Route
                  path="/reset-password/:token"
                  element={isAuth ? <Home /> : <ResetPassword />}
                />
                <Route
                  path="/course/:id"
                  element={isAuth ? <CourseDescription user={user} /> : <Login />}
                />
                
                <Route
                  path="/:id/dashboard"
                  element={isAuth ? <Dashbord user={user} /> : <Login />}
                />
                <Route
                  path="/course/study/:id"
                  element={isAuth ? <CourseStudy user={user} /> : <Login />}
                />

                <Route
                  path="/lectures/:id"
                  element={isAuth ? <Lecture user={user} /> : <Login />}
                />

                {/* Assignment Routes */}
                <Route
                  path="/my-assignments"
                  element={isAuth ? <MyAssignments user={user} /> : <Login />}
                />

                <Route
                  path="/admin/assignments"
                  element={
                    isAuth && user.role === "admin" ? (
                      <AdminAssignments user={user} />
                    ) : (
                      <Login />
                    )
                  }
                />

                <Route
                  path="/admin/assignments/:id/submissions"
                  element={
                    isAuth && user.role === "admin" ? (
                      <SubmissionsList user={user} />
                    ) : (
                      <Login />
                    )
                  }
                />

                <Route
                  path="/admin/dashboard"
                  element={
                    isAuth && user.role === "admin" ? (
                      <AdminDashbord user={user} />
                    ) : (
                      <Login />
                    )
                  }
                />

                <Route
                  path="/admin/course"
                  element={
                    isAuth && user.role === "admin" ? (
                      <AdminCourses user={user} />
                    ) : (
                      <Login />
                    )
                  }
                />

                <Route
                  path="/admin/users"
                  element={
                    isAuth && user.role === "admin" ? (
                      <AdminUsers user={user} />
                    ) : (
                      <Login />
                    )
                  }
                />

                <Route
                  path="/chat"
                  element={isAuth ? <Chat user={user} /> : <Login />}
                />

                {/* Meetings Route */}
                <Route
                  path="/meetings"
                  element={isAuth ? <Meetings user={user} /> : <Login />}
                />

                {/* Certificates Route */}
                <Route
                  path="/certificates"
                  element={isAuth ? <Certificates /> : <Login />}
                />
              </Routes>
              <Footer />
              {isAuth && <GlobalChatbot />}
            </BrowserRouter>
          </MeetingProvider>
        )}
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;