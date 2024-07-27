const answerController = require("../controllers/answerController");
const AnswerChoice = require("../models/answer");

jest.mock("../models/answer"); // Mock the AnswerChoice model

describe("answerController", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear all mocks before each test
  });

  describe("getAnswersByQuestion", () => {
    it("should fetch all answers by question ID and return a JSON response", async () => {
      const mockAnswers = [
        { id: 1, answer_text: "Answer 1", is_correct: 1 },
        { id: 2, answer_text: "Answer 2", is_correct: 0 },
      ];

      AnswerChoice.getAnswersByQuestion.mockResolvedValue(mockAnswers); // Mock the response from the model

      const req = { params: { id: "1" } }; // Mock request with question ID
      const res = {
        json: jest.fn(), // Mock response object with a json method
      };

      await answerController.getAnswersByQuestion(req, res); // Call the controller method

      expect(AnswerChoice.getAnswersByQuestion).toHaveBeenCalledWith(1); // Check if the model method was called with the correct ID
      expect(res.json).toHaveBeenCalledWith(mockAnswers); // Check if the response was sent with the correct data
    });

    it("should handle errors and return a 500 status with an error message", async () => {
      AnswerChoice.getAnswersByQuestion.mockRejectedValue(new Error("Database error")); // Mock the model method to throw an error

      const req = { params: { id: "1" } }; // Mock request with question ID
      const res = {
        status: jest.fn().mockReturnThis(), // Mock response object with status method
        send: jest.fn(), // Mock response object with send method
      };

      await answerController.getAnswersByQuestion(req, res); // Call the controller method

      expect(res.status).toHaveBeenCalledWith(500); // Check if the response status was set to 500
      expect(res.send).toHaveBeenCalledWith("Error retrieving answers"); // Check if the response error message was sent
    });
  });

  describe("getAnswerById", () => {
    it("should fetch a specific answer and return a JSON response", async () => {
      const mockAnswerId = 1;
      const mockAnswer = { id: mockAnswerId, answer_text: "Answer 1", is_correct: 1 };

      AnswerChoice.getAnswerById.mockResolvedValue(mockAnswer); // Mock the response from the model

      const req = { params: { id: mockAnswerId.toString() } }; // Mock request with answer ID
      const res = {
        json: jest.fn(), // Mock response object with a json method
      };

      await answerController.getAnswerById(req, res); // Call the controller method

      expect(AnswerChoice.getAnswerById).toHaveBeenCalledWith(mockAnswerId); // Check if the model method was called with the correct ID
      expect(res.json).toHaveBeenCalledWith(mockAnswer); // Check if the response was sent with the correct data
    });

    it("should return 404 if answer not found", async () => {
      const mockAnswerId = 999;

      AnswerChoice.getAnswerById.mockResolvedValue(null); // Mock the model method to return null

      const req = { params: { id: mockAnswerId.toString() } }; // Mock request with answer ID
      const res = {
        status: jest.fn().mockReturnThis(), // Mock response object with status method
        send: jest.fn(), // Mock response object with send method
      };

      await answerController.getAnswerById(req, res); // Call the controller method

      expect(res.status).toHaveBeenCalledWith(404); // Check if the response status was set to 404
      expect(res.send).toHaveBeenCalledWith("Answer not found"); // Check if the response error message was sent
    });

    it("should handle errors and return a 500 status with an error message", async () => {
      const mockAnswerId = 1;

      AnswerChoice.getAnswerById.mockRejectedValue(new Error("Database error")); // Mock the model method to throw an error

      const req = { params: { id: mockAnswerId.toString() } }; // Mock request with answer ID
      const res = {
        status: jest.fn().mockReturnThis(), // Mock response object with status method
        send: jest.fn(), // Mock response object with send method
      };

      await answerController.getAnswerById(req, res); // Call the controller method

      expect(res.status).toHaveBeenCalledWith(500); // Check if the response status was set to 500
      expect(res.send).toHaveBeenCalledWith("Error retrieving answer"); // Check if the response error message was sent
    });
  });

  describe("createAnswer", () => {
    it("should create a new answer and return a JSON response", async () => {
      const newAnswer = { answer_text: "New Answer", is_correct: 1 };
      const createdAnswer = { ...newAnswer, id: 1 };

      AnswerChoice.createAnswer.mockResolvedValue(createdAnswer); // Mock the response from the model

      const req = { body: newAnswer }; // Mock request with new answer data
      const res = {
        status: jest.fn().mockReturnThis(), // Mock response object with status method
        json: jest.fn(), // Mock response object with json method
      };

      await answerController.createAnswer(req, res); // Call the controller method

      expect(AnswerChoice.createAnswer).toHaveBeenCalledWith(newAnswer); // Check if the model method was called with the correct data
      expect(res.status).toHaveBeenCalledWith(201); // Check if the response status was set to 201
      expect(res.json).toHaveBeenCalledWith(createdAnswer); // Check if the response was sent with the correct data
    });

    it("should handle errors and return a 500 status with an error message", async () => {
      const newAnswer = { answer_text: "New Answer", is_correct: 1 };

      AnswerChoice.createAnswer.mockRejectedValue(new Error("Database error")); // Mock the model method to throw an error

      const req = { body: newAnswer }; // Mock request with new answer data
      const res = {
        status: jest.fn().mockReturnThis(), // Mock response object with status method
        send: jest.fn(), // Mock response object with send method
      };

      await answerController.createAnswer(req, res); // Call the controller method

      expect(res.status).toHaveBeenCalledWith(500); // Check if the response status was set to 500
      expect(res.send).toHaveBeenCalledWith("Error creating answer"); // Check if the response error message was sent
    });
  });

  describe("updateAnswer", () => {
    it("should update an answer and return a JSON response", async () => {
      const answerId = 1;
      const newAnswerData = { answer_text: "Updated Answer", is_correct: 0 };
      const existingAnswer = { id: answerId, answer_text: "Original Answer", is_correct: 1 };
      const updatedAnswer = { ...existingAnswer, ...newAnswerData };

      AnswerChoice.getAnswerById.mockResolvedValue(existingAnswer); // Mock the model method to return the existing answer
      AnswerChoice.updateAnswer.mockResolvedValue(updatedAnswer); // Mock the model method to return the updated answer

      const req = {
        params: { id: answerId.toString() }, // Mock request with answer ID
        body: newAnswerData, // Mock request with new answer data
      };
      const res = {
        json: jest.fn(), // Mock response object with a json method
        status: jest.fn().mockReturnThis(), // Mock response object with status method
      };

      await answerController.updateAnswer(req, res); // Call the controller method

      expect(AnswerChoice.getAnswerById).toHaveBeenCalledWith(answerId); // Check if the model method was called with the correct ID
      expect(AnswerChoice.updateAnswer).toHaveBeenCalledWith(answerId, { ...newAnswerData }); // Check if the model method was called with the correct data
      expect(res.json).toHaveBeenCalledWith(updatedAnswer); // Check if the response was sent with the updated answer
    });

    it("should return 404 if answer not found", async () => {
      const answerId = 999;

      AnswerChoice.getAnswerById.mockResolvedValue(null); // Mock the model method to return null

      const req = {
        params: { id: answerId.toString() }, // Mock request with answer ID
        body: {}, // Mock request with no new data
      };
      const res = {
        status: jest.fn().mockReturnThis(), // Mock response object with status method
        send: jest.fn(), // Mock response object with send method
      };

      await answerController.updateAnswer(req, res); // Call the controller method

      expect(res.status).toHaveBeenCalledWith(404); // Check if the response status was set to 404
      expect(res.send).toHaveBeenCalledWith("Answer not found"); // Check if the response error message was sent
    });

    it("should handle errors and return a 500 status with an error message", async () => {
      const answerId = 1;

      AnswerChoice.getAnswerById.mockResolvedValue({ id: answerId }); // Mock the model method to return an existing answer
      AnswerChoice.updateAnswer.mockRejectedValue(new Error("Database error")); // Mock the model method to throw an error

      const req = {
        params: { id: answerId.toString() }, // Mock request with answer ID
        body: {}, // Mock request with no new data
      };
      const res = {
        status: jest.fn().mockReturnThis(), // Mock response object with status method
        send: jest.fn(), // Mock response object with send method
      };

      await answerController.updateAnswer(req, res); // Call the controller method

      expect(res.status).toHaveBeenCalledWith(500); // Check if the response status was set to 500
      expect(res.send).toHaveBeenCalledWith("Error updating answer"); // Check if the response error message was sent
    });
  });

  describe("deleteAnswer", () => {
    it("should delete an answer and return a 204 status", async () => {
      const answerId = 1;
      const existingAnswer = { id: answerId, answer_text: "Answer to delete", is_correct: 1 };

      AnswerChoice.getAnswerById.mockResolvedValue(existingAnswer); // Mock the model method to return the existing answer
      AnswerChoice.deleteAnswer.mockResolvedValue(true); // Mock the model method to return true indicating successful deletion

      const req = {
        params: { id: answerId.toString() }, // Mock request with answer ID
      };
      const res = {
        status: jest.fn().mockReturnThis(), // Mock response object with status method
        send: jest.fn(), // Mock response object with send method
      };

      await answerController.deleteAnswer(req, res); // Call the controller method

      expect(AnswerChoice.getAnswerById).toHaveBeenCalledWith(answerId); // Check if the model method was called with the correct ID
      expect(AnswerChoice.deleteAnswer).toHaveBeenCalledWith(answerId); // Check if the model method was called with the correct ID
      expect(res.status).toHaveBeenCalledWith(204); // Check if the response status was set to 204
      expect(res.send).toHaveBeenCalledTimes(1); // Check if send was called exactly once
    });

    it("should return 404 if answer not found", async () => {
      const answerId = 999;

      AnswerChoice.getAnswerById.mockResolvedValue(null); // Mock the model method to return null

      const req = {
        params: { id: answerId.toString() }, // Mock request with answer ID
      };
      const res = {
        status: jest.fn().mockReturnThis(), // Mock response object with status method
        send: jest.fn(), // Mock response object with send method
      };

      await answerController.deleteAnswer(req, res); // Call the controller method

      expect(AnswerChoice.getAnswerById).toHaveBeenCalledWith(answerId); // Check if the model method was called with the correct ID
      expect(res.status).toHaveBeenCalledWith(404); // Check if the response status was set to 404
      expect(res.send).toHaveBeenCalledWith("Answer not found"); // Check if the response error message was sent
    });

    it("should handle errors and return a 500 status with an error message", async () => {
      const answerId = 1;

      AnswerChoice.getAnswerById.mockResolvedValue({ id: answerId }); // Mock the model method to return an existing answer
      AnswerChoice.deleteAnswer.mockRejectedValue(new Error("Database error")); // Mock the model method to throw an error

      const req = {
        params: { id: answerId.toString() }, // Mock request with answer ID
      };
      const res = {
        status: jest.fn().mockReturnThis(), // Mock response object with status method
        send: jest.fn(), // Mock response object with send method
      };

      await answerController.deleteAnswer(req, res); // Call the controller method

      expect(res.status).toHaveBeenCalledWith(500); // Check if the response status was set to 500
      expect(res.send).toHaveBeenCalledWith("Error deleting answer"); // Check if the response error message was sent
    });
  });
});
