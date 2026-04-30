import React, { useState } from 'react';
import axios from 'axios';
import { FaQuestion } from "react-icons/fa6";
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from "react-hot-toast";



const ForgotPassword = () => {
  const[hover, setHover] = useState(false);
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

   const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      return toast.error("Please enter your email");
    }

    try {
      await axios.post(
        "http://localhost:8000/api/auth/forgot-password",
        { email }
      );

      localStorage.setItem("resetEmail", email);
      toast.success("OTP sent to your email");

      navigate("/reset-password");

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Error");
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
              alignItems: "center",
              textAlign: "start",
              margin: "0 3rem",
              color: "#fff",
              padding: "0 2rem",
            }}
          >
            <FaQuestion color="#ffffff" size={55} />
            <h1
              style={{
                fontSize: "2.2rem",
                fontWeight: "bold",
                marginTop: "1.2rem",
              }}
            >
              Forgot password?
            </h1>
            <p
              style={{
                fontSize: "1.2rem",
                marginTop: "0.5rem",
                color: "#f8f8ff",
                opacity: "0.8",
              }}
            >
              No worries, We'll send you an OTP to reset your password.
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
            <div className="text-center lg:text-left ">
              <h2 className="text-2xl font-semibold text-foreground mb-1">
                Reset your password
              </h2>
              <p>Enter your email address</p>
            </div>

            <div>
              <form
                onSubmit={handleSubmit}
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
                  <input
                    name="email"
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
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
                  Send OTP
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
              <Link
                to="/login"
                style={{
                  color: "#080808",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <ArrowLeft size={20} color="#008cff" /> Back to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword
