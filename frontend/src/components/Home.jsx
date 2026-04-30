import React from "react";
import { useState } from "react";
import { ArrowRight, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import Features from "./Features";

const Home = () => {
  const [hover, setHover] = useState(false);

  return (
    <>
      <div
        className="landing-page "
        style={{
          minHeight: "100vh",
          paddingTop: "1rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          // gap: "2rem",
          borderRadius: ".5rem",
          position: "relative",
        }}
      >
        <nav
          className="navbar"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            width: "100%",
            height: "4rem",
            padding: "0.5rem 7%",
            zIndex: 1000,
            background: "#7fd5ff8a",
            backdropFilter: "blur(15px)",
            WebkitBackdropFilter: "blur(15px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontFamily: "Eagle Lake",
              fontWeight: "500",
              fontSize: "1.3rem",
            }}
          >
            <Link to="/" className="logo">
            <GraduationCap color="#118ff7" size={30}  />
            <h2>SmartPlace</h2>
            </Link>
            
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link to="/login">
              <button  className="login">
                Login
              </button>
            </Link>
            <Link to="/register">
              <button  className="register">
                Register
              </button>
            </Link>
          </div>
        </nav>
        <div
          className="front"
          style={{
            background: "linear-gradient(135deg, #4e6bef 0%, #4463b7 100%)",
            minHeight: "calc(100vh - 4rem)",
            width: "100%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "10%",
              left: "10%",
              width: "200px",
              height: "200px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              animation: "float 6s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "60%",
              right: "15%",
              width: "150px",
              height: "150px",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "50%",
              animation: "float 8s ease-in-out infinite reverse",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "20%",
              left: "20%",
              width: "100px",
              height: "100px",
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: "50%",
              animation: "float 7s ease-in-out infinite",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              padding: "-0.2rem 21%",
            }}
          >
            <h1
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                color: "#ffffff",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                marginBottom: "1.5rem",
                fontWeight: "700",
                gap: "0.5rem",
              }}
            >
              Unlock Your Career Potential with{" "}
              <span
                style={{
                  color: "#00d4ff",
                  background: "linear-gradient(45deg, #00d4ff, #ffffff)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                }}
              >
                AI Intelligence
              </span>
            </h1>
            <p
              style={{
                padding: "1rem 19%",
                color: "rgb(233, 226, 226)",
                textAlign: "center",
                fontSize: "1.2rem",
                fontWeight: "500",
                fontFamily: "Roboto",
                lineHeight: "1.5",
              }}
            >
              Analyze your resume, discover skill gaps, and get matched with top
              opportunities — all in one smart platform.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              marginTop: "1.5rem",
              fontSize: "1rem",
              color: "#f6f6f6",
            }}
          >
            <Link to="/register">
              <button
                variant="hero"
                style={{
                  padding: "0.6rem 1rem",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "0.5rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                  fontWeight: "500",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  transform: hover ? "scale(1.05)" : "scale(1)",
                  boxShadow: hover
                    ? "0 6px 18px rgba(255, 255, 255, 0.2)"
                    : "0 4px 15px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
              >
                Get Started <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </div>
        {/* <div
          // style={{
          //   height: "100vh",
          //   display: "flex",
          //   justifyContent: "center",
          //   alignItems: "center",
          //   flexDirection: "column",
          //   gap: "2rem",
          //   margin: "1rem",
          //   marginTop: "8rem",
          //   borderRadius: ".5rem",
          // }}
        > */}
          <Features/>
          
          <footer style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            height: "5rem",
            padding: "1rem 5%",
            background: "rgba(6, 160, 234, 13%)",
            backdropFilter: "blur(15px)",
            WebkitBackdropFilter: "blur(15px)",
            borderTop: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",}}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontWeight: "500",
              fontSize: "1.2rem",
            }}>
            <GraduationCap color="#008cff" size={30}  />
            <h2>SmartPlace</h2>
            </div>
            <p style={{color: "#575656", fontSize: "1rem"}}>© 2026 SmartPlace. All rights reserved.</p>
          </footer>
        {/* </div> */}
      </div>
    </>
  );
};

export default Home;





