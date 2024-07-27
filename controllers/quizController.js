const QuizQuestion = require("../models/quiz");

// Handler to get all quiz questions
const getAllQuizQuestions = async (req, res) => {
  try {
    // Call the model method to fetch all quiz questions from the database
    const questions = await QuizQuestion.getAllQuizQuestions();
    
    // Send the fetched questions as JSON response
    res.json(questions);
  } catch (error) {
    // Log the error and send a 500 status with an error message if something goes wrong
    console.error("Error retrieving quiz questions:", error);
    res.status(500).send("Error retrieving quiz questions");
  }
};

// Handler to get a specific quiz question by its ID
const getQuizQuestionById = async (req, res) => {
  // Extract and parse the question ID from the request parameters
  const questionId = parseInt(req.params.id);
  
  try {
    // Call the model method to fetch the quiz question by its ID
    const question = await QuizQuestion.getQuizQuestionById(questionId);
    
    // If no question is found, respond with a 404 status
    if (!question) {
      return res.status(404).send("Quiz question not found");
    }
    
    // Send the found question as JSON response
    res.json(question);
  } catch (error) {
    // Log the error and send a 500 status with an error message if something goes wrong
    console.error("Error retrieving quiz question:", error);
    res.status(500).send("Error retrieving quiz question");
  }
};

// Handler to create a new quiz question
const createQuizQuestion = async (req, res) => {
  // Extract the question and image path from the request body
  const { question, image_path } = req.body;
  
  try {
    // Call the model method to create a new quiz question and get the ID of the created question
    const createdQuizId = await QuizQuestion.createQuizQuestion(question, image_path);
    
    // Respond with a 201 status and the ID of the newly created quiz question
    res.status(201).json({ id: createdQuizId });
  } catch (error) {
    // Log the error and send a 500 status with an error message if something goes wrong
    console.error("Error creating quiz question:", error);
    res.status(500).send("Error creating quiz question");
  }
};

// Handler to update an existing quiz question
const updateQuizQuestion = async (req, res) => {
  // Extract and parse the quiz ID from the request parameters
  const quizId = parseInt(req.params.id);
  
  // Extract the updated question and image path from the request body
  const { question, image_path } = req.body;

  try {
    // Call the model method to update the quiz question and check if the update was successful
    const updatedQuiz = await QuizQuestion.updateQuizQuestion(quizId, question, image_path);
    
    // If no question was updated, respond with a 404 status
    if (!updatedQuiz) {
      return res.status(404).send("Quiz question not found");
    }
    
    // Send a success message as JSON response
    res.json({ message: "Quiz question updated successfully" });
  } catch (error) {
    // Log the error and send a 500 status with an error message if something goes wrong
    console.error("Error updating quiz question:", error);
    res.status(500).send("Error updating quiz question");
  }
};

// Handler to delete a specific quiz question
const deleteQuizQuestion = async (req, res) => {
  // Extract and parse the quiz ID from the request parameters
  const quizId = parseInt(req.params.id);

  try {
    // Call the model method to delete the quiz question and check if the deletion was successful
    const success = await QuizQuestion.deleteQuizQuestion(quizId);
    
    // If the deletion was not successful, respond with a 404 status
    if (!success) {
      return res.status(404).send("Quiz question not found");
    }
    
    // Respond with a 204 status indicating successful deletion with no content
    res.status(204).send();
  } catch (error) {
    // Log the error and send a 500 status with an error message if something goes wrong
    console.error("Error deleting quiz question:", error);
    res.status(500).send("Error deleting quiz question");
  }
};

// Export the handlers to be used in routing
module.exports = {
  getAllQuizQuestions,
  getQuizQuestionById,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion
};
