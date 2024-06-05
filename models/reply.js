const sql = require("mssql");
const dbConfig = require("../dbConfig");
const Post = require("./post");

class Reply {
    constructor(replyId, replyAuthor, replyDateTime, replyText, replyTo) {
        this.replyId = replyId;
        this.replyAuthor = replyAuthor;
        this.replyDateTime = replyDateTime;
        this.replyText = replyText;
        this.replyTo = replyTo;
    }

    static async getAllReplies() {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Reply`; // Replace with your actual table name

        const request = connection.request();
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset.map(
        (row) => new Reply(row.replyId, row.replyAuthor, row.replyDateTime, row.replyText, row.replyTo)
        ); // Convert rows to Reply objects
    }

    static async getReplyById(id) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Reply WHERE replyId = @id`; // Parameterized query

        const request = connection.request();
        request.input("id", id);
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset[0]
        ? new Reply(
            result.recordset[0].replyId,
            result.recordset[0].replyAuthor,
            result.recordset[0].replyDateTime,
            result.recordset[0].replyText,
            result.recordset[0].replyTo
            )
        : null; // Handle reply not found
    }

    static async createReply(newReplyData) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `INSERT INTO Reply (replyAuthor, replyDateTime, replyText, replyTo) VALUES (@replyAuthor, GETDATE(), @replyText, @replyTo); SELECT SCOPE_IDENTITY() AS replyId;`; // Retrieve ID of inserted record

        const request = connection.request();
        request.input("replyAuthor", newReplyData.replyAuthor);
        request.input("replyText", newReplyData.replyText);
        request.input("replyTo", newReplyData.replyTo);

        const result = await request.query(sqlQuery);

        connection.close();

        // Retrieve the newly created book using its ID
        return this.getReplyById(result.recordset[0].replyId);
    }

    static async updateReply(id, newReplyData) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `UPDATE Reply SET replyDateTime = GETDATE(), replyText = @replyText WHERE replyId = @id`; // Parameterized query

        const request = connection.request();
        request.input("id", id);
        request.input("replyText", newReplyData.replyText || null);

        await request.query(sqlQuery);

        connection.close();

        return this.getReplyById(id); // returning the updated reply data
    }

    static async deleteReply(id) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `DELETE FROM Reply WHERE replyId = @id`; // Parameterized query

        const request = connection.request();
        request.input("id", id);
        const result = await request.query(sqlQuery);

        connection.close();

        return result.rowsAffected > 0; // Indicate success based on affected rows
    }

    static async searchRepliesByAuthor(searchTerm) {
        const connection = await sql.connect(dbConfig);
    
        try {
          const query = `
            SELECT *
            FROM Reply
            WHERE replyAuthor LIKE '%${searchTerm}%'
          `;
    
          const result = await connection.request().query(query);
          return result.recordset;
        } catch (error) {
          throw new Error("Error searching replies"); // Or handle error differently
        } finally {
          await connection.close(); // Close connection even on errors
        }
    }

    static async searchRepliesByText(searchTerm) {
        const connection = await sql.connect(dbConfig);
    
        try {
          const query = `
            SELECT *
            FROM Reply
            WHERE replyText LIKE '%${searchTerm}%'
          `;
    
          const result = await connection.request().query(query);
          return result.recordset;
        } catch (error) {
          throw new Error("Error searching replies"); // Or handle error differently
        } finally {
          await connection.close(); // Close connection even on errors
        }
    }

    static async getRepliedPost(id) {
        const connection = await sql.connect(dbConfig);

        try {
            const sqlQuery = `
            SELECT *
            FROM Reply r
            LEFT JOIN Post p ON r.replyTo = p.postId
            WHERE r.replyId = @id;
          `;
  
          const request = connection.request();
          request.input("id", id);
          const result = await request.query(sqlQuery);

          return result.recordset[0]
        ? new Post(
            result.recordset[0].postId,
            result.recordset[0].postAuthor,
            result.recordset[0].postDateTime,
            result.recordset[0].postText
            )
        : null; // Handle post not found
        }
         catch (error) {
            throw new Error("Error fetching replied post");

        } finally {
            await connection.close();
        }
    }
}

module.exports = Reply;