const sql = require("mssql");
const dbConfig = require("../dbConfig");
const Answer = require("../models/answer");

jest.mock("mssql");

describe("Answer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAnswersByQuestion", () => {
    it("should return answers for a question", async () => {
      const mockAnswers = [
        { id: 1, question_id: 1, answer_text: "Answer 1", is_correct: 1, explanation: "Explanation 1" },
        { id: 2, question_id: 1, answer_text: "Answer 2", is_correct: 0, explanation: "Explanation 2" },
      ];

      const mockConnection = {
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: mockAnswers }),
        close: jest.fn(),
      };

      sql.connect.mockResolvedValue(mockConnection);

      const answers = await Answer.getAnswersByQuestion(1);

      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(mockConnection.request).toHaveBeenCalled();
      expect(mockConnection.input).toHaveBeenCalledWith("questionId", sql.Int, 1);
      expect(mockConnection.query).toHaveBeenCalledWith("SELECT * FROM AnswerChoices WHERE question_id = @questionId");
      expect(mockConnection.close).toHaveBeenCalled();
      expect(answers).toHaveLength(2);
      expect(answers).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: 1, answer_text: "Answer 1" }),
        expect.objectContaining({ id: 2, answer_text: "Answer 2" })
      ]));
    });

    it("should handle errors when retrieving answers", async () => {
      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockRejectedValue(new Error("Database error")),
        close: jest.fn(),
      });

      await expect(Answer.getAnswersByQuestion(1)).rejects.toThrow("Error fetching answers");
    });
  });

  describe("getAnswerById", () => {
    it("should return an answer by id", async () => {
      const mockAnswer = {
        id: 1,
        question_id: 1,
        answer_text: "Answer 1",
        is_correct: 1,
        explanation: "Explanation 1",
      };

      const mockConnection = {
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: [mockAnswer] }),
        close: jest.fn(),
      };

      sql.connect.mockResolvedValue(mockConnection);

      const answer = await Answer.getAnswerById(1);

      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(mockConnection.request).toHaveBeenCalled();
      expect(mockConnection.input).toHaveBeenCalledWith("answerId", sql.Int, 1);
      expect(mockConnection.query).toHaveBeenCalledWith("SELECT * FROM AnswerChoices WHERE id = @answerId");
      expect(mockConnection.close).toHaveBeenCalled();
      expect(answer).toEqual(expect.objectContaining({ id: 1, answer_text: "Answer 1" }));
    });

    it("should return null if answer is not found", async () => {
      const mockConnection = {
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: [] }),
        close: jest.fn(),
      };

      sql.connect.mockResolvedValue(mockConnection);

      const answer = await Answer.getAnswerById(999);

      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(mockConnection.request).toHaveBeenCalled();
      expect(mockConnection.input).toHaveBeenCalledWith("answerId", sql.Int, 999);
      expect(mockConnection.query).toHaveBeenCalledWith("SELECT * FROM AnswerChoices WHERE id = @answerId");
      expect(mockConnection.close).toHaveBeenCalled();
      expect(answer).toBeNull();
    });
  });

  describe("createAnswer", () => {
    it("should create a new answer", async () => {
      const newAnswerData = {
        question_id: 1,
        answer_text: "New Answer",
        is_correct: 0,
        explanation: "New Explanation",
      };

      const mockConnection = {
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: [{ id: 3 }] }),
        close: jest.fn(),
      };

      sql.connect.mockResolvedValue(mockConnection);

      const mockGetAnswerById = jest.spyOn(Answer, "getAnswerById").mockResolvedValue({
        id: 3,
        ...newAnswerData,
      });

      const answer = await Answer.createAnswer(newAnswerData);

      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(mockConnection.request).toHaveBeenCalled();
      expect(mockConnection.input).toHaveBeenCalledWith("question_id", sql.Int, newAnswerData.question_id);
      expect(mockConnection.input).toHaveBeenCalledWith("answer_text", sql.NVarChar, newAnswerData.answer_text);
      expect(mockConnection.input).toHaveBeenCalledWith("is_correct", sql.Bit, newAnswerData.is_correct);
      expect(mockConnection.input).toHaveBeenCalledWith("explanation", sql.NVarChar, newAnswerData.explanation);
      expect(mockConnection.query).toHaveBeenCalledWith(`
        INSERT INTO AnswerChoices (question_id, answer_text, is_correct, explanation)
        VALUES (@question_id, @answer_text, @is_correct, @explanation);
        SELECT SCOPE_IDENTITY() AS id;
      `);
      expect(mockGetAnswerById).toHaveBeenCalledWith(3);
      expect(answer).toEqual(expect.objectContaining({ id: 3, answer_text: "New Answer" }));
    });

    it("should handle errors when creating a new answer", async () => {
      const newAnswerData = {
        question_id: 1,
        answer_text: "New Answer",
        is_correct: 0,
        explanation: "New Explanation",
      };

      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockRejectedValue(new Error("Database error")),
        close: jest.fn(),
      });

      await expect(Answer.createAnswer(newAnswerData)).rejects.toThrow("Database error");
    });
  });

  describe("updateAnswer", () => {
    it("should update an existing answer", async () => {
      const updatedAnswerData = {
        answer_text: "Updated Answer",
        is_correct: 1,
        explanation: "Updated Explanation",
      };

      const mockConnection = {
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({}),
        close: jest.fn(),
      };

      sql.connect.mockResolvedValue(mockConnection);

      const mockGetAnswerById = jest.spyOn(Answer, "getAnswerById").mockResolvedValue({
        id: 1,
        question_id: 1,
        ...updatedAnswerData,
      });

      const answer = await Answer.updateAnswer(1, updatedAnswerData);

      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(mockConnection.request).toHaveBeenCalled();
      expect(mockConnection.input).toHaveBeenCalledWith("id", sql.Int, 1);
      expect(mockConnection.input).toHaveBeenCalledWith("answer_text", sql.NVarChar, updatedAnswerData.answer_text);
      expect(mockConnection.input).toHaveBeenCalledWith("is_correct", sql.Bit, updatedAnswerData.is_correct);
      expect(mockConnection.input).toHaveBeenCalledWith("explanation", sql.NVarChar, updatedAnswerData.explanation);
      expect(mockConnection.query).toHaveBeenCalledWith(`
        UPDATE AnswerChoices
        SET answer_text = @answer_text, is_correct = @is_correct, explanation = @explanation
        WHERE id = @id
      `);
      expect(mockGetAnswerById).toHaveBeenCalledWith(1);
      expect(answer).toEqual(expect.objectContaining({ id: 1, answer_text: "Updated Answer" }));
    });

    it("should handle errors when updating an answer", async () => {
      const updatedAnswerData = {
        answer_text: "Updated Answer",
        is_correct: 1,
        explanation: "Updated Explanation",
      };

      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockRejectedValue(new Error("Database error")),
        close: jest.fn(),
      });

      await expect(Answer.updateAnswer(1, updatedAnswerData)).rejects.toThrow("Database error");
    });
  });

  describe("deleteAnswer", () => {
    it("should delete an existing answer", async () => {
      const mockConnection = {
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ rowsAffected: [1] }),
        close: jest.fn(),
      };

      sql.connect.mockResolvedValue(mockConnection);

      const result = await Answer.deleteAnswer(1);

      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(mockConnection.request).toHaveBeenCalled();
      expect(mockConnection.input).toHaveBeenCalledWith("id", sql.Int, 1);
      expect(mockConnection.query).toHaveBeenCalledWith("DELETE FROM AnswerChoices WHERE id = @id");
      expect(mockConnection.close).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should return false if the answer was not deleted", async () => {
      const mockConnection = {
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ rowsAffected: [0] }),
        close: jest.fn(),
      };

      sql.connect.mockResolvedValue(mockConnection);

      const result = await Answer.deleteAnswer(999);

      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(mockConnection.request).toHaveBeenCalled();
      expect(mockConnection.input).toHaveBeenCalledWith("id", sql.Int, 999);
      expect(mockConnection.query).toHaveBeenCalledWith("DELETE FROM AnswerChoices WHERE id = @id");
      expect(mockConnection.close).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it("should handle errors when deleting an answer", async () => {
      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockRejectedValue(new Error("Database error")),
        close: jest.fn(),
      });

      await expect(Answer.deleteAnswer(1)).rejects.toThrow("Database error");
    });
  });
});
