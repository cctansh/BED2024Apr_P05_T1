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

  static async getAnswersByQuestion(id) {
    const connection = await sql.connect(dbConfig);

    try {
      const sqlQuery = `SELECT * FROM AnswerChoices WHERE question_id = @id`;

      const request = connection.request();
      request.input("id", id);
      const result = await request.query(sqlQuery);

      connection.close();

      return result.recordset.map(
        (row) => new AnswerChoice(row.id, row.question_id, row.answer_text, row.is_correct, row.explanation)
      );
    } catch (error) {
      throw new Error("Error fetching answers");
    } finally {
      await connection.close();
    }
  }

  static async getAnswerById(answerId) {
    const connection = await sql.connect(dbConfig);

    try {
      const sqlQuery = `
        SELECT *
        FROM AnswerChoices
        WHERE id = @answerId
      `;
      const request = connection.request();
      request.input("answerId", answerId);
      const result = await request.query(sqlQuery);

      if (!result.recordset.length) return null;

      const answerData = result.recordset[0];
      return new AnswerChoice(
        answerData.id,
        answerData.question_id,
        answerData.answer_text,
        answerData.is_correct,
        answerData.explanation
      );
      
    } catch (error) {
      console.error(`Error fetching answer with ID ${answerId}:`, error);
      throw error;
    } finally {
      connection.close();
    }
  }

  static async createAnswer(newAnswerData) {
    const connection = await sql.connect(dbConfig);

    try {
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

      const result = await request.query(sqlQuery);

      return this.getAnswerById(result.recordset[0].id);
    } catch (error) {
      console.error("Error creating answer:", error);
      throw error;
    } finally {
      connection.close();
    }
  }
  

  static async updateAnswer(id, newAnswerData) {
    const connection = await sql.connect(dbConfig);

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


    await request.query(sqlQuery);

    return this.getAnswerById(id);
  }

  static async deleteAnswer(id) {
    const connection = await sql.connect(dbConfig);

    try {
      const sqlQuery = `
        DELETE FROM AnswerChoices
        WHERE id = @id
      `;
      const request = connection.request();
      request.input("id", id);
      const result = await request.query(sqlQuery);

      return result.rowsAffected > 0;
    } catch (error) {
      console.error(`Error deleting answer with ID ${id}:`, error);
      throw error;
    } finally {
      connection.close();
    }
  }
}

module.exports = AnswerChoice;
