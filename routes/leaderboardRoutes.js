const express = require("express");
const Result = require("../models/Result");
const Quiz = require("../models/Quiz");
const { auth, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// GET LEADERBOARD OF ANY QUIZ
router.get("/:quizId", auth, async (req, res) => {
  try {
    const results = await Result.find({ quizId: req.params.quizId })
      .populate("userId", "name email")
      .sort({ score: -1 });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ADMIN OR CREATOR can view leaderboard for ALL quizzes
router.get("/quiz/:quizId/all", auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (
      req.user.role !== "admin" &&
      quiz.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const results = await Result.find({ quizId: req.params.quizId })
      .populate("userId", "name email")
      .sort({ score: -1 });

    res.json(results);
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
