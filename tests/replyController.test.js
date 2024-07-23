// replyController.test.js
const replyController = require("../controllers/replyController");
const Reply = require("../models/reply");

jest.mock("../models/reply");

describe("replyController", () => {
  
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test for getAllReplies
  describe("getAllReplies", () => {
    it("should fetch all replies and return a JSON response", async () => {
      const mockReplies = [
        { replyId: 1, replyText: "Reply 1", accId: 1 },
        { replyId: 2, replyText: "Reply 2", accId: 2 },
      ];

      Reply.getAllReplies.mockResolvedValue(mockReplies);

      const req = {};
      const res = {
        json: jest.fn(),
      };

      await replyController.getAllReplies(req, res);

      expect(Reply.getAllReplies).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockReplies);
    });

    it("should handle errors and return a 500 status with an error message", async () => {
      Reply.getAllReplies.mockRejectedValue(new Error("Database error"));

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await replyController.getAllReplies(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error retrieving replies");
    });
  });

  // Test for getReplyById
  describe("getReplyById", () => {
    it("should fetch a specific reply and return a JSON response", async () => {
      const mockReplyId = 1;
      const mockReply = { replyId: mockReplyId, replyText: "Reply 1", accId: 1 };

      Reply.getReplyById.mockResolvedValue(mockReply);

      const req = { params: { id: mockReplyId.toString() } };
      const res = {
        json: jest.fn(),
      };

      await replyController.getReplyById(req, res);

      expect(Reply.getReplyById).toHaveBeenCalledWith(mockReplyId);
      expect(res.json).toHaveBeenCalledWith(mockReply);
    });

    it("should return 404 if reply not found", async () => {
      const mockReplyId = 999;

      Reply.getReplyById.mockResolvedValue(null);

      const req = { params: { id: mockReplyId.toString() } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await replyController.getReplyById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("Reply not found");
    });

    it("should handle errors and return a 500 status with an error message", async () => {
      const mockReplyId = 1;

      Reply.getReplyById.mockRejectedValue(new Error("Database error"));

      const req = { params: { id: mockReplyId.toString() } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await replyController.getReplyById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error retrieving reply");
    });
  });

  // Test for createReply
  describe("createReply", () => {
    it("should create a new reply and return a JSON response", async () => {
      const newReply = { replyText: "New Reply", accId: 1 };
      const createdReply = { ...newReply, replyId: 1 };

      Reply.createReply.mockResolvedValue(createdReply);

      const req = { body: newReply };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await replyController.createReply(req, res);

      expect(Reply.createReply).toHaveBeenCalledWith(newReply);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdReply);
    });

    it("should handle errors and return a 500 status with an error message", async () => {
      const newReply = { replyText: "New Reply", accId: 1 };

      Reply.createReply.mockRejectedValue(new Error("Database error"));

      const req = { body: newReply };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await replyController.createReply(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error creating reply");
    });
  });

  // Test for updateReply
  describe("updateReply", () => {
    it("should update a reply and return a JSON response", async () => {
      const replyId = 1;
      const newReplyData = { replyText: "Updated Reply" };
      const existingReply = { replyId, replyText: "Original Reply", accId: 1 };
      const updatedReply = { ...existingReply, ...newReplyData, adminEdit: 0 };

      Reply.getReplyById.mockResolvedValue(existingReply);
      Reply.updateReply.mockResolvedValue(updatedReply);

      const req = {
        params: { id: replyId.toString() },
        body: newReplyData,
        user: { accId: 1, accRole: "member" },
      };
      const res = {
        json: jest.fn(),
      };

      await replyController.updateReply(req, res);

      expect(Reply.getReplyById).toHaveBeenCalledWith(replyId);
      expect(Reply.updateReply).toHaveBeenCalledWith(replyId, { ...newReplyData, adminEdit: 0 });
      expect(res.json).toHaveBeenCalledWith(updatedReply);
    });

    it("should return 404 if reply not found", async () => {
      const replyId = 999;

      Reply.getReplyById.mockResolvedValue(null);

      const req = {
        params: { id: replyId.toString() },
        body: {},
        user: { accId: 1, accRole: "member" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await replyController.updateReply(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("Reply not found");
    });

    it("should return 403 if user is not authorized", async () => {
      const replyId = 1;
      const existingReply = { replyId, replyText: "Original Reply", accId: 2 };

      Reply.getReplyById.mockResolvedValue(existingReply);

      const req = {
        params: { id: replyId.toString() },
        body: {},
        user: { accId: 1, accRole: "member" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await replyController.updateReply(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "You are not authorized to update this reply" });
    });

    it("should handle errors and return a 500 status with an error message", async () => {
      const replyId = 1;

      Reply.getReplyById.mockResolvedValue({ replyId, accId: 1 });
      Reply.updateReply.mockRejectedValue(new Error("Database error"));

      const req = {
        params: { id: replyId.toString() },
        body: {},
        user: { accId: 1, accRole: "member" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await replyController.updateReply(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error updating reply");
    });
  });

  // Test for deleteReply
  describe("deleteReply", () => {
    it("should delete a reply and return a 204 status", async () => {
      const replyId = 1;
      const existingReply = { replyId, replyText: "Reply to delete", accId: 1 };

      Reply.getReplyById.mockResolvedValue(existingReply);
      Reply.deleteReply.mockResolvedValue(true);

      const req = {
        params: { id: replyId.toString() },
        user: { accId: 1, accRole: "member" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await replyController.deleteReply(req, res);

      expect(Reply.getReplyById).toHaveBeenCalledWith(replyId);
      expect(Reply.deleteReply).toHaveBeenCalledWith(replyId);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalledTimes(1);
    });

    it("should return 404 if reply not found", async () => {
      const replyId = 999;

      Reply.getReplyById.mockResolvedValue(null);

      const req = {
        params: { id: replyId.toString() },
        user: { accId: 1, accRole: "member" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await replyController.deleteReply(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("Reply not found");
    });

    it("should return 403 if user is not authorized", async () => {
      const replyId = 1;
      const existingReply = { replyId, replyText: "Reply to delete", accId: 2 };

      Reply.getReplyById.mockResolvedValue(existingReply);

      const req = {
        params: { id: replyId.toString() },
        user: { accId: 1, accRole: "member" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await replyController.deleteReply(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "You are not authorized to delete this reply" });
    });

    it("should handle errors and return a 500 status with an error message", async () => {
      const replyId = 1;

      Reply.getReplyById.mockResolvedValue({ replyId, accId: 1 });
      Reply.deleteReply.mockRejectedValue(new Error("Database error"));

      const req = {
        params: { id: replyId.toString() },
        user: { accId: 1, accRole: "member" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await replyController.deleteReply(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error deleting reply");
    });
  });

  // Test for getRepliedPost
  describe("getRepliedPost", () => {
    it("should fetch the replied post and return a JSON response", async () => {
      const replyId = 1;
      const repliedPost = { postId: 1, postTitle: "Post Title" };

      Reply.getRepliedPost.mockResolvedValue(repliedPost);

      const req = { params: { id: replyId.toString() } };
      const res = {
        json: jest.fn(),
      };

      await replyController.getRepliedPost(req, res);

      expect(Reply.getRepliedPost).toHaveBeenCalledWith(replyId);
      expect(res.json).toHaveBeenCalledWith(repliedPost);
    });

    it("should return 404 if replied post not found", async () => {
      const replyId = 999;

      Reply.getRepliedPost.mockResolvedValue(null);

      const req = { params: { id: replyId.toString() } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await replyController.getRepliedPost(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("Replied post not found");
    });

    it("should handle errors and return a 500 status with an error message", async () => {
      const replyId = 1;

      Reply.getRepliedPost.mockRejectedValue(new Error("Database error"));

      const req = { params: { id: replyId.toString() } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await replyController.getRepliedPost(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error retrieving replied post");
    });
  });

  // Test for getRepliesByPost
  describe("getRepliesByPost", () => {
    it("should fetch replies for a specific post and return a JSON response", async () => {
      const postId = 1;
      const replies = [
        { replyId: 1, replyText: "Reply 1", postId: 1 },
        { replyId: 2, replyText: "Reply 2", postId: 1 },
      ];

      Reply.getRepliesByPost.mockResolvedValue(replies);

      const req = { params: { id: postId.toString() } };
      const res = {
        json: jest.fn(),
      };

      await replyController.getRepliesByPost(req, res);

      expect(Reply.getRepliesByPost).toHaveBeenCalledWith(postId);
      expect(res.json).toHaveBeenCalledWith(replies);
    });

    it("should return 404 if replies not found", async () => {
      const postId = 999;

      Reply.getRepliesByPost.mockResolvedValue([]);

      const req = { params: { id: postId.toString() } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await replyController.getRepliesByPost(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("Replies not found");
    });

    it("should handle errors and return a 500 status with an error message", async () => {
      const postId = 1;

      Reply.getRepliesByPost.mockRejectedValue(new Error("Database error"));

      const req = { params: { id: postId.toString() } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await replyController.getRepliesByPost(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error retrieving replies");
    });
  });
});
