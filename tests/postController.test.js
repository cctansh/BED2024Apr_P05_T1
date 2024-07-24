// postController.test.js
// Import necessary modules
const postController = require("../controllers/postController.js");
const Post = require("../models/post.js");

// Mock the Post model
jest.mock("../models/Post");

// Test suite for postController.getAllPosts method
describe("postController.getAllPosts", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mock calls before each test
  });

  // Test case: should fetch all posts and return a JSON response
  it("should fetch all posts and return a JSON response", async () => {
    // Mock data for posts
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

    // Call the method under test
    await postController.getAllPosts(req, res);

    // Assertions
    expect(Post.getAllPosts).toHaveBeenCalledTimes(1); // Check if getAllPosts was called
    expect(res.json).toHaveBeenCalledWith(mockPosts); // Check the response body
  });

  // Test case: should handle errors and return a 500 status with error message
  it("should handle errors and return a 500 status with error message", async () => {
    const errorMessage = "Database error";
    Post.getAllPosts.mockRejectedValue(new Error(errorMessage)); // Simulate an error

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Call the method under test
    await postController.getAllPosts(req, res);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("Error retrieving posts");
  }); 
});

// Test suite for postController.getPostById method
describe("postController.getPostById", () => {
    beforeEach(() => {
      jest.clearAllMocks(); // Clear mock calls before each test
    });
  
    // Test case: should fetch a specific post and return a JSON response
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
  
      // Call the method under test
      await postController.getPostById(req, res);
  
      // Assertions
      expect(Post.getPostById).toHaveBeenCalledTimes(1); // Check if getPostById was called
      expect(Post.getPostById).toHaveBeenCalledWith(mockPostId);
      expect(res.json).toHaveBeenCalledWith(mockPost); // Check the response body
    });

    // Test case: should return 404 if post not found
    it("should return 404 if post not found", async () => {
        const mockPostId = 999;

        // Mock the Post.getPostById function to return null (post not found)
        Post.getPostById.mockResolvedValue(null);

        const req = {
            params: { id: mockPostId.toString() }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        }

        // Call the method under test
        await postController.getPostById(req, res);

        // Assertions
        expect(Post.getPostById).toHaveBeenCalledWith(mockPostId);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith("Post not found");
    });
  
    // Test case: should handle errors and return a 500 status with error message
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
  
      // Call the method under test
      await postController.getPostById(req, res);
  
      // Assertions
      expect(Post.getPostById).toHaveBeenCalledWith(mockPostId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error retrieving post");
    }); 
});

// Test suite for postController.getReplyCount method
describe("postController.getReplyCount", () => {
    beforeEach(() => {
      jest.clearAllMocks(); // Clear mock calls before each test
    });
  
    // Test case: should fetch the reply count for a specific post and return a JSON response
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
      
      // Call the method under test
      await postController.getReplyCount(req, res);
  
      // Assertions
      expect(Post.getReplyCount).toHaveBeenCalledTimes(1); // Check if getReplyCount was called
      expect(Post.getReplyCount).toHaveBeenCalledWith(mockPostId);
      expect(res.json).toHaveBeenCalledWith({ replyCount: mockReplyCount }); // Check the response body
    });
  
    // Test case: should handle errors and return a 500 status with error message
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
  
      // Call the method under test
      await postController.getReplyCount(req, res);
  
      // Assertions
      expect(Post.getReplyCount).toHaveBeenCalledWith(mockPostId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    }); 
});

// Test suite for postController.updatePost method
describe("postController.updatePost", () => {
    beforeEach(() => {
      jest.clearAllMocks(); // Clear mock calls before each test
    });
  
    // Test case: should update a specific post and return a JSON response
    it("should update a specific post and return a JSON response", async () => {
        const mockPostId = 1;
        const mockAccId = 123;
        const mockAccRole = "member";
        const mockPost = {
            id: mockPostId,
            accId: mockAccId,
            postTitle: "Original Title",
            postText: "Original Content"
        };
        const mockUpdatedData = {
            postTitle: "Updated Title",
            postText: "Updated Content"
        };
        const mockUpdatedPost = {
            ...mockPost,
            ...mockUpdatedData,
            adminEdit: 0
        }
  
      // Mock the Post.getAllPosts function to return the mock data
      Post.getPostById.mockResolvedValue(mockPost);

      Post.updatePost.mockResolvedValue(mockUpdatedPost);
  
      const req = {
        params: { id: mockPostId.toString() },
        body: mockUpdatedData,
        user: { accId: mockAccId, accRole: mockAccRole }
      };
      const res = {
        json: jest.fn(), // Mock the res.json function
        status: jest.fn().mockReturnThis()
      };
      
      // Call the method under test
      await postController.updatePost(req, res);
  
      // Assertions
      expect(Post.getPostById).toHaveBeenCalledWith(mockPostId); // Check if getAllPosts was called
      expect(Post.updatePost).toHaveBeenCalledWith(mockPostId, { ...mockUpdatedData, adminEdit: 0 });
      expect(res.json).toHaveBeenCalledWith(mockUpdatedPost); // Check the response body
    });
  
    // Test case: should return 404 if post not found
    it("should return 404 if post not found", async () => {
        const mockPostId = 999;
        const mockAccId = 123;
        const mockAccRole = "member";

        Post.getPostById.mockResolvedValue(null);

        const req = {
            params: { id: mockPostId.toString() },
            body: {},
            user: { accId: mockAccId, accRole: mockAccRole }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        // Call the method under test
        await postController.updatePost(req, res);

        // Assertions
        expect(Post.getPostById).toHaveBeenCalledWith(mockPostId);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith("Post not found");
    });

    // Test case: should return 403 if user is not authorized
    it("should return 403 if user is not authorized", async () => {
        const mockPostId = 1;
        const mockPost = {
            id: mockPostId,
            accId: 456,
            postTitle: "Original Title",
            postText: "Original Content"
        };
        const mockAccId = 123;
        const mockAccRole = "member";

        Post.getPostById.mockResolvedValue(mockPost);

        const req = {
            params: { id: mockPostId.toString() },
            body: {},
            user: { accId: mockAccId, accRole: mockAccRole }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Call the method under test
        await postController.updatePost(req, res);

        // Assertions
        expect(Post.getPostById).toHaveBeenCalledWith(mockPostId);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: "You are not authorized to update this post" });
    })

    // Test case: should handle errors and return a 500 status with error message
    it("should handle errors and return a 500 status with error message", async () => {
      const mockPostId = 1;
      const mockAccId = 123;
      const mockAccRole = "member";
      const errorMessage = "Database error";

      Post.getPostById.mockResolvedValue({ id: mockPostId, accId: mockAccId })

      Post.updatePost.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const req = {
        params: { id: mockPostId.toString() },
        body: {},
        user: { accId: mockAccId, accRole: mockAccRole }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
  
      // Call the method under test
      await postController.updatePost(req, res);
  
      // Assertions
      expect(Post.getPostById).toHaveBeenCalledWith(mockPostId);
      expect(Post.updatePost).toHaveBeenCalledWith(mockPostId, expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error updating post");
    }); 
});

// Test suite for postController.deletePost method
describe("postController.deletePost", () => {
    beforeEach(() => {
      jest.clearAllMocks(); // Clear mock calls before each test
    });
  
    // Test case: should delete a specific post and return a 204 status
    it("should delete a specific post and return a 204 status", async () => {
        const mockPostId = 1;
        const mockAccId = 123;
        const mockAccRole = "member";
        const mockPost = {
            id: mockPostId,
            accId: mockAccId,
            postTitle: "Original Title",
            postText: "Original Content"
        };
  
      // Mock the Post.getPostId function to return the mock data
      Post.getPostById.mockResolvedValue(mockPost);

      // Mock the Post.deletePost function to return true
      Post.deletePost.mockResolvedValue(true);
  
      const req = {
        params: { id: mockPostId.toString() },
        user: { accId: mockAccId, accRole: mockAccRole }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
  
      // Call the method under test
      await postController.deletePost(req, res);
  
      // Assertions
      expect(Post.getPostById).toHaveBeenCalledWith(mockPostId); // Check if getPostById was called
      expect(Post.deletePost).toHaveBeenCalledWith(mockPostId);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalledTimes(1); // Check the response body
    });
  
    // Test case: should return 404 if post not found
    it("should return 404 if post not found", async () => {
        const mockPostId = 999;
        const mockAccId = 123;
        const mockAccRole = "member";

        Post.getPostById.mockResolvedValue(null);

        const req = {
            params: { id: mockPostId.toString() },
            user: { accId: mockAccId, accRole: mockAccRole }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        // Call the method under test
        await postController.deletePost(req, res);

        // Assertions
        expect(Post.getPostById).toHaveBeenCalledWith(mockPostId);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith("Post not found");
    });

    // Test case: should return 403 if user is not authorized
    it("should return 403 if user is not authorized", async () => {
        const mockPostId = 1;
        const mockPost = {
            id: mockPostId,
            accId: 456,
            postTitle: "Original Title",
            postText: "Original Content"
        };
        const mockAccId = 123;
        const mockAccRole = "member";

        Post.getPostById.mockResolvedValue(mockPost);

        const req = {
            params: { id: mockPostId.toString() },
            user: { accId: mockAccId, accRole: mockAccRole }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Call the method under test
        await postController.deletePost(req, res);

        // Assertions
        expect(Post.getPostById).toHaveBeenCalledWith(mockPostId);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: "You are not authorized to delete this post" });
    })

    // Test case: should handle errors and return a 500 status with error message
    it("should handle errors and return a 500 status with error message", async () => {
      const mockPostId = 1;
      const mockAccId = 123;
      const mockAccRole = "member";
      const errorMessage = "Database error";

      Post.getPostById.mockResolvedValue({ id: mockPostId, accId: mockAccId })

      Post.deletePost.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const req = {
        params: { id: mockPostId.toString() },
        user: { accId: mockAccId, accRole: mockAccRole }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
  
      // Call the method under test
      await postController.deletePost(req, res);
  
      // Assertions
      expect(Post.getPostById).toHaveBeenCalledWith(mockPostId);
      expect(Post.deletePost).toHaveBeenCalledWith(mockPostId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error deleting post");
    }); 
});
