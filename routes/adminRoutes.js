const express = require("express");
const User = require("../models/User");
const { auth, adminOnly } = require("../middleware/authMiddleware");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");

const router = express.Router();
const sendEmail = require("../utils/sendEmail");

// GET pending users
router.get("/pending-users", auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ approved: false });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// APPROVE user
router.patch("/approve-user/:id", auth, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.approved = true;
    user.role = role;
    await user.save();

    
    // SEND APPROVAL EMAIL
    await sendEmail(
      user.email,
      "Your Quiz App Account Has Been Approved ✔",
      `<h2>Congratulations ${user.name}!</h2>
       <p>Your account has been approved by the admin.</p>
       <p>You can now log in and start using the app.</p>`
    );

    res.json({ message: "User approved", user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET all quizzes
router.get("/all-quizzes", auth, adminOnly, async (req, res) => {
  try {
     const quizzes = await Quiz.find().populate("createdBy", "name email");
   // const quizzes = await Quiz.find();

    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET questions for a quiz
router.get("/quiz/:quizId/questions", auth, adminOnly, async (req, res) => {
  try {
    const questions = await Question.find({ quizId: req.params.quizId });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});





// REJECT user (delete)
router.patch("/reject-user/:id", auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await sendEmail(
        user.email,
        "Your Quiz App Registration Has Been Rejected ❌",
        `<h2>Hello ${user.name},</h2>
         <p>We are sorry to inform you that your registration was rejected.</p>`
      );
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User rejected & deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
