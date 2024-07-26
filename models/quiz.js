const sql = require("mssql");
const dbConfig = require("../dbConfig");

class QuizQuestion {
  constructor(id, question, image_path) {
    this.id = id;
    this.question = question;
    this.image_path = image_path;
  }

  static async getAllQuizQuestions() {
    let connection;
    try {
      connection = await sql.connect(dbConfig);
      const sqlQuery = `
        SELECT id, question, image_path
        FROM QuizQuestions
        ORDER BY id
      `;
      const result = await connection.query(sqlQuery);

      return result.recordset.map(
        (row) => new QuizQuestion(row.id, row.question, row.image_path)
      );
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
      throw error;
    } finally {
      if (connection) connection.close();
    }
  }

  static async deleteQuizQuestion(id) {
    const connection = await sql.connect(dbConfig);
    try {
      const transaction = new sql.Transaction(connection); // Start new transaction
      await transaction.begin(); // Begin transaction

      // Delete answers first
      // SQL query to delete answers associated with the post
      const deleteAnswersQuery = `
          DELETE FROM AnswerChoices
          WHERE question_id = @id;
      `;
      await transaction.request().input("id", id).query(deleteAnswersQuery); // Execute query to delete Answers

      // Then delete the Question
      // SQL query to delete question itself
      const deleteQuestionQuery = `
          DELETE FROM QuizQuestions
          WHERE id = @id;
      `;
      const result = await transaction.request().input("id", id).query(deleteQuestionQuery); // Execute query to delete question

      await transaction.commit(); // Commit the transaction
      connection.close(); // Close DB connection
      console.log("hi")
      return result.rowsAffected[0] > 0; // Return true if at least one row was affected (post deleted)
  } catch (error) {
      // If failed to delete question, log the error in console and alert user that question deletion failed
      console.error("Failed to delete question:", error);
      alert('Failed to delete question.');
  }
  }

  static async getQuizQuestionById(id) {
    let connection;
    try {
      connection = await sql.connect(dbConfig);

      const sqlQuery = `SELECT id, question, image_path FROM QuizQuestions WHERE id = @id`;

      const request = connection.request();
      request.input("id", sql.Int, id);
      const result = await request.query(sqlQuery);

      return result.recordset[0]
        ? new QuizQuestion(
            result.recordset[0].id,
            result.recordset[0].question,
            result.recordset[0].image_path
          )
        : null;
    } catch (error) {
      console.error("Error fetching quiz question by ID:", error);
      throw error;
    } finally {
      if (connection) connection.close();
    }
  }

  static async createQuizQuestion(question, image_path) {
    let connection;
    try {
      connection = await sql.connect(dbConfig);

      const sqlQuery = `
        INSERT INTO QuizQuestions (question, image_path)
        OUTPUT INSERTED.id
        VALUES (@question, @image_path)
      `;

      const request = connection.request();
      request.input("question", sql.NVarChar, question);
      request.input("image_path", sql.NVarChar, image_path);

      const result = await request.query(sqlQuery);

      return result.recordset[0]; // Return the ID of the newly created quiz question
    } catch (error) {
      console.error("Error creating quiz question:", error);
      throw error;
    } finally {
      if (connection) connection.close();
    }
  }

  static async updateQuizQuestion(id, question, image_path) {
    let connection;
    try {
      connection = await sql.connect(dbConfig);

      const sqlQuery = `
        UPDATE QuizQuestions
        SET question = @question, image_path = @image_path
        WHERE id = @id
      `;

      const request = connection.request();
      request.input("id", sql.Int, id);
      request.input("question", sql.NVarChar, question);
      request.input("image_path", sql.NVarChar, image_path);

      const result = await request.query(sqlQuery);

      return result.rowsAffected[0] > 0; // Return true if a row was updated, otherwise false
    } catch (error) {
      console.error("Error updating quiz question:", error);
      throw error;
    } finally {
      if (connection) connection.close();
    }
  }
}

module.exports = QuizQuestion;
