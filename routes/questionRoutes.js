const express = require("express");
const Question = require("../models/Question");
const Quiz = require("../models/Quiz");
const { auth } = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/question/add
// router.post("/:quizId/add-question", auth, async (req, res) => {
//   try {
//     const { quizId, questionText, options, correctAnswer } = req.body;

//     const quiz = await Quiz.findById(quizId);
//     if (!quiz) return res.status(404).json({ message: "Quiz not found" });

//     if (req.user.role !== "admin" && quiz.createdBy.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     const newQ = await Question.create({
//       quizId,
//       questionText,
//       options,
//       correctAnswer,
//     });

//     res.status(201).json({ message: "Question added", newQ });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// });
router.post("/:quizId/add-question", auth, async (req, res) => {
  try {
    const { questionText, options, correctAnswer } = req.body;

    if (!questionText || !options || options.length < 2) {
      return res.status(400).json({ message: "Invalid question data" });
    }

    const question = await Question.create({
      quizId: req.params.quizId,
      questionText,
      options,
      correctAnswer: Number(correctAnswer),   // 👈 IMPORTANT
    });

    res.status(201).json({ message: "Question added", question });
  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/quiz/:quizId", auth, async (req, res) => {
  try {
    const questions = await Question.find({ quizId: req.params.quizId }).select("-correctAnswer");
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    const quiz = await Quiz.findById(question.quizId);

    if (req.user.role !== "admin" && quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await question.remove();
    res.json({ message: "Question deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;

