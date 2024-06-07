const sql = require("mssql");
const dbConfig = require("../dbConfig");

// to implement editedBy field
// also need to add post title i forgot whoops

class Post {
    constructor(postId, postDateTime, postText, accId) {
        this.postId = postId;
        this.postDateTime = postDateTime;
        this.postText = postText;
        this.accId = accId;
    }

    static async getAllPosts() {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Post`; 

        const request = connection.request();
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset.map(
        (row) => new Post(row.postId, row.postDateTime, row.postText, row.accId)
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
            result.recordset[0].postText,
            result.recordset[0].accId
            )
        : null; 
    }

    static async createPost(newPostData) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `INSERT INTO Post (postDateTime, postText, accId) VALUES (GETDATE(), @postText, @accId); SELECT SCOPE_IDENTITY() AS postId;`; 

        const request = connection.request();
        request.input("postText", newPostData.postText);
        request.input("accId", newPostData.accId);

        const result = await request.query(sqlQuery);

        connection.close();

        return this.getPostById(result.recordset[0].postId);
    }

    static async updatePost(id, newPostData) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `UPDATE Post SET postDateTime = GETDATE(), postText = @postText WHERE postId = @id`; 

        const request = connection.request();
        request.input("id", id);
        request.input("postText", newPostData.postText || null);

        await request.query(sqlQuery);

        connection.close();

        return this.getPostById(id); 
    }

    static async deletePost(id) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `DELETE FROM Post WHERE postId = @id`; 

        const request = connection.request();
        request.input("id", id);
        const result = await request.query(sqlQuery);

        connection.close();

        return result.rowsAffected > 0; 
    }
}

module.exports = Post;