const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const cookieParser = require("cookie-parser");

dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, "../.env"), override: false });
const connectDB = require("./config/db");

// Routes
const jobroutes = require("./routes/jobroutes");
const authroutes = require("./routes/authroutes");
const userroutes = require("./routes/userroutes");
const companyroutes = require("./routes/companyroutes");
const applicationroutes = require("./routes/applicationroutes");
const recruiterRoutes = require("./routes/recruiterroutes");
const notificationRoutes = require("./routes/notificationroutes");
const settingRoutes = require("./routes/settingroutes");
const studentroutes = require("./routes/studentroutes");
const chatRoutes = require("./routes/chatroutes");
const resumeRoutes = require("./routes/resumeroutes");
const adminroutes = require("./routes/adminroutes");
const reportRoutes = require("./routes/reportroutes");


const app = express();
const server = http.createServer(app);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log("User joined room:", userId);
  });

  // socket.on("sendMessage", ({ sender, receiver, message }) => {

  //   socket.to(receiver).emit("receiveMessage", { sender, message });
  // });

  socket.on("typing", ({ sender, receiver }) => {
    socket.to(receiver).emit("typing", sender);
  });

  socket.on("stopTyping", ({ sender, receiver }) => {
    socket.to(receiver).emit("stopTyping", sender);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// middleware
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

app.use(cookieParser());

// files uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// DB
connectDB();

// Routes
app.use("/api/jobs", jobroutes);
app.use("/api/auth", authroutes);
app.use("/api/users", userroutes);
app.use("/api/company", companyroutes);
app.use("/api/application", applicationroutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/student", studentroutes);
app.use("/api/chat", chatRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/admin", adminroutes);
app.use("/api/report", reportRoutes);



app.get("/", (req, res) => {
  res.send("API is working correctly");
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ error: err.message });
  }
  
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error' 
  });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
