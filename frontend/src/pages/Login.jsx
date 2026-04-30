import React from 'react'
import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { GraduationCap } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({email: "", password: ""});
  const navigate = useNavigate();
  // const [role, setRole] = useState("student")
  const[hover, setHover] = useState(false);

  const handleChange = e => setForm({...form,[e.target.name]:e.target.value});

  const {login} = useAuth();

  const handlesubmit = async e => {
    e.preventDefault();
    try{
    const user = await login(form);

    if (user.role === "student") navigate("/student");
    else if (user.role === "recruiter") navigate("/recruiter");
    else if (user.role === "admin") navigate("/admin");

  } catch (err) {
    console.error(err);
    toast.error(typeof err === "string" ? err : err.response?.data?.error || err.message || "Login failed");
  }
  };

  return (
    <>
      <div className="flex min-h-screen">
        <div className="left-panel hidden lg:flex lg:w-1/2  items-center justify-center p-12 bg-[#008cff] ">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              textAlign: "start",
              margin: "0 3rem",
              color: "#fff",
              padding: "0 2rem",
            }}
          >
            <GraduationCap color="#ffffff" size={55} />
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                marginTop: "1.2rem",
              }}
            >
              Welcome Back!
            </h1>
            <p
              style={{
                fontSize: "1.2rem",
                marginTop: "0.5rem",
                color: "#f8f8ff",
                opacity: "0.8",
              }}
            >
              Log in to access your personalized dashboard and continue your job
              search journey.
            </p>
          </div>
        </div>
        <div className="right-panel flex w-full lg:w-1/2 items-center justify-center p-12">
          <div
            style={{
              width: "100%",
              maxWidth: "28rem",
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
            }}
          >
            <div className="text-center lg:text-left">
              <Link
                to="/"
                className="logo"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "2rem",
                }}
              >
                <GraduationCap color="#008cff" size={30} />
                <span className="text-xl font-bold">SmartPlace</span>
              </Link>
              <h2 className="text-2xl font-bold text-foreground">
                Log in to your account
              </h2>
              <p className="text-muted-foreground mt-3">
                Enter your credentials to continue
              </p>
            </div>
            
            <div style={{ marginTop: "1.5rem" }}>
              <form
                onSubmit={handlesubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    fontSize: "0.9rem",
                    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
                  }}
                >
                  <label className="font-semibold">Email</label>
                  <input
                    name="email"
                    placeholder="Email"
                    autoComplete="email"
                    onChange={handleChange}
                    style={{
                      border: "1px solid #959597",
                      borderRadius: "0.5rem",
                      padding: "0.4rem",
                      outline: "none",
                      boxShadow: "none",
                      backgroundColor: "transparent",
                      transform: "none",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    fontSize: "0.9rem",
                    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
                  }}
                >
                  <label className="font-semibold">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    autoComplete="off"
                    onChange={handleChange}
                    style={{
                      border: "1px solid #959597",
                      borderRadius: "0.5rem",
                      padding: "0.4rem",
                      outline: "none",
                      boxShadow: "none",
                      backgroundColor: "transparent",
                      transform: "none",
                      opacity: "0.9",
                    }}
                  />
                  <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    alignItems: "flex-end",
                    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
                  }}
                >
                  <Link
                    className="signup"
                    to="/forgot-password"
                    style={{
                      fontSize: "0.9rem",
                    }}
                  >
                    Forgot Password?
                  </Link>
                </div>
                </div>

                <button
                  style={{
                    border: "1px solid ",
                    borderRadius: "0.5rem",
                    padding: "0.4rem",
                    outline: "none",
                    boxShadow: "none",
                    backgroundColor: "#008cff",
                    color: "#ffffff",
                    fontWeight: "500",
                    justifyContent: "center",
                    transform: hover ? "scale(1.01)" : "scale(1)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={() => setHover(true)}
                  onMouseLeave={() => setHover(false)}
                >
                  Login
                </button>
              </form>
            </div>
            <p
              style={{
                fontSize: "1rem",
                color: "#727171e3",
                textAlign: "center",
              }}
            >
              Don't have an account?{" "}
              <Link
                className="signup"
                to="/register"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login
