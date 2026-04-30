import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { GraduationCap } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";



const Register = () => {
  const [form, setForm] = useState({name: "", email: "", password: "",});
  const [role, setRole] = useState("student")
  const[hover, setHover] = useState(false);

  const navigate = useNavigate();


  const handleChange = e => setForm({...form,[e.target.name]:e.target.value});

  const {register} = useAuth();

  const handlesubmit = async (e) => {
  e.preventDefault();
  try {
    await register({ ...form, role });

    toast.success("Registered successfully");
    navigate("/login");

  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Something went wrong");
  }
};
  return <>
        <div className="flex min-h-screen">
        {/* Left Panel */}
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
              Join SmartPlace
            </h1>
            <p
              style={{
                fontSize: "1.2rem",
                marginTop: "0.5rem",
                color: "#f8f8ff",
                opacity: "0.8",
              }}
            >
              Create your account and let AI help you land your dream job or find the perfect candidate.
            </p>
          </div>
        </div>
        {/* Right Panel */}
        <div className="right-panel flex w-full lg:w-1/2 items-center justify-center p-12">
          <div
            style={{
              width: "100%",
              maxWidth: "30rem",
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
                Create your account
              </h2>
              <p className="text-muted-foreground mt-3">
                Get started in minutes
              </p>
            </div>
            <div
              style={{
                display: "flex",
                background: "#f3f4f6",
                borderRadius: "0.5rem",
                padding: "4px",
                position: "relative",
              }}
            >
              <button
                style={{
                  flex: 1,
                  borderRadius: "0.375rem",
                  padding: "0.5rem 0",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  border: "none",
                  transition:
                    "background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease",
                  transform: "none",
                  background: role === "student" ? "#fff" : "transparent",
                  color: role === "student" ? "#000" : "#888",
                  boxShadow:
                    role === "student" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
                onClick={() => setRole("student")}
              >
                Student
              </button>
              <button
                style={{
                  flex: 1,
                  borderRadius: "0.375rem",
                  padding: "0.5rem 0",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  border: "none",
                  transition:
                    "background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease",
                  transform: "none",
                  background: role === "recruiter" ? "#fff" : "transparent",
                  color: role === "recruiter" ? "#000" : "#888",
                  boxShadow:
                    role === "recruiter" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
                onClick={() => setRole("recruiter")}
              >
                Recruiter
              </button>
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
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    fontSize: "0.9rem",
                    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
                  }}>
                  <label className="font-semibold">Name</label>
                  <input name='name' placeholder='Name' onChange={handleChange}
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
                  <label className="font-semibold">Email</label>
                  <input
                    name="email"
                    placeholder="Email"
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
                  Create Account
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
              Already have an account?{" "}
              <Link
                className="signup"
                to="/login"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

  </>
}

export default Register
