// index.js
require("dotenv").config();
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/quiz", require("./routes/quizRoutes"));
app.use("/api/question", require("./routes/questionRoutes"));
app.use("/api/attempt", require("./routes/attemptRoutes"));
app.use("/api/leaderboard", require("./routes/leaderboardRoutes"));



const PORT = process.env.PORT || 5000  ;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
