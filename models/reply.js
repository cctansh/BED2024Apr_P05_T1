const sql = require("mssql");
const dbConfig = require("../dbConfig");
const Post = require("./post");

class Reply {
  constructor(replyId, replyDateTime, replyText, replyEdited, adminEdit, accId, replyTo) {
    this.replyId = replyId;
    this.replyDateTime = replyDateTime;
    this.replyText = replyText;
    this.replyEdited = replyEdited;
    this.adminEdit = adminEdit;
    this.accId = accId;
    this.replyTo = replyTo;
  }

  static async getAllReplies() {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `SELECT * FROM Reply`;

    const request = connection.request();
    const result = await request.query(sqlQuery);

    connection.close();

    return result.recordset.map(
      (row) => new Reply(row.replyId, row.replyDateTime, row.replyText, row.replyEdited, row.adminEdit, row.accId, row.replyTo)
    );
  }

  static async getReplyById(id) {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `SELECT * FROM Reply WHERE replyId = @id`;

    const request = connection.request();
    request.input("id", id);
    const result = await request.query(sqlQuery);

    connection.close();

    return result.recordset[0]
      ? new Reply(
        result.recordset[0].replyId,
        result.recordset[0].replyDateTime,
        result.recordset[0].replyText,
        result.recordset[0].replyEdited,
        result.recordset[0].adminEdit,
        result.recordset[0].accId,
        result.recordset[0].replyTo
      )
      : null;
  }

  static async createReply(newReplyData) {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `INSERT INTO Reply (replyDateTime, replyText, replyEdited, adminEdit, accId, replyTo) VALUES (GETDATE(), @replyText, 0, 0, @accId, @replyTo); SELECT SCOPE_IDENTITY() AS replyId;`;

    const request = connection.request();
    request.input("replyText", newReplyData.replyText);
    request.input("replyTo", newReplyData.replyTo);
    request.input("accId", newReplyData.accId);

    const result = await request.query(sqlQuery);

    connection.close();

    return this.getReplyById(result.recordset[0].replyId);
  }

  static async updateReply(id, newReplyData) {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `UPDATE Reply SET replyDateTime = GETDATE(), replyText = @replyText, replyEdited = 1, adminEdit = @adminEdit WHERE replyId = @id`;

    const request = connection.request();
    request.input("id", id);
    request.input("replyText", newReplyData.replyText || null);
    request.input("adminEdit", newReplyData.adminEdit);

    await request.query(sqlQuery);

    connection.close();

    return this.getReplyById(id);
  }

  static async deleteReply(id) {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `DELETE FROM Reply WHERE replyId = @id`;

    const request = connection.request();
    request.input("id", id);
    const result = await request.query(sqlQuery);

    connection.close();

    return result.rowsAffected > 0;
  }

  static async getRepliedPost(id) {
    const connection = await sql.connect(dbConfig);

    try {
      const sqlQuery = `SELECT p.postId, p.postDateTime, p.postTitle, p.postText, p.postEdited, p.adminEdit, p.accId FROM Reply r LEFT JOIN Post p ON r.replyTo = p.postId WHERE r.replyId = @id;`;

      const request = connection.request();
      request.input("id", id);
      const result = await request.query(sqlQuery);

      return result.recordset[0]
        ? new Post(
          result.recordset[0].postId,
          result.recordset[0].postDateTime,
          result.recordset[0].postTitle,
          result.recordset[0].postText,
          result.recordset[0].postEdited,
          result.recordset[0].adminEdit,
          result.recordset[0].accId,
        )
        : null;
    }
    catch (error) {
      throw new Error("Error fetching replied post");

    } finally {
      await connection.close();
    }
  }

  static async getRepliesByPost(id) {
    const connection = await sql.connect(dbConfig);

    try {
      const sqlQuery = `SELECT * FROM Reply WHERE replyTo = @id`;

      const request = connection.request();
      request.input("id", id);
      const result = await request.query(sqlQuery);

      connection.close();

      return result.recordset.map(
        (row) => new Reply(row.replyId, row.replyDateTime, row.replyText, row.replyEdited, row.adminEdit, row.accId, row.replyTo)
      );
    } catch (error) {
      throw new Error("Error fetching replied post");
    } finally {
      await connection.close();
    }
  }
}

module.exports = Reply;