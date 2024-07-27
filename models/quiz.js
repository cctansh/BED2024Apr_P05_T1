const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Define the QuizQuestion class
class QuizQuestion {
  // Constructor to initialize QuizQuestion instance
  constructor(id, question, image_path) {
    this.id = id;                // Unique identifier for the quiz question
    this.question = question;    // Text of the quiz question
    this.image_path = image_path; // Path to an image related to the quiz question
  }

  // Static method to get all quiz questions from the database
  static async getAllQuizQuestions() {
    let connection;
    try {
      // Establish connection to the database
      connection = await sql.connect(dbConfig);
      
      // SQL query to select all quiz questions, ordered by their ID
      const sqlQuery = `
        SELECT id, question, image_path
        FROM QuizQuestions
        ORDER BY id
      `;
      
      // Execute the query and get the results
      const result = await connection.query(sqlQuery);
      
      // Map the results to an array of QuizQuestion instances
      return result.recordset.map(
        (row) => new QuizQuestion(row.id, row.question, row.image_path)
      );
    } catch (error) {
      // Log and throw error if the query fails
      console.error("Error fetching quiz questions:", error);
      throw error;
    } finally {
      // Ensure the connection is closed
      if (connection) connection.close();
    }
  }

  // Static method to delete a quiz question and its associated answers
  static async deleteQuizQuestion(id) {
    const connection = await sql.connect(dbConfig);
    try {
      // Start a new database transaction
      const transaction = new sql.Transaction(connection);
      await transaction.begin();

      // Query to delete associated answers first
      const deleteAnswersQuery = `
          DELETE FROM AnswerChoices
          WHERE question_id = @id;
      `;
      await transaction.request().input("id", id).query(deleteAnswersQuery);

      // Query to delete the quiz question itself
      const deleteQuestionQuery = `
          DELETE FROM QuizQuestions
          WHERE id = @id;
      `;
      const result = await transaction.request().input("id", id).query(deleteQuestionQuery);

      // Commit the transaction if both queries succeed
      await transaction.commit();
      connection.close();
      console.log("hi");
      return result.rowsAffected[0] > 0; // Return true if a row was deleted
    } catch (error) {
      // Log error and provide feedback if the transaction fails
      console.error("Failed to delete question:", error);
      alert('Failed to delete question.');
    }
  }

  // Static method to get a quiz question by its ID
  static async getQuizQuestionById(id) {
    let connection;
    try {
      // Establish connection to the database
      connection = await sql.connect(dbConfig);
      
      // SQL query to select a single quiz question by its ID
      const sqlQuery = `SELECT id, question, image_path FROM QuizQuestions WHERE id = @id`;
      
      // Create and execute the query
      const request = connection.request();
      request.input("id", sql.Int, id);
      const result = await request.query(sqlQuery);
      
      // Return a QuizQuestion instance if found, otherwise null
      return result.recordset[0]
        ? new QuizQuestion(
            result.recordset[0].id,
            result.recordset[0].question,
            result.recordset[0].image_path
          )
        : null;
    } catch (error) {
      // Log and throw error if the query fails
      console.error("Error fetching quiz question by ID:", error);
      throw error;
    } finally {
      // Ensure the connection is closed
      if (connection) connection.close();
    }
  }

  // Static method to create a new quiz question
  static async createQuizQuestion(question, image_path) {
    let connection;
    try {
      // Establish connection to the database
      connection = await sql.connect(dbConfig);
      
      // SQL query to insert a new quiz question and return its ID
      const sqlQuery = `
        INSERT INTO QuizQuestions (question, image_path)
        OUTPUT INSERTED.id
        VALUES (@question, @image_path)
      `;
      
      // Create and execute the query
      const request = connection.request();
      request.input("question", sql.NVarChar, question);
      request.input("image_path", sql.NVarChar, image_path);
      const result = await request.query(sqlQuery);
      
      // Return the ID of the newly created question
      return result.recordset[0];
    } catch (error) {
      // Log and throw error if the query fails
      console.error("Error creating quiz question:", error);
      throw error;
    } finally {
      // Ensure the connection is closed
      if (connection) connection.close();
    }
  }

  // Static method to update an existing quiz question
  static async updateQuizQuestion(id, question, image_path) {
    let connection;
    try {
      // Establish connection to the database
      connection = await sql.connect(dbConfig);
      
      // SQL query to update an existing quiz question
      const sqlQuery = `
        UPDATE QuizQuestions
        SET question = @question, image_path = @image_path
        WHERE id = @id
      `;
      
      // Create and execute the query
      const request = connection.request();
      request.input("id", sql.Int, id);
      request.input("question", sql.NVarChar, question);
      request.input("image_path", sql.NVarChar, image_path);
      const result = await request.query(sqlQuery);
      
      // Return true if a row was updated, otherwise false
      return result.rowsAffected[0] > 0;
    } catch (error) {
      // Log and throw error if the query fails
      console.error("Error updating quiz question:", error);
      throw error;
    } finally {
      // Ensure the connection is closed
      if (connection) connection.close();
    }
  }
}

module.exports = QuizQuestion;
