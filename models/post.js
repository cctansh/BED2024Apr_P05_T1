const sql = require("mssql");
const dbConfig = require("../dbConfig");

// added postTitle, postEdited field
class Post {
    constructor(postId, postDateTime, postTitle, postText, postEdited, accId) {
        this.postId = postId;
        this.postDateTime = postDateTime;
        this.postTitle = postTitle;
        this.postText = postText;
        this.postEdited = postEdited;
        this.accId = accId;
    }

    static async getAllPosts() {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Post`; 

        const request = connection.request();
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset.map(
        (row) => new Post(row.postId, row.postDateTime, row.postTitle, row.postText, row.postEdited, row.accId)
        ); 
    }

    static async getPostById(id) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Post WHERE postId = @id`; 

        const request = connection.request();
        request.input("id", id);
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset[0]
        ? new Post(
            result.recordset[0].postId,
            result.recordset[0].postDateTime,
            result.recordset[0].postTitle,
            result.recordset[0].postText,
            result.recordset[0].postEdited,
            result.recordset[0].accId
            )
        : null; 
    }

    static async createPost(newPostData) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `INSERT INTO Post (postDateTime, postTitle, postText, postEdited, accId) VALUES (GETDATE(), @postTitle, @postText, 0, @accId); SELECT SCOPE_IDENTITY() AS postId;`; 

        const request = connection.request();
        request.input("postTitle", newPostData.postTitle);
        request.input("postText", newPostData.postText);
        request.input("accId", newPostData.accId);

        const result = await request.query(sqlQuery);

        connection.close();

        return this.getPostById(result.recordset[0].postId);
    }

    static async updatePost(id, newPostData) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `UPDATE Post SET postDateTime = GETDATE(), postTitle = @postTitle, postText = @postText, postEdited = 1 WHERE postId = @id`; 

        const request = connection.request();
        request.input("id", id);
        request.input("postTitle", newPostData.postTitle || null);
        request.input("postText", newPostData.postText || null);

        await request.query(sqlQuery);

        connection.close();

        return this.getPostById(id); 
    }

    static async deletePost(id) {
        const connection = await sql.connect(dbConfig);
    
        try {
            const transaction = new sql.Transaction(connection);
            await transaction.begin();
    
            // Delete replies first
            const deleteRepliesQuery = `
                DELETE FROM Reply
                WHERE replyTo = @id;
            `;
            await transaction.request().input("id", id).query(deleteRepliesQuery);
    
            // Then delete the post
            const deletePostQuery = `
                DELETE FROM Post
                WHERE postId = @id;
            `;
            const result = await transaction.request().input("id", id).query(deletePostQuery);
    
            await transaction.commit();
            connection.close();
    
            return result.rowsAffected[0] > 0; // Return true if at least one row was affected
        } catch (err) {
            console.error("Error deleting post:", err);
            connection.close();
            return false;
        }
    }
}

module.exports = Post;