const AnswerChoice = require("../models/answer");

// Controller function to get all answer choices for a specific question
const getAnswersByQuestion = async (req, res) => {
  const questionId = parseInt(req.params.id); // Extract question ID from request parameters
  try {
    const answers = await AnswerChoice.getAnswersByQuestion(questionId); // Fetch answer choices using model method
    if (!answers) {
      return res.status(404).send("Answers not found"); // Send 404 if no answers found
    }
    res.json(answers); // Send the answer choices as JSON
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving answers"); // Send 500 on error
  }
};

// Controller function to get a single answer choice by its ID
const getAnswerById = async (req, res) => {
  const answerId = parseInt(req.params.id); // Extract answer ID from request parameters
  try {
    const answer = await AnswerChoice.getAnswerById(answerId); // Fetch the answer choice using model method
    if (!answer) {
      return res.status(404).send("Answer not found"); // Send 404 if answer not found
    }
    res.json(answer); // Send the answer choice as JSON
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving answer"); // Send 500 on error
  }
};

// Controller function to create a new answer choice
const createAnswer = async (req, res) => {
  const newAnswer = req.body; // Extract new answer data from request body
  try {
    const createdAnswer = await AnswerChoice.createAnswer(newAnswer); // Create new answer choice using model method
    res.status(201).json(createdAnswer); // Send the created answer choice as JSON with 201 status
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating answer"); // Send 500 on error
  }
};

// Controller function to update an existing answer choice
const updateAnswer = async (req, res) => {
  const answerId = parseInt(req.params.id); // Extract answer ID from request parameters
  const newAnswerData = req.body; // Extract updated answer data from request body

  try {
    const answer = await AnswerChoice.getAnswerById(answerId);
    if (!answer) {
      return res.status(404).send("Answer not found");
    }
    const updatedAnswer = await AnswerChoice.updateAnswer(answerId, newAnswerData); // Update answer choice using model method
    if (!updatedAnswer) {
      return res.status(404).send("Answer not found"); // Send 404 if answer not found
    }
    res.json(updatedAnswer); // Send the updated answer choice as JSON
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating answer"); // Send 500 on error
  }
};

// Controller function to delete an answer choice
const deleteAnswer = async (req, res) => {
  const answerId = parseInt(req.params.id); // Extract answer ID from request parameters

  try {
    const answer = await AnswerChoice.getAnswerById(answerId);
    if (!answer) {
      return res.status(404).send("Answer not found");
    }
    
    const success = await AnswerChoice.deleteAnswer(answerId); // Delete answer choice using model method
    if (!success) {
      return res.status(404).send("Answer not found"); // Send 404 if answer not found
    }
    res.status(204).send(); // Send 204 status on successful deletion
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting answer"); // Send 500 on error
  }
};

// Export the controller functions to be used in route definitions
module.exports = {
  getAnswersByQuestion,
  getAnswerById,
  createAnswer,
  updateAnswer,
  deleteAnswer
};
