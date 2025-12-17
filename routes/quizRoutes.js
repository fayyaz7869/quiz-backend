const express = require("express");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const { auth } = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE QUIZ -> POST /api/quiz/create
router.post("/create", auth, async (req, res) => {
  try {
    const { title, description, duration, category } = req.body;

    // only admin or creator can create
    if (req.user.role !== "admin" && req.user.role !== "creator") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const quiz = await Quiz.create({
      title,
      description,
      duration,
      category,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: "Quiz created successfully", quiz });
  } catch (error) {
    console.error("Error creating quiz:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL QUIZZES -> GET /api/quiz/all
router.get("/all", async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate("createdBy", "name email");
    res.json(quizzes);
  } catch (error) {
    console.error("Error fetching quizzes:", error.message);
    res.status(500).json({ message: "Error fetching quizzes" });
  }
});

// GET QUIZ + QUESTIONS -> GET /api/quiz/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const questions = await Question.find({ quizId: req.params.id });

    res.json({ quiz, questions });
  } catch (error) {
    console.error("Error fetching quiz:", error.message);
    res.status(500).json({ message: "Error fetching quiz" });
  }
});

// UPDATE QUIZ -> PUT /api/quiz/update/:id
router.put("/update/:id", auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Allow admin OR any creator OR original owner
    // (creator role can edit any quiz)
    if (
      req.user.role !== "admin" &&
      req.user.role !== "creator" &&
      quiz.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json({ message: "Quiz updated", updatedQuiz });
  } catch (error) {
    console.error("Error updating quiz:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/quiz/delete/:id
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Allow admin OR creator role OR original owner to delete
    if (
      req.user.role !== "admin" &&
      req.user.role !== "creator" &&
      quiz.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete related questions first
    await Question.deleteMany({ quizId: quiz._id }).catch((err) => {
      console.error("Failed to delete related questions:", err);
      // not returning here — if question deletion fails, attempt quiz deletion too, but log it
    });

    // Delete the quiz with findByIdAndDelete (atomic)
    const deleted = await Quiz.findByIdAndDelete(quiz._id);
    if (!deleted) {
      console.error("Quiz findByIdAndDelete returned null for id", quiz._id);
      return res.status(500).json({ message: "Failed to delete quiz" });
    }

    res.json({ message: "Quiz & related questions deleted" });
  } catch (error) {
    console.error("Error in DELETE /api/quiz/delete/:id ->", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


module.exports = router;
