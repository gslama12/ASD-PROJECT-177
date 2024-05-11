const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Question = require('../models/questionModel');

/**
 * POST endpoint to submit an answer.
 * might be good to detach the validation from submission depending on API implementation
 * TODO: Integrate into API
 */
router.post('/submit-answer', async (req, res) => {
    const { userId, questionId, answerGiven } = req.body;
    try {
        const question = await Question.findById(questionId);
        const user = await User.findById(userId);
        if (!question || !user) {
            return res.status(404).send('Question or User not found');
        }
        const isCorrect = question.correctAnswer === answerGiven;
        const attempt = {
            questionId,
            isCorrect,
            answerGiven,
            correctAnswer: question.correctAnswer
        };
        const quizId = question.quizId;
        let quizScore = user.scores.find(score => score.quizId.equals(quizId));
        if (!quizScore) {
            quizScore = { quizId, score: 0, attempts: [] };
            user.scores.push(quizScore);
        }
        if (isCorrect) {
            quizScore.score += 1;
        }
        quizScore.attempts.push(attempt);
        await user.save();
        res.json({ success: true, isCorrect, correctAnswer: question.correctAnswer });
    } catch (error) {
        console.error('Error submitting answer:', error);
        res.status(500).send('Error processing answer');
    }
});

/**
 * GET endpoint to fetch quiz results and statistics for a user.
 * TODO: Integrate into API
 */
router.get('/quiz-statistics/:userId/:quizId', async (req, res) => {
    const { userId, quizId } = req.params;
    try {
        const user = await User.findById(userId).populate({
            path: 'scores',
            match: { quizId: quizId },
            populate: {
                path: 'attempts.questionId',
                model: 'Question'
            }
        });
        if (!user) {
            return res.status(404).send('User not found');
        }
        const quizResults = user.scores.find(score => score.quizId.equals(quizId));
        if (!quizResults) {
            return res.status(404).send('No quiz results found for this user');
        }
        res.json(quizResults);
    } catch (error) {
        console.error('Error fetching quiz statistics:', error);
        res.status(500).send('Error processing request');
    }
});

module.exports = router;