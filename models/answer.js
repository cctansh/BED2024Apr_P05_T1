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

  static async getAnswersByQuestion(questionId) {
    const connection = await sql.connect(dbConfig);

    try {
      const sqlQuery = `SELECT * FROM AnswerChoices WHERE question_id = @questionId`;
      const request = connection.request();
      request.input("questionId", sql.Int, questionId);
      const result = await request.query(sqlQuery);
      return result.recordset.map(row => new AnswerChoice(row.id, row.question_id, row.answer_text, row.is_correct, row.explanation));
    } catch (error) {
      throw new Error("Error fetching answers");
    } finally {
      connection.close();
    }
  }

  static async getAnswerById(answerId) {
    const connection = await sql.connect(dbConfig);

    try {
      const sqlQuery = `SELECT * FROM AnswerChoices WHERE id = @answerId`;
      const request = connection.request();
      request.input("answerId", sql.Int, answerId);
      const result = await request.query(sqlQuery);
      if (!result.recordset.length) return null;
      const answerData = result.recordset[0];
      return new AnswerChoice(answerData.id, answerData.question_id, answerData.answer_text, answerData.is_correct, answerData.explanation);
    } catch (error) {
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
      request.input("question_id", sql.Int, newAnswerData.question_id);
      request.input("answer_text", sql.NVarChar, newAnswerData.answer_text);
      request.input("is_correct", sql.Bit, newAnswerData.is_correct);
      request.input("explanation", sql.NVarChar, newAnswerData.explanation);
      const result = await request.query(sqlQuery);
      return await this.getAnswerById(result.recordset[0].id);
    } catch (error) {
      throw error;
    } finally {
      connection.close();
    }
  }

  static async updateAnswer(answerId, updatedAnswerData) {
    const connection = await sql.connect(dbConfig);

    try {
      const sqlQuery = `
        UPDATE AnswerChoices
        SET answer_text = @answer_text, is_correct = @is_correct, explanation = @explanation
        WHERE id = @id
      `;
      const request = connection.request();
      request.input("id", sql.Int, answerId);
      request.input("answer_text", sql.NVarChar, updatedAnswerData.answer_text);
      request.input("is_correct", sql.Bit, updatedAnswerData.is_correct);
      request.input("explanation", sql.NVarChar, updatedAnswerData.explanation);
      await request.query(sqlQuery);
      return await this.getAnswerById(answerId);
    } catch (error) {
      throw error;
    } finally {
      connection.close();
    }
  }

  static async deleteAnswer(answerId) {
    const connection = await sql.connect(dbConfig);

    try {
      const sqlQuery = `DELETE FROM AnswerChoices WHERE id = @id`;
      const request = connection.request();
      request.input("id", sql.Int, answerId);
      const result = await request.query(sqlQuery);
      return result.rowsAffected[0] > 0;
    } catch (error) {
      throw error;
    } finally {
      connection.close();
    }
  }
}

module.exports = AnswerChoice;
