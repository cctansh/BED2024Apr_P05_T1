const sql = require("mssql");
const dbConfig = require("../dbConfig");

class QuizQuestion {
  constructor(id, question, image_path, explanation) {
    this.id = id;
    this.question = question;
    this.image_path = image_path;
    this.explanation = explanation;
  }

  static async getAllQuizQuestions() {
    try {
      const connection = await sql.connect(dbConfig);
      const sqlQuery = `
        SELECT *
        FROM QuizQuestions
        ORDER BY id
      `;
      const result = await connection.query(sqlQuery);
      connection.close();

      return result.recordset.map(
        (row) => new QuizQuestion(row.id, row.question, row.image_path, row.explanation)
        ); 
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
      throw error;
    }
  }

  static async deleteQuizQuestionById(id) {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `DELETE FROM QuizQuestions WHERE id = @id`;

    const request = connection.request();
    request.input("id", sql.Int, id); // Ensure the id is an integer
    const result = await request.query(sqlQuery);

    connection.close();

    return result.rowsAffected[0] > 0; // Return true if a row was deleted, otherwise false
}

  static async getQuizQuestionById(id) {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `SELECT * FROM QuizQuestions WHERE id = @id`;

    const request = connection.request();
    request.input("id", sql.Int, id); // Ensure the id is an integer
    const result = await request.query(sqlQuery);

    connection.close();

    return result.recordset[0]
      ? new QuizQuestion(
          result.recordset[0].id,
          result.recordset[0].question,
          result.recordset[0].image_path,
          result.recordset[0].explanation
        )
      : null;
  }
}

module.exports = QuizQuestion;
