const sql = require("mssql");
const dbConfig = require("../dbConfig");
const Answer = require("../models/answer");

// Mock the mssql module
jest.mock("mssql");

describe("Answer", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("getAnswersByQuestion", () => {
    it("should return answers for a question", async () => {
      const mockAnswers = [
        { id: 1, question_id: 1, answer_text: "Answer 1", is_correct: 1, explanation: "Explanation 1" },
        { id: 2, question_id: 1, answer_text: "Answer 2", is_correct: 0, explanation: "Explanation 2" },
      ];

      const mockConnection = {
        request: jest.fn().mockReturnThis(), // Mock the request method to return the connection itself
        input: jest.fn().mockReturnThis(), // Mock the input method to return the connection itself
        query: jest.fn().mockResolvedValue({ recordset: mockAnswers }), // Mock the query method to return mock answers
        close: jest.fn(), // Mock the close method
      };

      sql.connect.mockResolvedValue(mockConnection); // Mock sql.connect to return the mockConnection

      const answers = await Answer.getAnswersByQuestion(1); // Call the method to be tested

      // Verify that sql.connect was called with dbConfig
      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      // Verify that request was called
      expect(mockConnection.request).toHaveBeenCalled();
      // Verify that input was called with correct parameters
      expect(mockConnection.input).toHaveBeenCalledWith("questionId", sql.Int, 1);
      // Verify that query was called with the correct SQL query
      expect(mockConnection.query).toHaveBeenCalledWith("SELECT * FROM AnswerChoices WHERE question_id = @questionId");
      // Verify that close was called
      expect(mockConnection.close).toHaveBeenCalled();
      // Verify the returned answers
      expect(answers).toHaveLength(2);
      expect(answers).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: 1, answer_text: "Answer 1" }),
        expect.objectContaining({ id: 2, answer_text: "Answer 2" })
      ]));
    });

    it("should handle errors when retrieving answers", async () => {
      // Mock connection with a rejected promise for query
      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockRejectedValue(new Error("Database error")),
        close: jest.fn(),
      });

      // Expect the method to throw an error
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
        request: jest.fn().mockReturnThis(), // Mock the request method to return the connection itself
        input: jest.fn().mockReturnThis(), // Mock the input method to return the connection itself
        query: jest.fn().mockResolvedValue({ recordset: [mockAnswer] }), // Mock the query method to return the mock answer
        close: jest.fn(), // Mock the close method
      };

      sql.connect.mockResolvedValue(mockConnection); // Mock sql.connect to return the mockConnection

      const answer = await Answer.getAnswerById(1); // Call the method to be tested

      // Verify that sql.connect was called with dbConfig
      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      // Verify that request was called
      expect(mockConnection.request).toHaveBeenCalled();
      // Verify that input was called with correct parameters
      expect(mockConnection.input).toHaveBeenCalledWith("answerId", sql.Int, 1);
      // Verify that query was called with the correct SQL query
      expect(mockConnection.query).toHaveBeenCalledWith("SELECT * FROM AnswerChoices WHERE id = @answerId");
      // Verify that close was called
      expect(mockConnection.close).toHaveBeenCalled();
      // Verify the returned answer
      expect(answer).toEqual(expect.objectContaining({ id: 1, answer_text: "Answer 1" }));
    });

    it("should return null if answer is not found", async () => {
      const mockConnection = {
        request: jest.fn().mockReturnThis(), // Mock the request method to return the connection itself
        input: jest.fn().mockReturnThis(), // Mock the input method to return the connection itself
        query: jest.fn().mockResolvedValue({ recordset: [] }), // Mock the query method to return an empty array
        close: jest.fn(), // Mock the close method
      };

      sql.connect.mockResolvedValue(mockConnection); // Mock sql.connect to return the mockConnection

      const answer = await Answer.getAnswerById(999); // Call the method to be tested with a non-existent ID

      // Verify that sql.connect was called with dbConfig
      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      // Verify that request was called
      expect(mockConnection.request).toHaveBeenCalled();
      // Verify that input was called with correct parameters
      expect(mockConnection.input).toHaveBeenCalledWith("answerId", sql.Int, 999);
      // Verify that query was called with the correct SQL query
      expect(mockConnection.query).toHaveBeenCalledWith("SELECT * FROM AnswerChoices WHERE id = @answerId");
      // Verify that close was called
      expect(mockConnection.close).toHaveBeenCalled();
      // Verify the returned answer is null
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
        request: jest.fn().mockReturnThis(), // Mock the request method to return the connection itself
        input: jest.fn().mockReturnThis(), // Mock the input method to return the connection itself
        query: jest.fn().mockResolvedValue({ recordset: [{ id: 3 }] }), // Mock the query method to return new answer ID
        close: jest.fn(), // Mock the close method
      };

      sql.connect.mockResolvedValue(mockConnection); // Mock sql.connect to return the mockConnection

      const mockGetAnswerById = jest.spyOn(Answer, "getAnswerById").mockResolvedValue({
        id: 3,
        ...newAnswerData,
      }); // Mock getAnswerById to return the newly created answer

      const answer = await Answer.createAnswer(newAnswerData); // Call the method to be tested

      // Verify that sql.connect was called with dbConfig
      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      // Verify that request was called
      expect(mockConnection.request).toHaveBeenCalled();
      // Verify that input was called with correct parameters
      expect(mockConnection.input).toHaveBeenCalledWith("question_id", sql.Int, newAnswerData.question_id);
      expect(mockConnection.input).toHaveBeenCalledWith("answer_text", sql.NVarChar, newAnswerData.answer_text);
      expect(mockConnection.input).toHaveBeenCalledWith("is_correct", sql.Bit, newAnswerData.is_correct);
      expect(mockConnection.input).toHaveBeenCalledWith("explanation", sql.NVarChar, newAnswerData.explanation);
      // Verify that query was called with the correct SQL query
      expect(mockConnection.query).toHaveBeenCalledWith(`
        INSERT INTO AnswerChoices (question_id, answer_text, is_correct, explanation)
        VALUES (@question_id, @answer_text, @is_correct, @explanation);
        SELECT SCOPE_IDENTITY() AS id;
      `);
      // Verify that getAnswerById was called with the correct ID
      expect(mockGetAnswerById).toHaveBeenCalledWith(3);
      // Verify the returned answer
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
        request: jest.fn().mockReturnThis(), // Mock the request method to return the connection itself
        input: jest.fn().mockReturnThis(), // Mock the input method to return the connection itself
        query: jest.fn().mockRejectedValue(new Error("Database error")), // Mock the query method to reject with an error
        close: jest.fn(), // Mock the close method
      });

      // Expect the method to throw an error
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
        request: jest.fn().mockReturnThis(), // Mock the request method to return the connection itself
        input: jest.fn().mockReturnThis(), // Mock the input method to return the connection itself
        query: jest.fn().mockResolvedValue({}), // Mock the query method to resolve with no results
        close: jest.fn(), // Mock the close method
      };

      sql.connect.mockResolvedValue(mockConnection); // Mock sql.connect to return the mockConnection

      const mockGetAnswerById = jest.spyOn(Answer, "getAnswerById").mockResolvedValue({
        id: 1,
        question_id: 1,
        ...updatedAnswerData,
      }); // Mock getAnswerById to return the updated answer

      const answer = await Answer.updateAnswer(1, updatedAnswerData); // Call the method to be tested

      // Verify that sql.connect was called with dbConfig
      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      // Verify that request was called
      expect(mockConnection.request).toHaveBeenCalled();
      // Verify that input was called with correct parameters
      expect(mockConnection.input).toHaveBeenCalledWith("id", sql.Int, 1);
      expect(mockConnection.input).toHaveBeenCalledWith("answer_text", sql.NVarChar, updatedAnswerData.answer_text);
      expect(mockConnection.input).toHaveBeenCalledWith("is_correct", sql.Bit, updatedAnswerData.is_correct);
      expect(mockConnection.input).toHaveBeenCalledWith("explanation", sql.NVarChar, updatedAnswerData.explanation);
      // Verify that query was called with the correct SQL query
      expect(mockConnection.query).toHaveBeenCalledWith(`
        UPDATE AnswerChoices
        SET answer_text = @answer_text, is_correct = @is_correct, explanation = @explanation
        WHERE id = @id
      `);
      // Verify that getAnswerById was called with the correct ID
      expect(mockGetAnswerById).toHaveBeenCalledWith(1);
      // Verify the returned answer
      expect(answer).toEqual(expect.objectContaining({ id: 1, answer_text: "Updated Answer" }));
    });

    it("should handle errors when updating an answer", async () => {
      const updatedAnswerData = {
        answer_text: "Updated Answer",
        is_correct: 1,
        explanation: "Updated Explanation",
      };

      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnThis(), // Mock the request method to return the connection itself
        input: jest.fn().mockReturnThis(), // Mock the input method to return the connection itself
        query: jest.fn().mockRejectedValue(new Error("Database error")), // Mock the query method to reject with an error
        close: jest.fn(), // Mock the close method
      });

      // Expect the method to throw an error
      await expect(Answer.updateAnswer(1, updatedAnswerData)).rejects.toThrow("Database error");
    });
  });

  describe("deleteAnswer", () => {
    it("should delete an existing answer", async () => {
      const mockConnection = {
        request: jest.fn().mockReturnThis(), // Mock the request method to return the connection itself
        input: jest.fn().mockReturnThis(), // Mock the input method to return the connection itself
        query: jest.fn().mockResolvedValue({ rowsAffected: [1] }), // Mock the query method to return affected rows
        close: jest.fn(), // Mock the close method
      };

      sql.connect.mockResolvedValue(mockConnection); // Mock sql.connect to return the mockConnection

      const result = await Answer.deleteAnswer(1); // Call the method to be tested

      // Verify that sql.connect was called with dbConfig
      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      // Verify that request was called
      expect(mockConnection.request).toHaveBeenCalled();
      // Verify that input was called with correct parameters
      expect(mockConnection.input).toHaveBeenCalledWith("id", sql.Int, 1);
      // Verify that query was called with the correct SQL query
      expect(mockConnection.query).toHaveBeenCalledWith("DELETE FROM AnswerChoices WHERE id = @id");
      // Verify that close was called
      expect(mockConnection.close).toHaveBeenCalled();
      // Verify the result of the delete operation
      expect(result).toBe(true);
    });

    it("should return false if the answer was not deleted", async () => {
      const mockConnection = {
        request: jest.fn().mockReturnThis(), // Mock the request method to return the connection itself
        input: jest.fn().mockReturnThis(), // Mock the input method to return the connection itself
        query: jest.fn().mockResolvedValue({ rowsAffected: [0] }), // Mock the query method to return no affected rows
        close: jest.fn(), // Mock the close method
      };

      sql.connect.mockResolvedValue(mockConnection); // Mock sql.connect to return the mockConnection

      const result = await Answer.deleteAnswer(999); // Call the method to be tested with a non-existent ID

      // Verify that sql.connect was called with dbConfig
      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      // Verify that request was called
      expect(mockConnection.request).toHaveBeenCalled();
      // Verify that input was called with correct parameters
      expect(mockConnection.input).toHaveBeenCalledWith("id", sql.Int, 999);
      // Verify that query was called with the correct SQL query
      expect(mockConnection.query).toHaveBeenCalledWith("DELETE FROM AnswerChoices WHERE id = @id");
      // Verify that close was called
      expect(mockConnection.close).toHaveBeenCalled();
      // Verify the result of the delete operation
      expect(result).toBe(false);
    });

    it("should handle errors when deleting an answer", async () => {
      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnThis(), // Mock the request method to return the connection itself
        input: jest.fn().mockReturnThis(), // Mock the input method to return the connection itself
        query: jest.fn().mockRejectedValue(new Error("Database error")), // Mock the query method to reject with an error
        close: jest.fn(), // Mock the close method
      });

      // Expect the method to throw an error
      await expect(Answer.deleteAnswer(1)).rejects.toThrow("Database error");
    });
  });
});
