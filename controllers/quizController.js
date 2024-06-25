const QuizQuestion = require("../models/quiz");

const getAllQuizQuestions = async (req, res) => {
  try {
    const questions = await QuizQuestion.getAllQuizQuestions();
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving quiz questions");
  }
};

const getQuizQuestionById = async (req, res) => {
  const questionId = parseInt(req.params.id);
  try {
    const question = await QuizQuestion.getQuizQuestionById(questionId);
    if (!question) {
      return res.status(404).send("Quiz question not found");
    }
    res.json(question);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving quiz question");
  }
};

const createQuiz = async (req, res) => {
  const newQuiz = req.body;
  try {
    const createdQuiz = await QuizQuestion.createQuiz(newQuiz);
    res.status(201).json(createdQuiz);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating quiz");
  }
};

const updateQuiz = async (req, res) => {
  const quizId = parseInt(req.params.id);
  const newQuizData = req.body;

  try {
    const updatedQuiz = await QuizQuestion.updateQuiz(quizId, newQuizData);
    if (!updatedQuiz) {
      return res.status(404).send("Quiz not found");
    }
    res.json(updatedQuiz);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating quiz");
  }
};

const deleteQuiz = async (req, res) => {
  const quizId = parseInt(req.params.id);

  try {
    const success = await QuizQuestion.deleteQuiz(quizId);
    if (!success) {
      return res.status(404).send("Quiz not found");
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting quiz");
  }
};

module.exports = {
  getAllQuizQuestions,
  getQuizQuestionById,
  createQuiz,
  updateQuiz,
  deleteQuiz
};
