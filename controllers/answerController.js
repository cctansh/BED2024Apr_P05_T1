const AnswerChoice = require("../models/answer");

const getAnswersByQuestion = async (req, res) => {
  const questionId = parseInt(req.params.id);
  try {
    const answers = await AnswerChoice.getAnswersByQuestion(questionId);
    if (!answers) {
      return res.status(404).send("Answers not found");
    }
    res.json(answers);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving answers");
  }
};

const getAnswerById = async (req, res) => {
  const answerId = parseInt(req.params.id);
  try {
    const answer = await AnswerChoice.getAnswerById(answerId);
    if (!answer) {
      return res.status(404).send("Answer not found");
    }
    res.json(answer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving answer");
  }
};

const createAnswer = async (req, res) => {
  const newAnswer = req.body;
  try {
    const createdAnswer = await AnswerChoice.createAnswer(newAnswer);
    res.status(201).json(createdAnswer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating answer");
  }
};

const updateAnswer = async (req, res) => {
  const answerId = parseInt(req.params.id);
  const newAnswerData = req.body;

  try {
    const updatedAnswer = await AnswerChoice.updateAnswer(answerId, newAnswerData);
    if (!updatedAnswer) {
      return res.status(404).send("Answer not found");
    }
    res.json(updatedAnswer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating answer");
  }
};

const deleteAnswer = async (req, res) => {
  const answerId = parseInt(req.params.id);

  try {
    const success = await AnswerChoice.deleteAnswer(answerId);
    if (!success) {
      return res.status(404).send("Answer not found");
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting answer");
  }
};

module.exports = {
  getAnswersByQuestion,
  getAnswerById,
  createAnswer,
  updateAnswer,
  deleteAnswer
};