const answerController = require("../controllers/answerController");
const AnswerChoice = require("../models/answer");

jest.mock("../models/answer");

describe("answerController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAnswersByQuestion", () => {
    it("should fetch all answers by question ID and return a JSON response", async () => {
      const mockAnswers = [
        { id: 1, answer_text: "Answer 1", is_correct: 1 },
        { id: 2, answer_text: "Answer 2", is_correct: 0 },
      ];

      AnswerChoice.getAnswersByQuestion.mockResolvedValue(mockAnswers);

      const req = { params: { id: "1" } };
      const res = {
        json: jest.fn(),
      };

      await answerController.getAnswersByQuestion(req, res);

      expect(AnswerChoice.getAnswersByQuestion).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockAnswers);
    });

    it("should handle errors and return a 500 status with an error message", async () => {
      AnswerChoice.getAnswersByQuestion.mockRejectedValue(new Error("Database error"));

      const req = { params: { id: "1" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await answerController.getAnswersByQuestion(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error retrieving answers");
    });
  });

  describe("getAnswerById", () => {
    it("should fetch a specific answer and return a JSON response", async () => {
      const mockAnswerId = 1;
      const mockAnswer = { id: mockAnswerId, answer_text: "Answer 1", is_correct: 1 };

      AnswerChoice.getAnswerById.mockResolvedValue(mockAnswer);

      const req = { params: { id: mockAnswerId.toString() } };
      const res = {
        json: jest.fn(),
      };

      await answerController.getAnswerById(req, res);

      expect(AnswerChoice.getAnswerById).toHaveBeenCalledWith(mockAnswerId);
      expect(res.json).toHaveBeenCalledWith(mockAnswer);
    });

    it("should return 404 if answer not found", async () => {
      const mockAnswerId = 999;

      AnswerChoice.getAnswerById.mockResolvedValue(null);

      const req = { params: { id: mockAnswerId.toString() } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await answerController.getAnswerById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("Answer not found");
    });

    it("should handle errors and return a 500 status with an error message", async () => {
      const mockAnswerId = 1;

      AnswerChoice.getAnswerById.mockRejectedValue(new Error("Database error"));

      const req = { params: { id: mockAnswerId.toString() } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await answerController.getAnswerById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error retrieving answer");
    });
  });

  describe("createAnswer", () => {
    it("should create a new answer and return a JSON response", async () => {
      const newAnswer = { answer_text: "New Answer", is_correct: 1 };
      const createdAnswer = { ...newAnswer, id: 1 };

      AnswerChoice.createAnswer.mockResolvedValue(createdAnswer);

      const req = { body: newAnswer };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await answerController.createAnswer(req, res);

      expect(AnswerChoice.createAnswer).toHaveBeenCalledWith(newAnswer);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdAnswer);
    });

    it("should handle errors and return a 500 status with an error message", async () => {
      const newAnswer = { answer_text: "New Answer", is_correct: 1 };

      AnswerChoice.createAnswer.mockRejectedValue(new Error("Database error"));

      const req = { body: newAnswer };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await answerController.createAnswer(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error creating answer");
    });
  });

  describe("updateAnswer", () => {
    it("should update an answer and return a JSON response", async () => {
      const answerId = 1;
      const newAnswerData = { answer_text: "Updated Answer", is_correct: 0 };
      const existingAnswer = { id: answerId, answer_text: "Original Answer", is_correct: 1 };
      const updatedAnswer = { ...existingAnswer, ...newAnswerData };

      AnswerChoice.getAnswerById.mockResolvedValue(existingAnswer);
      AnswerChoice.updateAnswer.mockResolvedValue(updatedAnswer);

      const req = {
        params: { id: answerId.toString() },
        body: newAnswerData,
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await answerController.updateAnswer(req, res);

      expect(AnswerChoice.getAnswerById).toHaveBeenCalledWith(answerId);
      expect(AnswerChoice.updateAnswer).toHaveBeenCalledWith(answerId, { ...newAnswerData });
      expect(res.json).toHaveBeenCalledWith(updatedAnswer);
    });

    it("should return 404 if answer not found", async () => {
      const answerId = 999;

      AnswerChoice.getAnswerById.mockResolvedValue(null);

      const req = {
        params: { id: answerId.toString() },
        body: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await answerController.updateAnswer(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("Answer not found");
    });

    it("should handle errors and return a 500 status with an error message", async () => {
      const answerId = 1;

      AnswerChoice.getAnswerById.mockResolvedValue({ id: answerId });
      AnswerChoice.updateAnswer.mockRejectedValue(new Error("Database error"));

      const req = {
        params: { id: answerId.toString() },
        body: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await answerController.updateAnswer(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error updating answer");
    });
  });

  describe("deleteAnswer", () => {
    it("should delete an answer and return a 204 status", async () => {
      const answerId = 1;
      const existingAnswer = { id: answerId, answer_text: "Answer to delete", is_correct: 1 };

      AnswerChoice.getAnswerById.mockResolvedValue(existingAnswer);
      AnswerChoice.deleteAnswer.mockResolvedValue(true);

      const req = {
        params: { id: answerId.toString() },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await answerController.deleteAnswer(req, res);

      expect(AnswerChoice.getAnswerById).toHaveBeenCalledWith(answerId);
      expect(AnswerChoice.deleteAnswer).toHaveBeenCalledWith(answerId);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalledTimes(1);
    });

    it("should return 404 if answer not found", async () => {
      const answerId = 999;

      AnswerChoice.getAnswerById.mockResolvedValue(null);

      const req = {
        params: { id: answerId.toString() },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await answerController.deleteAnswer(req, res);

      expect(AnswerChoice.getAnswerById).toHaveBeenCalledWith(answerId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("Answer not found");
    });

    it("should handle errors and return a 500 status with an error message", async () => {
      const answerId = 1;

      AnswerChoice.getAnswerById.mockResolvedValue({ id: answerId });
      AnswerChoice.deleteAnswer.mockRejectedValue(new Error("Database error"));

      const req = {
        params: { id: answerId.toString() },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await answerController.deleteAnswer(req, res);

      expect(AnswerChoice.getAnswerById).toHaveBeenCalledWith(answerId);
      expect(AnswerChoice.deleteAnswer).toHaveBeenCalledWith(answerId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error deleting answer");
    });
  });
});
