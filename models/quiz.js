const sql = require("mssql");
const dbConfig = require("../dbConfig");

class QuizQuestion {
  constructor(id, question, image_path) {
    this.id = id;
    this.question = question;
    this.image_path = image_path;
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
        (row) => new QuizQuestion(row.id, row.question, row.image_path)
        ); 
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
      throw error;
    }
  }

  static async getQuizQuestionById(id) {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `SELECT * FROM QuizQuestions WHERE id = @id`;

    const request = connection.request();
    request.input("id", id);
    const result = await request.query(sqlQuery);

    connection.close();

    return result.recordset[0]
      ? new QuizQuestion(
        result.recordset[0].id,
        result.recordset[0].question,
        result.recordset[0].image_path
      )
      : null;
  }
}

module.exports = QuizQuestion;
