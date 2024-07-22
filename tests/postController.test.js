// postController.test.js
const postController = require("../controllers/postController.js");
const Post = require("../models/post.js");

// Mock the Post model
jest.mock("../models/Post"); // Replace with the actual path to your Post model

// Retrieve all posts
describe("postController.getAllBooks", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mock calls before each test
  });

  it("should fetch all posts and return a JSON response", async () => {
    const mockPosts = [
      { postId: 1, postDateTime: "2024-05-25 16:56:00", postTitle: "Welcome to Post 1", postText: "Post 1 contents", postEdited: "0", adminEdit: "0", accId: "1" },
      { postId: 1, postDateTime: "2024-05-26 17:56:00", postTitle: "Welcome to Post 2", postText: "Post 2 contents", postEdited: "0", adminEdit: "0", accId: "1" },
      { postId: 1, postDateTime: "2024-05-27 18:56:00", postTitle: "Welcome to Post 3", postText: "Post 3 contents", postEdited: "0", adminEdit: "0", accId: "2" },
      { postId: 1, postDateTime: "2024-05-28 19:56:00", postTitle: "Welcome to Post 4", postText: "Post 4 contents", postEdited: "0", adminEdit: "0", accId: "3" },
      { postId: 1, postDateTime: "2024-05-29 20:56:00", postTitle: "Welcome to Post 5", postText: "Post 5 contents", postEdited: "0", adminEdit: "0", accId: "4" }
    ];

    // Mock the Post.getAllPosts function to return the mock data
    Post.getAllPosts.mockResolvedValue(mockPosts);

    const req = {};
    const res = {
      json: jest.fn(), // Mock the res.json function
    };

    await postController.getAllPosts(req, res);

    expect(Post.getAllPosts).toHaveBeenCalledTimes(1); // Check if getAllPosts was called
    expect(res.json).toHaveBeenCalledWith(mockPosts); // Check the response body
  });


  it("should handle errors and return a 500 status with error message", async () => {
    const errorMessage = "Database error";
    Post.getAllPosts.mockRejectedValue(new Error(errorMessage)); // Simulate an error

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await postController.getAllPosts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("Error retrieving posts");
  }); 
});

// Retrieve specific post by its postId
describe("postController.getPostById", () => {
    beforeEach(() => {
      jest.clearAllMocks(); // Clear mock calls before each test
    });
  
    it("should fetch a specific post and return a JSON response", async () => {
        const mockPostId = 1;
        const mockPost = { 
            id: mockPostId, 
            postDateTime: "2024-05-25 16:56:00", 
            postTitle: "Welcome to Post 1", 
            postText: "Post 1 contents", 
            postEdited: "0", 
            adminEdit: "0", 
            accId: 1 
        };
  
      // Mock the Post.getAllPosts function to return the mock data
      Post.getPostById.mockResolvedValue(mockPost);
  
      const req = {
        params: { id: mockPostId.toString() }
      };
      const res = {
        json: jest.fn(), // Mock the res.json function
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
  
      await postController.getPostById(req, res);
  
      expect(Post.getPostById).toHaveBeenCalledTimes(1); // Check if getAllPosts was called
      expect(Post.getPostById).toHaveBeenCalledWith(mockPostId);
      expect(res.json).toHaveBeenCalledWith(mockPost); // Check the response body
    });

    it("should return 404 if post not found", async () => {
        const mockPostId = 999;

        Post.getPostById.mockResolvedValue(null);

        const req = {
            params: { id: mockPostId.toString() }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        }

        await postController.getPostById(req, res);
    });
  
    it("should handle errors and return a 500 status with error message", async () => {
      const mockPostId = 1;
      const errorMessage = "Database error";
      Post.getPostById.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const req = {
        params: { id: mockPostId.toString() }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
  
      await postController.getPostById(req, res);
  
      expect(Post.getPostById).toHaveBeenCalledWith(mockPostId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error retrieving post");
    }); 
});

// Retrieve reply count of a specific post
describe("postController.getReplyCount", () => {
    beforeEach(() => {
      jest.clearAllMocks(); // Clear mock calls before each test
    });
  
    it("should fetch the reply count for a specific post and return a JSON response", async () => {
        const mockPostId = 1;
        const mockReplyCount = 5;
  
      // Mock the Post.getAllPosts function to return the mock data
      Post.getReplyCount.mockResolvedValue(mockReplyCount);
  
      const req = {
        params: { id: mockPostId.toString() }
      };
      const res = {
        json: jest.fn(), // Mock the res.json function
        status: jest.fn().mockReturnThis()
      };
  
      await postController.getReplyCount(req, res);
  
      expect(Post.getReplyCount).toHaveBeenCalledTimes(1); // Check if getAllPosts was called
      expect(Post.getReplyCount).toHaveBeenCalledWith(mockPostId);
      expect(res.json).toHaveBeenCalledWith({ replyCount: mockReplyCount }); // Check the response body
    });
  
    it("should handle errors and return a 500 status with error message", async () => {
      const mockPostId = 1;
      const errorMessage = "Database error";
      Post.getReplyCount.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const req = {
        params: { id: mockPostId.toString() }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await postController.getReplyCount(req, res);
  
      expect(Post.getReplyCount).toHaveBeenCalledWith(mockPostId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    }); 
});

// Update a specific post
describe("postController.updatePost", () => {
    beforeEach(() => {
      jest.clearAllMocks(); // Clear mock calls before each test
    });
  
    it("should fetch the reply count for a specific post and return a JSON response", async () => {
        const mockPostId = 1;
        const mockReplyCount = 5;
  
      // Mock the Post.getAllPosts function to return the mock data
      Post.getReplyCount.mockResolvedValue(mockReplyCount);
  
      const req = {
        params: { id: mockPostId.toString() }
      };
      const res = {
        json: jest.fn(), // Mock the res.json function
        status: jest.fn().mockReturnThis()
      };
  
      await postController.getReplyCount(req, res);
  
      expect(Post.getReplyCount).toHaveBeenCalledTimes(1); // Check if getAllPosts was called
      expect(Post.getReplyCount).toHaveBeenCalledWith(mockPostId);
      expect(res.json).toHaveBeenCalledWith({ replyCount: mockReplyCount }); // Check the response body
    });
  
    it("should handle errors and return a 500 status with error message", async () => {
      const mockPostId = 1;
      const errorMessage = "Database error";
      Post.getReplyCount.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const req = {
        params: { id: mockPostId.toString() }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await postController.getReplyCount(req, res);
  
      expect(Post.getReplyCount).toHaveBeenCalledWith(mockPostId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    }); 
});
