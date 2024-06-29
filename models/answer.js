const sql = require("mssql");
const dbConfig = require("../dbConfig");

class AnswerChoice {
  constructor(id, question_id, answer_text, is_correct, explanation) {
    this.id = id;
    this.question_id = question_id;
    this.answer_text = answer_text;
    this.is_correct = is_correct;
    this.explanation = explanation;
  }

  // Retrieves all answer choices associated with a specific question
  static async getAnswersByQuestion(questionId) {
    // Connect to the database
    const connection = await sql.connect(dbConfig);

    try {
      // SQL query to select all answer choices for a given question
      const sqlQuery = `SELECT * FROM AnswerChoices WHERE question_id = @questionId`;

      const request = connection.request();
      request.input("questionId", questionId);
      const result = await request.query(sqlQuery);

      // Close the database connection
      connection.close();

      // Map the result to AnswerChoice objects and return
      return result.recordset.map(
        (row) => new AnswerChoice(row.id, row.question_id, row.answer_text, row.is_correct, row.explanation)
      );
    } catch (error) {
      // Throw a new error if fetching answers fails
      throw new Error("Error fetching answers");
    } finally {
      // Ensure the database connection is closed in case of an error
      await connection.close();
    }
  }

  // Retrieves a single answer choice by its unique id
  static async getAnswerById(answerId) {
    // Connect to the database
    const connection = await sql.connect(dbConfig);

    try {
      // SQL query to select an answer choice by its id
      const sqlQuery = `
        SELECT *
        FROM AnswerChoices
        WHERE id = @answerId
      `;
      const request = connection.request();
      request.input("answerId", answerId);
      const result = await request.query(sqlQuery);

      // If no answer choice is found, return null
      if (!result.recordset.length) return null;

      // Return a new AnswerChoice object with the fetched data
      const answerData = result.recordset[0];
      return new AnswerChoice(
        answerData.id,
        answerData.question_id,
        answerData.answer_text,
        answerData.is_correct,
        answerData.explanation
      );
    } catch (error) {
      // Log and re-throw any errors that occur
      console.error(`Error fetching answer with ID ${answerId}:`, error);
      throw error;
    } finally {
      // Ensure the database connection is closed
      connection.close();
    }
  }

  // Creates a new answer choice in the database
  static async createAnswer(newAnswerData) {
    // Connect to the database
    const connection = await sql.connect(dbConfig);

    // SQL query to insert a new answer choice and retrieve the new ID
    const sqlQuery = `
      INSERT INTO AnswerChoices (question_id, answer_text, is_correct, explanation)
      VALUES (@question_id, @answer_text, @is_correct, @explanation);
      SELECT SCOPE_IDENTITY() AS id;
    `;
    const request = connection.request();
    request.input("question_id", newAnswerData.question_id);
    request.input("answer_text", newAnswerData.answer_text);
    request.input("is_correct", newAnswerData.is_correct);
    request.input("explanation", newAnswerData.explanation);

    // Execute the query and retrieve the new answer choice ID
    const result = await request.query(sqlQuery);
    connection.close();

    // Return the newly created AnswerChoice object by calling getAnswerById with the new ID
    return this.getAnswerById(result.recordset[0].id);
  }

  // Updates an existing answer choice in the database
  static async updateAnswer(id, newAnswerData) {
    // Connect to the database
    const connection = await sql.connect(dbConfig);

    // SQL query to update the answer choice with the given id
    const sqlQuery = `
      UPDATE AnswerChoices
      SET answer_text = @answer_text, is_correct = @is_correct, explanation = @explanation
      WHERE id = @id
    `;
    const request = connection.request();
    request.input("id", id);
    request.input("answer_text", newAnswerData.answer_text || null);
    request.input("is_correct", newAnswerData.is_correct);
    request.input("explanation", newAnswerData.explanation || null);

    // Execute the query to update the answer choice
    await request.query(sqlQuery);

    // Return the updated AnswerChoice object by calling getAnswerById with the id
    return this.getAnswerById(id);
  }

  // Deletes an answer choice from the database
  static async deleteAnswer(id) {
    // Connect to the database
    const connection = await sql.connect(dbConfig);

    try {
      // SQL query to delete the answer choice with the given id
      const sqlQuery = `
        DELETE FROM AnswerChoices
        WHERE id = @id
      `;
      const request = connection.request();
      request.input("id", id);
      const result = await request.query(sqlQuery);

      // Return true if the answer choice was successfully deleted, otherwise false
      return result.rowsAffected > 0;
    } catch (error) {
      // Log and re-throw any errors that occur
      console.error(`Error deleting answer with ID ${id}:`, error);
      throw error;
    } finally {
      // Ensure the database connection is closed
      connection.close();
    }
  }
}

// Export the AnswerChoice class to be used in other parts of the application
module.exports = AnswerChoice;
