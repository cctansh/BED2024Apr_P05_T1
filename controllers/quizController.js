const QuizQuestion = require("../models/quiz");

const getAllQuizQuestions = async (req, res) => {
  try {
    const questions = await QuizQuestion.getAllQuizQuestions();
    res.json(questions);
  } catch (error) {
    console.error("Error retrieving quiz questions:", error);
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
    console.error("Error retrieving quiz question:", error);
    res.status(500).send("Error retrieving quiz question");
  }
};

const createQuizQuestion = async (req, res) => {
  const { question, image_path } = req.body;
  try {
    const createdQuizId = await QuizQuestion.createQuizQuestion(question, image_path);
    res.status(201).json({ id: createdQuizId });
  } catch (error) {
    console.error("Error creating quiz question:", error);
    res.status(500).send("Error creating quiz question");
  }
};

const updateQuizQuestion = async (req, res) => {
  const quizId = parseInt(req.params.id);
  const { question, image_path } = req.body;

  try {
    const updatedQuiz = await QuizQuestion.updateQuizQuestion(quizId, question, image_path);
    if (!updatedQuiz) {
      return res.status(404).send("Quiz question not found");
    }
    res.json({ message: "Quiz question updated successfully" });
  } catch (error) {
    console.error("Error updating quiz question:", error);
    res.status(500).send("Error updating quiz question");
  }
};

const deleteQuizQuestionById = async (req, res) => {
  const quizId = parseInt(req.params.id);

  try {
    const success = await QuizQuestion.deleteQuizQuestion(quizId);
    if (!success) {
      return res.status(404).send("Quiz question not found");
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting quiz question:", error);
    res.status(500).send("Error deleting quiz question");
  }
};

module.exports = {
  getAllQuizQuestions,
  getQuizQuestionById,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestionById
};
