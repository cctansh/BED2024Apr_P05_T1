// Import mssql, dbConfig to post.js
const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Post {
    // Constructor to initialize a Post object
    constructor(postId, postDateTime, postTitle, postText, postEdited, adminEdit, accId) {
        this.postId = postId;                  // Unique identifier for the post
        this.postDateTime = postDateTime;      // Date and time when the post was created
        this.postTitle = postTitle;            // Title of the post
        this.postText = postText;              // Content/text of the post
        this.postEdited = postEdited;          // Indicates if the post has been edited (0 or 1)
        this.adminEdit = adminEdit;            // Indicates if the post was edited by an admin (0 or 1)
        this.accId = accId;                    // Account ID of the user who created the post
    }

    // Retrieves all posts from DB
    static async getAllPosts() {
        const connection = await sql.connect(dbConfig); // Establish DB connection

        const sqlQuery = `SELECT * FROM Post`; // SQL query to select all posts

        const request = connection.request(); // Create new request
        const result = await request.query(sqlQuery); // Execute query and retrieve posts

        connection.close(); // Close DB connection

        // Maps the result set to an array of Post objects and returns it
        return result.recordset.map(
        (row) => new Post(row.postId, row.postDateTime, row.postTitle, row.postText, row.postEdited, row.adminEdit, row.accId)
        ); 
    }

    // Retrieves a specific post by its ID from DB
    static async getPostById(id) {
        const connection = await sql.connect(dbConfig); // Establish DB connection

        const sqlQuery = `SELECT * FROM Post WHERE postId = @id`; // SQL query to select a post by ID

        const request = connection.request(); // Create new request
        request.input("id", id); // Add parameter for post ID
        const result = await request.query(sqlQuery); // Execute query and retrieve the post

        connection.close(); // Close DB connection

        // If found Post object, return it
        // If not found, return null
        return result.recordset[0]
        ? new Post(
            result.recordset[0].postId,
            result.recordset[0].postDateTime,
            result.recordset[0].postTitle,
            result.recordset[0].postText,
            result.recordset[0].postEdited,
            result.recordset[0].adminEdit,
            result.recordset[0].accId
            )
        : null; 
    }

    // Creates new post in DB with provided data
    static async createPost(newPostData) {
        const connection = await sql.connect(dbConfig); // Establish DB connection

        // SQL query to insert new post and retrieve its ID
        const sqlQuery = `INSERT INTO Post (postDateTime, postTitle, postText, postEdited, adminEdit, accId) VALUES (GETDATE(), @postTitle, @postText, 0, 0, @accId); SELECT SCOPE_IDENTITY() AS postId;`; 

        const request = connection.request(); // Create new request
        request.input("postTitle", newPostData.postTitle); // Add parameter for postTitle
        request.input("postText", newPostData.postText); // Add parameter for postText
        request.input("accId", newPostData.accId); // Add parameter for accId

        const result = await request.query(sqlQuery); // Execute query and retrieve the new post

        connection.close(); // Close DB connection

        return this.getPostById(result.recordset[0].postId); // Retrieve newly created post using its ID
    }

    // Updates existing post in DB with new data
    static async updatePost(id, newPostData) {
        const connection = await sql.connect(dbConfig); // Establish DB connection

        // SQL query to update post
        const sqlQuery = `UPDATE Post SET postDateTime = GETDATE(), postTitle = @postTitle, postText = @postText, postEdited = 1, adminEdit = @adminEdit WHERE postId = @id`; 

        const request = connection.request(); // Create new request
        request.input("id", id); // Add parameter for postId
        request.input("postTitle", newPostData.postTitle || null); // Add parameter for postTitle
        request.input("postText", newPostData.postText || null); // Add parameter for postText
        request.input("adminEdit", newPostData.adminEdit); // Add parameter for adminEdit

        await request.query(sqlQuery); // Execute query

        connection.close(); // Close DB connection

        return this.getPostById(id); // Retrieve and return updated post using its ID
    }

    // Delete post and its associated replies from DB
    static async deletePost(id) {
        const connection = await sql.connect(dbConfig); // Establish DB connection
    
        try {
            const transaction = new sql.Transaction(connection); // Start new transaction
            await transaction.begin(); // Begin transaction
    
            // Delete replies first
            // SQL query to delete replies associated with the post
            const deleteRepliesQuery = `
                DELETE FROM Reply
                WHERE replyTo = @id;
            `;
            await transaction.request().input("id", id).query(deleteRepliesQuery); // Execute query to delete replies
    
            // Then delete the post
            // SQL query to delete post itself
            const deletePostQuery = `
                DELETE FROM Post
                WHERE postId = @id;
            `;
            const result = await transaction.request().input("id", id).query(deletePostQuery); // Execute query to delete post
    
            await transaction.commit(); // Commit the transaction
            connection.close(); // Close DB connection
    
            return result.rowsAffected[0] > 0; // Return true if at least one row was affected (post deleted)
        } catch (err) {
            console.error("Error deleting post:", err); // Log any errors that occur
            connection.close(); // Close DB connection
            return false; // Return false to indicate deletion failure
        }
    }

    // Retrieve number of replies associated with a post
    static async getReplyCount(id) {
        try {
            const connection = await sql.connect(dbConfig); // Establish DB connection

            // SQL query to count replies for a specific post
            const sqlQuery = `
                            SELECT COUNT(r.replyId) AS replyCount
                            FROM Post p
                            LEFT JOIN Reply r ON p.postId = r.replyTo
                            WHERE p.postId = @id;
                            `
            
            const request = connection.request(); // Create new request
            request.input("id", id); // Add parameter for postId
            const result = await request.query(sqlQuery); // Execute query and retrieve result

            connection.close(); // Close DB connection

            // Extract/retrieve the reply count from the result, then return it
            const replyCount = result.recordset[0].replyCount;
            return replyCount;
        } catch (error) {
            console.error("Error fetching reply count:", error); // Log any errors that occur
            throw error; // Throw the error to be handled
        }
    }
}

// Export Post class for use in other files/modules
module.exports = Post;