const sql = require("mssql"); // Import the mssql library for SQL Server database operations
const dbConfig = require("../dbConfig"); // Import database configuration

// Define the AnswerChoice class to interact with the AnswerChoices table
class AnswerChoice {
  constructor(id, question_id, answer_text, is_correct, explanation) {
    this.id = id; // Answer choice ID
    this.question_id = question_id; // Associated question ID
    this.answer_text = answer_text; // Text of the answer choice
    this.is_correct = is_correct; // Flag indicating if the answer is correct (1 for true, 0 for false)
    this.explanation = explanation; // Explanation for the answer choice
  }

  // Static method to get all answer choices for a specific question
  static async getAnswersByQuestion(questionId) {
    const connection = await sql.connect(dbConfig); // Establish a database connection

    try {
      const sqlQuery = `SELECT * FROM AnswerChoices WHERE question_id = @questionId`; // SQL query to fetch answers by question ID
      const request = connection.request(); // Create a request object
      request.input("questionId", sql.Int, questionId); // Add input parameter for question ID
      const result = await request.query(sqlQuery); // Execute the query
      // Map the result to AnswerChoice instances
      return result.recordset.map(row => new AnswerChoice(row.id, row.question_id, row.answer_text, row.is_correct, row.explanation));
    } catch (error) {
      throw new Error("Error fetching answers"); // Throw an error if query fails
    } finally {
      connection.close(); // Close the database connection
    }
  }

  // Static method to get a single answer choice by its ID
  static async getAnswerById(answerId) {
    const connection = await sql.connect(dbConfig); // Establish a database connection

    try {
      const sqlQuery = `SELECT * FROM AnswerChoices WHERE id = @answerId`; // SQL query to fetch an answer by ID
      const request = connection.request(); // Create a request object
      request.input("answerId", sql.Int, answerId); // Add input parameter for answer ID
      const result = await request.query(sqlQuery); // Execute the query
      if (!result.recordset.length) return null; // Return null if no result found
      const answerData = result.recordset[0]; // Get the answer data from the result set
      // Return an instance of AnswerChoice
      return new AnswerChoice(answerData.id, answerData.question_id, answerData.answer_text, answerData.is_correct, answerData.explanation);
    } catch (error) {
      throw error; // Re-throw any errors encountered
    } finally {
      connection.close(); // Close the database connection
    }
  }

  // Static method to create a new answer choice
  static async createAnswer(newAnswerData) {
    const connection = await sql.connect(dbConfig); // Establish a database connection

    try {
      const sqlQuery = `
        INSERT INTO AnswerChoices (question_id, answer_text, is_correct, explanation)
        VALUES (@question_id, @answer_text, @is_correct, @explanation);
        SELECT SCOPE_IDENTITY() AS id;
      `; // SQL query to insert a new answer choice and return its ID
      const request = connection.request(); // Create a request object
      request.input("question_id", sql.Int, newAnswerData.question_id); // Add input parameters for new answer data
      request.input("answer_text", sql.NVarChar, newAnswerData.answer_text);
      request.input("is_correct", sql.Bit, newAnswerData.is_correct);
      request.input("explanation", sql.NVarChar, newAnswerData.explanation);
      const result = await request.query(sqlQuery); // Execute the query
      // Fetch and return the newly created answer choice using its ID
      return await this.getAnswerById(result.recordset[0].id);
    } catch (error) {
      throw error; // Re-throw any errors encountered
    } finally {
      connection.close(); // Close the database connection
    }
  }

  // Static method to update an existing answer choice
  static async updateAnswer(answerId, updatedAnswerData) {
    const connection = await sql.connect(dbConfig); // Establish a database connection

    try {
      const sqlQuery = `
        UPDATE AnswerChoices
        SET answer_text = @answer_text, is_correct = @is_correct, explanation = @explanation
        WHERE id = @id
      `; // SQL query to update an existing answer choice
      const request = connection.request(); // Create a request object
      request.input("id", sql.Int, answerId); // Add input parameters for updated answer data
      request.input("answer_text", sql.NVarChar, updatedAnswerData.answer_text);
      request.input("is_correct", sql.Bit, updatedAnswerData.is_correct);
      request.input("explanation", sql.NVarChar, updatedAnswerData.explanation);
      await request.query(sqlQuery); // Execute the update query
      // Fetch and return the updated answer choice
      return await this.getAnswerById(answerId);
    } catch (error) {
      throw error; // Re-throw any errors encountered
    } finally {
      connection.close(); // Close the database connection
    }
  }

  // Static method to delete an answer choice
  static async deleteAnswer(answerId) {
    const connection = await sql.connect(dbConfig); // Establish a database connection

    try {
      const sqlQuery = `DELETE FROM AnswerChoices WHERE id = @id`; // SQL query to delete an answer choice by ID
      const request = connection.request(); // Create a request object
      request.input("id", sql.Int, answerId); // Add input parameter for answer ID
      const result = await request.query(sqlQuery); // Execute the delete query
      // Return true if any rows were affected (deleted), otherwise false
      return result.rowsAffected[0] > 0;
    } catch (error) {
      throw error; // Re-throw any errors encountered
    } finally {
      connection.close(); // Close the database connection
    }
  }
}

module.exports = AnswerChoice; // Export the AnswerChoice class for use in other modules
