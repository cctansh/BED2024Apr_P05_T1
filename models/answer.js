const sql = require("mssql");
const dbConfig = require("../dbConfig");

class AnswerChoice {
  constructor(id, question_id, answer_text, is_correct) {
    this.id = id;
    this.question_id = question_id;
    this.answer_text = answer_text;
    this.is_correct = is_correct;
  }

  static async getAnswersByQuestion(id) {
    const connection = await sql.connect(dbConfig);

    try {
      const sqlQuery = `SELECT * FROM AnswerChoices WHERE question_id = @id`;

      const request = connection.request();
      request.input("id", id);
      const result = await request.query(sqlQuery);

      connection.close();

      return result.recordset.map(
        (row) => new AnswerChoice(row.id, row.question_id, row.answer_text, row.is_correct)
      );
    } catch (error) {
      throw new Error("Error fetching answers");
    } finally {
      await connection.close();
    }
  }

  static async getAnswerById(answerId) {
    try {
      const connection = await sql.connect(dbConfig);
      const sqlQuery = `
        SELECT id, question_id, answer_text, is_correct
        FROM AnswerChoices
        WHERE id = @answerId
      `;
      const result = await connection
        .request()
        .input("answerId", answerId)
        .query(sqlQuery);
      connection.close();

      if (!result.recordset.length) return null;

      const answerData = result.recordset[0];
      const answer = new AnswerChoice(
        answerData.id,
        answerData.question_id,
        answerData.answer_text,
        answerData.is_correct
      );

      return answer;
    } catch (error) {
      console.error(`Error fetching answer with ID ${answerId}:`, error);
      throw error;
    }
  }

  static async createAnswer(newAnswerData) {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `
      INSERT INTO AnswerChoices (question_id, answer_text, is_correct)
      VALUES (@question_id, @answer_text, @is_correct);
      SELECT SCOPE_IDENTITY() AS id;
    `;
    const request = connection.request();
    request.input("question_id", newAnswerData.question_id);
    request.input("answer_text", newAnswerData.answer_text);
    request.input("is_correct", newAnswerData.is_correct);

    const result = await request.query(sqlQuery);
    connection.close();

    return this.getAnswerById(result.recordset[0].id);
  }

  static async updateAnswer(id, newAnswerData) {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `
      UPDATE AnswerChoices
      SET answer_text = @answer_text, is_correct = @is_correct
      WHERE id = @id
    `;
    const request = connection.request();
    request.input("id", id);
    request.input("answer_text", newAnswerData.answer_text || null);
    request.input("is_correct", newAnswerData.is_correct);

    await request.query(sqlQuery);
    connection.close();

    return this.getAnswerById(id);
  }

  static async deleteAnswer(id) {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `
      DELETE FROM AnswerChoices
      WHERE id = @id
    `;
    const request = connection.request();
    request.input("id", id);
    const result = await request.query(sqlQuery);

    connection.close();

    return result.rowsAffected > 0;
  }
}

module.exports = AnswerChoice;
