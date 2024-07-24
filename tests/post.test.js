// post.test.js
// Import the Post model and necessary dependencies
const Post = require("../models/post.js");
const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Mock mssql module
jest.mock("mssql");

describe("Post.getAllPosts", () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mock calls before each test
    });

    it("should retrieve all posts from the database", async () => {
        // Define mock posts data
        const mockPosts = [
            { postId: 1, postDateTime: "2024-05-25 16:56:00", postTitle: "Post 1", postText: "Content 1", postEdited: "0", adminEdit: "0", accId: 1 },
            { postId: 2, postDateTime: "2024-05-26 16:56:00", postTitle: "Post 2", postText: "Content 2", postEdited: "0", adminEdit: "0", accId: 2 }
        ];

        // Mock the database connection and query
        const mockConnection = {
            request: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({ recordset: mockPosts }),
            close: jest.fn()
        };
        
        // Mock the SQL connection to resolve with mockConnection
        sql.connect.mockResolvedValue(mockConnection);

        const posts = await Post.getAllPosts(); // Call the method under test

        // Assertions
        expect(sql.connect).toHaveBeenCalledWith(expect.any(Object)); // Check if connect was called with the correct config
        expect(mockConnection.request).toHaveBeenCalled(); // Check if request was called
        expect(mockConnection.query).toHaveBeenCalledWith(`SELECT * FROM Post`); // Check if the correct query was executed
        expect(mockConnection.close).toHaveBeenCalled(); // Check if the connection was closed
        expect(posts).toHaveLength(2); // Check that the returned array has the correct length
        expect(posts).toEqual(expect.arrayContaining([ // Check that the returned posts match the expected structure
            expect.objectContaining({ postId: 1, postTitle: "Post 1" }),
            expect.objectContaining({ postId: 2, postTitle: "Post 2" })
        ]));
    });

    it("should handle errors when retrieving posts", async () => {
        // Simulate an error during the database query
        sql.connect.mockResolvedValue({
            request: jest.fn().mockReturnThis(), // Mock for chaining
            query: jest.fn().mockRejectedValue(new Error("Database error")), // Mock query to reject with an error
            close: jest.fn() // Mock for closing the connection
        });

        // Expect the method to throw an error
        await expect(Post.getAllPosts()).rejects.toThrow("Database error"); // Expect the method to throw an error
    });
});

describe("Post.getPostById", () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mock calls before each test
    });

    it("should retrieve a specific post by ID", async () => {
        // Mock data for a post
        const mockPostId = 1;
        const mockPostData = {
            postId: mockPostId,
            postDateTime: "2024-05-25 16:56:00",
            postTitle: "Post Title",
            postText: "Post Content",
            postEdited: "0",
            adminEdit: "0",
            accId: 1
        };

        // Mock the database connection and query
        const mockConnection = {
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({ recordset: [mockPostData] }),
            close: jest.fn()
        };

        sql.connect.mockResolvedValue(mockConnection); // Mock the connection

        const post = await Post.getPostById(mockPostId); // Call the method under test

        // Assertions
        expect(sql.connect).toHaveBeenCalledWith(dbConfig); // Check if connect was called with the correct config
        expect(mockConnection.request).toHaveBeenCalled(); // Check if request was called
        expect(mockConnection.input).toHaveBeenCalledWith("id", mockPostId); // Check if input was called with the correct parameters
        expect(mockConnection.query).toHaveBeenCalledWith(`SELECT * FROM Post WHERE postId = @id`); // Check if the correct query was executed
        expect(mockConnection.close).toHaveBeenCalled(); // Check if the connection was closed
        expect(post).toBeInstanceOf(Post); // Check that the returned object is an instance of Post
        expect(post).toEqual(expect.objectContaining({ postId: mockPostId, postTitle: "Post Title" })); // Check the properties of the returned post
    });

    it("should return null if post is not found", async () => {
        const mockPostId = 999;

        // Mock the database connection and query to return an empty recordset
        const mockConnection = {
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({ recordset: [] }),
            close: jest.fn()
        };

        sql.connect.mockResolvedValue(mockConnection); // Mock the connection

        const post = await Post.getPostById(mockPostId); // Call the method under test

        // Assertions
        expect(sql.connect).toHaveBeenCalledWith(dbConfig); // Check if connect was called with the correct config
        expect(mockConnection.request).toHaveBeenCalled(); // Check if request was called
        expect(mockConnection.input).toHaveBeenCalledWith("id", mockPostId); // Check if input was called with the correct parameters
        expect(mockConnection.query).toHaveBeenCalledWith(`SELECT * FROM Post WHERE postId = @id`); // Check if the correct query was executed
        expect(mockConnection.close).toHaveBeenCalled(); // Check if the connection was closed
        expect(post).toBeNull(); // Check that the returned post is null
    });
});

describe("Post.getReplyCount", () => {
    let mockConnection;

    beforeEach(() => {
        jest.clearAllMocks(); // Clear mock calls before each test
        mockConnection = {
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            query: jest.fn(),
            close: jest.fn(),
        };
        sql.connect.mockResolvedValue(mockConnection); // Mock the connection
    });

    it("should return the correct reply count for a given post ID", async () => {
        const postId = 1;
        const expectedReplyCount = 5;

        // Mock the query result
        mockConnection.query.mockResolvedValue({
            recordset: [{ replyCount: expectedReplyCount }],
        });

        const replyCount = await Post.getReplyCount(postId); // Call the method under test

        // Assertions
        expect(sql.connect).toHaveBeenCalledWith(expect.any(Object)); // Check if connect was called
        expect(mockConnection.request).toHaveBeenCalled(); // Check if request was called
        expect(mockConnection.input).toHaveBeenCalledWith("id", postId); // Check if input was set correctly
        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String)); // Check if the correct query was executed
        expect(mockConnection.close).toHaveBeenCalled(); // Check if the connection was closed
        expect(replyCount).toBe(expectedReplyCount); // Check that the returned reply count is correct
    });

    it("should throw an error if the query fails", async () => {
        const postId = 1;
        const errorMessage = "Database error";

        // Simulate an error during the database query
        mockConnection.query.mockRejectedValue(new Error(errorMessage));

        await expect(Post.getReplyCount(postId)).rejects.toThrow(errorMessage); // Expect the method to throw an error
    });
});

describe("Post.createPost", () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mock calls before each test
    });

    it("should create a new post and return the created post", async () => {
        const newPostData = {
            postTitle: "New Post Title",
            postText: "New Post Content",
            accId: 1
        };
        const mockPostId = 1;

        // Mock the database connection and query
        const mockConnection = {
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({ recordset: [{ postId: mockPostId }] }),
            close: jest.fn()
        };

        sql.connect.mockResolvedValue(mockConnection); // Mock the connection

        // Mock the getPostById method to return the created post
        jest.spyOn(Post, "getPostById").mockResolvedValue({
            postId: mockPostId,
            postDateTime: "2024-05-25 16:56:00",
            postTitle: newPostData.postTitle,
            postText: newPostData.postText,
            postEdited: "0",
            adminEdit: "0",
            accId: newPostData.accId
        });

        const createdPost = await Post.createPost(newPostData); // Call the method under test

        // Assertions
        expect(sql.connect).toHaveBeenCalledWith(dbConfig); // Check if connect was called with the correct config
        expect(mockConnection.request).toHaveBeenCalled(); // Check if request was called
        expect(mockConnection.input).toHaveBeenCalledWith("postTitle", newPostData.postTitle); // Check if input was called with postTitle
        expect(mockConnection.input).toHaveBeenCalledWith("postText", newPostData.postText); // Check if input was called with postText
        expect(mockConnection.input).toHaveBeenCalledWith("accId", newPostData.accId); // Check if input was called with accId
        expect(mockConnection.query).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO Post")); // Check if the correct query was executed
        expect(mockConnection.close).toHaveBeenCalled(); // Check if the connection was closed
        expect(createdPost).toEqual(expect.objectContaining({ postId: mockPostId, postTitle: newPostData.postTitle })); // Check the properties of the created post
    });

    it("should handle errors when creating a post", async () => {
        const newPostData = {
            postTitle: "New Post Title",
            postText: "New Post Content",
            accId: 1
        };

        // Mock the database connection and query to throw an error
        sql.connect.mockResolvedValue({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockRejectedValue(new Error("Database error")),
            close: jest.fn()
        });

        await expect(Post.createPost(newPostData)).rejects.toThrow("Database error"); // Expect the method to throw an error
    });
});

describe("Post.updatePost", () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mock calls before each test
    });

    it("should update an existing post and return the updated post", async () => {
        const mockPostId = 1;
        const newPostData = {
            postTitle: "Updated Post Title",
            postText: "Updated Post Content",
            adminEdit: 1
        };

        // Mock the database connection and query
        const mockConnection = {
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({}),
            close: jest.fn()
        };

        sql.connect.mockResolvedValue(mockConnection); // Mock the connection

        // Mock the getPostById method to return the updated post
        Post.getPostById.mockResolvedValue({
            postId: mockPostId,
            postDateTime: "2024-05-25 16:56:00",
            postTitle: newPostData.postTitle,
            postText: newPostData.postText,
            postEdited: "1",
            adminEdit: newPostData.adminEdit,
            accId: 1
        });

        const updatedPost = await Post.updatePost(mockPostId, newPostData); // Call the method under test

        // Assertions
        expect(sql.connect).toHaveBeenCalledWith(dbConfig); // Check if connect was called with the correct config
        expect(mockConnection.request).toHaveBeenCalled(); // Check if request was called
        expect(mockConnection.input).toHaveBeenCalledWith("id", mockPostId); // Check if input was called with postId
        expect(mockConnection.input).toHaveBeenCalledWith("postTitle", newPostData.postTitle); // Check if input was called with postTitle
        expect(mockConnection.input).toHaveBeenCalledWith("postText", newPostData.postText); // Check if input was called with postText
        expect(mockConnection.input).toHaveBeenCalledWith("adminEdit", newPostData.adminEdit); // Check if input was called with adminEdit
        expect(mockConnection.query).toHaveBeenCalledWith(expect.stringContaining("UPDATE Post")); // Check if the correct query was executed
        expect(mockConnection.close).toHaveBeenCalled(); // Check if the connection was closed
        expect(updatedPost).toEqual(expect.objectContaining({ postId: mockPostId, postTitle: newPostData.postTitle })); // Check the properties of the updated post
    });

    it("should handle errors when updating a post", async () => {
        const mockPostId = 1;
        const newPostData = {
            postTitle: "Updated Post Title",
            postText: "Updated Post Content",
            adminEdit: 1
        };

        // Mock the database connection and query to throw an error
        sql.connect.mockResolvedValue({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockRejectedValue(new Error("Database error")),
            close: jest.fn()
        });

        await expect(Post.updatePost(mockPostId, newPostData)).rejects.toThrow("Database error"); // Expect the method to throw an error
    });
});

describe("Post.deletePost", () => {
    let mockConnection;
    let mockTransaction;

    beforeEach(() => {
        jest.clearAllMocks(); // Clear mock calls before each test

        // Create a mock connection object
        mockConnection = {
            request: jest.fn().mockReturnThis(),
            query: jest.fn(),
            close: jest.fn(),
        };

        // Create a mock transaction object
        mockTransaction = {
            begin: jest.fn().mockResolvedValue(),
            commit: jest.fn().mockResolvedValue(),
            rollback: jest.fn().mockResolvedValue(), // Still mock rollback for completeness
            request: jest.fn().mockReturnThis(),
        };

        // Mock the request method of the transaction to return a mock that has input and query methods
        mockTransaction.request.mockReturnValue({
            input: jest.fn().mockReturnThis(),
            query: jest.fn(),
        });

        sql.connect.mockResolvedValue(mockConnection); // Mock the connection
        sql.Transaction.mockImplementation(() => mockTransaction); // Mock the Transaction
    });

    it("should delete a post and its associated replies", async () => {
        const postId = 1;

        // Mock the query results
        mockTransaction.request().query.mockResolvedValueOnce({ rowsAffected: [1] }); // Simulate reply deletion
        mockTransaction.request().query.mockResolvedValueOnce({ rowsAffected: [1] }); // Simulate post deletion

        const result = await Post.deletePost(postId); // Call the method under test

        // Assertions
        expect(sql.connect).toHaveBeenCalledWith(expect.any(Object)); // Check if connect was called
        expect(mockTransaction.begin).toHaveBeenCalled(); // Check if transaction began
        expect(mockTransaction.request).toHaveBeenCalled(); // Check if transaction request was called
        expect(mockTransaction.request().input).toHaveBeenCalledWith("id", postId); // Check if input was set correctly
        expect(mockTransaction.request().query).toHaveBeenCalledTimes(2); // Check if two queries were executed
        expect(mockTransaction.commit).toHaveBeenCalled(); // Check if transaction was committed
        expect(mockConnection.close).toHaveBeenCalled(); // Check if the connection was closed
        expect(result).toBe(true); // Check that the result indicates success
    });

    it("should return false if the post deletion fails", async () => {
        const postId = 1;

        // Simulate a failure in deleting replies
        mockTransaction.request().query.mockResolvedValueOnce({ rowsAffected: [1] }); // Simulate successful reply deletion
        mockTransaction.request().query.mockRejectedValueOnce(new Error("Database error")); // Simulate post deletion failure

        const result = await Post.deletePost(postId); // Call the method under test

        // Assertions
        expect(result).toBe(false); // Check that the result indicates failure
        expect(mockTransaction.rollback).not.toHaveBeenCalled(); // Ensure rollback is NOT called
        expect(mockConnection.close).toHaveBeenCalled(); // Check if the connection was closed
    });
});