const sql = require("mssql");
const dbConfig = require("../dbConfig");

// to implement editedBy field

class Post {
    constructor(postId, postAuthor, postDateTime, postText) {
        this.postId = postId;
        this.postAuthor = postAuthor;
        this.postDateTime = postDateTime;
        this.postText = postText;
    }

    static async getAllPosts() {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Post`; // Replace with your actual table name

        const request = connection.request();
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset.map(
        (row) => new Post(row.postId, row.postAuthor, row.postDateTime, row.postText)
        ); // Convert rows to Post objects
    }

    static async getPostById(id) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Post WHERE postId = @id`; // Parameterized query

        const request = connection.request();
        request.input("id", id);
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset[0]
        ? new Post(
            result.recordset[0].postId,
            result.recordset[0].postAuthor,
            result.recordset[0].postDateTime,
            result.recordset[0].postText,
            )
        : null; // Handle post not found
    }

    static async createPost(newPostData) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `INSERT INTO Post (postAuthor, postDateTime, postText) VALUES (@postAuthor, GETDATE(), @postText); SELECT SCOPE_IDENTITY() AS postId;`; // Retrieve ID of inserted record

        const request = connection.request();
        request.input("postAuthor", newPostData.postAuthor);
        request.input("postText", newPostData.postText);

        const result = await request.query(sqlQuery);

        connection.close();

        // Retrieve the newly created book using its ID
        return this.getPostById(result.recordset[0].postId);
    }

    static async updatePost(id, newPostData) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `UPDATE Post SET postDateTime = GETDATE(), postText = @postText WHERE postId = @id`; // Parameterized query

        const request = connection.request();
        request.input("id", id);
        request.input("postText", newPostData.postText || null);

        await request.query(sqlQuery);

        connection.close();

        return this.getPostById(id); // returning the updated post data
    }

    static async deletePost(id) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `DELETE FROM Post WHERE postId = @id`; // Parameterized query

        const request = connection.request();
        request.input("id", id);
        const result = await request.query(sqlQuery);

        connection.close();

        return result.rowsAffected > 0; // Indicate success based on affected rows
    }
}

module.exports = Post;