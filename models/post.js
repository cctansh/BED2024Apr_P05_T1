const sql = require("mssql");
const dbConfig = require("../dbConfig");

// to implement editedBy field
// also need to add post title i forgot whoops

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


/*
dynamic method for updating
can update both text + author, or only text or author
might be useful for another function in the future

static async updatePost(id, newPostData) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);

        let sqlQuery = 'UPDATE Post SET ';
        const params = [];

        if (newPostData.postAuthor) {
            sqlQuery += 'postAuthor = @postAuthor, ';
            params.push({ name: 'postAuthor', type: sql.VarChar, value: newPostData.postAuthor });
        }

        // Always update postDateTime to current datetime
        sqlQuery += 'postDateTime = GETDATE(), ';

        if (newPostData.postText) {
            sqlQuery += 'postText = @postText, ';
            params.push({ name: 'postText', type: sql.VarChar, value: newPostData.postText });
        }

        // Remove the last comma and add the WHERE clause
        sqlQuery = sqlQuery.slice(0, -2) + ' WHERE postId = @id';
        params.push({ name: 'id', type: sql.Int, value: id });

        const request = connection.request();
        params.forEach(param => {
            request.input(param.name, param.type, param.value);
        });

        await request.query(sqlQuery);

        return await this.getPostById(id); // Returning the updated post data
    } catch (err) {
        console.error("SQL error", err);
        throw err;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}
*/