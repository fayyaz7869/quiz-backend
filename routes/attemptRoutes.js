

// routes/attemptRoutes.js
const express = require("express");
const Question = require("../models/Question");
const { auth } = require("../middleware/authMiddleware");
const Result = require("../models/Result");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/User");
const Quiz = require("../models/Quiz");
const mongoose = require("mongoose");
const router = express.Router();


// CHECK IF USER ALREADY ATTEMPTED
router.get("/:quizId/check", auth, async (req, res) => {
  try {
      const quizId = new mongoose.Types.ObjectId(req.params.quizId);

    const attempt = await Result.findOne({
      quizId,
      userId: req.user._id
    });

    res.json({ attempted: attempt ? true : false });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});



// router.post("/:quizId/submit", auth, async (req, res) => {
//   try {
//     const quizId = new mongoose.Types.ObjectId(req.params.quizId);
//     const { answers } = req.body;

//     const questions = await Question.find({ quizId });

//     let score = 0;
//     let correctAnswers = 0;
//     let wrongAnswers = 0;

//     answers.forEach((ans) => {
//       const q = questions.find(
//         (qq) => qq._id.toString() === ans.questionId
//       );

//       if (!q) return;

//       if (q.correctAnswer === ans.selectedOption) {
//         correctAnswers++;
//         score++;
//       } else {
//         wrongAnswers++;
//       }
//     });

//     const totalQuestions = questions.length;
//     const percentage = (score / totalQuestions) * 100;

//     // ❗ Prevent duplicate result saving
//     const exists = await Result.findOne({
//       quizId: quizId,
//       userId: req.user._id,
//     });

//     if (exists) {
//       return res.status(400).json({
//         message: "You have already attempted this quiz",
//         result: exists,
//       });
//     }

//     // SAVE RESULT
//     const result = await Result.create({
//       userId: req.user._id,
//       quizId,
//       score,
//       totalQuestions,
//       correctAnswers,
//       wrongAnswers,
//     });

//     // Get user & quiz info for email
// const user = await User.findById(req.user._id);
// const quiz = await Quiz.findById(quizId);

// // SEND RESULT EMAIL
// try{
// await sendEmail(
//   user.email,
//   `Your Quiz Result for "${quiz.title}"`,
//   `
//   <h2>Quiz Completed: ${quiz.title}</h2>
//   <p><strong>Score:</strong> ${score}/${totalQuestions}</p>
//   <p><strong>Correct Answers:</strong> ${correctAnswers}</p>
//   <p><strong>Wrong Answers:</strong> ${wrongAnswers}</p>
//   <p><strong>Percentage:</strong> ${percentage.toFixed(2)}%</p>
//   <br/>
//   <p>Thank you for participating!</p>
//   `
// );
// } catch(e){
//   console.error("Email Failed:", e);
// }


//     res.json({
//       quizId,
//       score,
//       totalQuestions,
//       percentage,
//       correctAnswers,
//       wrongAnswers,
//     });
//   } catch (error) {
//     console.error("Error submitting quiz:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });











router.post("/:quizId/submit", auth, async (req, res) => {
  try {
    const quizId = new mongoose.Types.ObjectId(req.params.quizId);
    const { answers } = req.body;

    // 🔒 Prevent re-attempt
    const already = await Result.findOne({
      quizId,
      userId: req.user._id,
    });

    if (already) {
      return res.status(400).json({
        message: "You have already attempted this quiz",
      });
    }

    const questions = await Question.find({ quizId });

    let score = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;

    answers.forEach((ans) => {
      const q = questions.find(
        (qq) => qq._id.toString() === ans.questionId
      );

      if (!q) return;

      if (q.correctAnswer === ans.selectedOption) {
        score++;
        correctAnswers++;
      } else {
        wrongAnswers++;
      }
    });

    const totalQuestions = questions.length;
    const percentage = (score / totalQuestions) * 100;

    // 💾 Save result
    await Result.create({
      quizId,
      userId: req.user._id,
      score,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
    });

    // 📧 SEND EMAIL
    const user = await User.findById(req.user._id);
    const quiz = await Quiz.findById(quizId);

    try {
      await sendEmail(
        user.email,
        `Quiz Result: ${quiz.title}`,
        `
        <h2>${quiz.title}</h2>
        <p>Score: ${score}/${totalQuestions}</p>
        <p>Correct: ${correctAnswers}</p>
        <p>Wrong: ${wrongAnswers}</p>
        <p>Percentage: ${percentage.toFixed(2)}%</p>
        `
      );
    } catch (e) {
      console.error("❌ EMAIL FAILED:", e);
    }

    res.json({
      quizId,
      score,
      totalQuestions,
      percentage,
      correctAnswers,
      wrongAnswers,
    });

  } catch (error) {
    console.error("SUBMIT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});




module.exports = router;
