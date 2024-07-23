// reply.test.js
const sql = require("mssql");
const dbConfig = require("../dbConfig");
const Reply = require("../models/reply");

jest.mock("mssql");

describe("Reply", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllReplies", () => {
    it("should retrieve all replies from the database", async () => {
      const mockReplies = [
        { replyId: 1, replyDateTime: "2024-05-25 16:56:00", replyText: "Reply 1", replyEdited: 0, adminEdit: 0, accId: 1, replyTo: 1 },
        { replyId: 2, replyDateTime: "2024-05-26 16:56:00", replyText: "Reply 2", replyEdited: 0, adminEdit: 0, accId: 2, replyTo: 2 }
      ];

      const mockConnection = {
        request: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: mockReplies }),
        close: jest.fn()
      };

      sql.connect.mockResolvedValue(mockConnection);

      const replies = await Reply.getAllReplies();

      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(mockConnection.request).toHaveBeenCalled();
      expect(mockConnection.query).toHaveBeenCalledWith("SELECT * FROM Reply");
      expect(mockConnection.close).toHaveBeenCalled();
      expect(replies).toHaveLength(2);
      expect(replies).toEqual(expect.arrayContaining([
        expect.objectContaining({ replyId: 1, replyText: "Reply 1" }),
        expect.objectContaining({ replyId: 2, replyText: "Reply 2" })
      ]));
    });

    it("should handle errors when retrieving replies", async () => {
      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnThis(),
        query: jest.fn().mockRejectedValue(new Error("Database error")),
        close: jest.fn()
      });

      await expect(Reply.getAllReplies()).rejects.toThrow("Database error");
    });
  });

  describe("getReplyById", () => {
    it("should retrieve a specific reply by ID", async () => {
      const mockReplyId = 1;
      const mockReplyData = {
        replyId: mockReplyId,
        replyDateTime: "2024-05-25 16:56:00",
        replyText: "Reply Content",
        replyEdited: 0,
        adminEdit: 0,
        accId: 1,
        replyTo: 1
      };

      const mockConnection = {
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: [mockReplyData] }),
        close: jest.fn()
      };

      sql.connect.mockResolvedValue(mockConnection);

      const reply = await Reply.getReplyById(mockReplyId);

      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(mockConnection.request).toHaveBeenCalled();
      expect(mockConnection.input).toHaveBeenCalledWith("id", mockReplyId);
      expect(mockConnection.query).toHaveBeenCalledWith("SELECT * FROM Reply WHERE replyId = @id");
      expect(mockConnection.close).toHaveBeenCalled();
      expect(reply).toBeInstanceOf(Reply);
      expect(reply).toEqual(expect.objectContaining({ replyId: mockReplyId, replyText: "Reply Content" }));
    });

    it("should return null if reply is not found", async () => {
      const mockReplyId = 999;

      const mockConnection = {
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: [] }),
        close: jest.fn()
      };

      sql.connect.mockResolvedValue(mockConnection);

      const reply = await Reply.getReplyById(mockReplyId);

      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(mockConnection.request).toHaveBeenCalled();
      expect(mockConnection.input).toHaveBeenCalledWith("id", mockReplyId);
      expect(mockConnection.query).toHaveBeenCalledWith("SELECT * FROM Reply WHERE replyId = @id");
      expect(mockConnection.close).toHaveBeenCalled();
      expect(reply).toBeNull();
    });
  });

  describe("createReply", () => {
    it("should create a new reply and return the created reply", async () => {
      const newReplyData = {
        replyText: "New Reply Content",
        accId: 1,
        replyTo: 1
      };
      const mockReplyId = 1;

      const mockConnection = {
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: [{ replyId: mockReplyId }] }),
        close: jest.fn()
      };

      sql.connect.mockResolvedValue(mockConnection);

      jest.spyOn(Reply, "getReplyById").mockResolvedValue({
        replyId: mockReplyId,
        replyDateTime: "2024-05-25 16:56:00",
        replyText: newReplyData.replyText,
        replyEdited: 0,
        adminEdit: 0,
        accId: newReplyData.accId,
        replyTo: newReplyData.replyTo
      });

      const createdReply = await Reply.createReply(newReplyData);

      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(mockConnection.request).toHaveBeenCalled();
      expect(mockConnection.input).toHaveBeenCalledWith("replyText", newReplyData.replyText);
      expect(mockConnection.input).toHaveBeenCalledWith("replyTo", newReplyData.replyTo);
      expect(mockConnection.input).toHaveBeenCalledWith("accId", newReplyData.accId);
      expect(mockConnection.query).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO Reply"));
      expect(mockConnection.close).toHaveBeenCalled();
      expect(createdReply).toEqual(expect.objectContaining({ replyId: mockReplyId, replyText: newReplyData.replyText }));
    });

    it("should handle errors when creating a reply", async () => {
      const newReplyData = {
        replyText: "New Reply Content",
        accId: 1,
        replyTo: 1
      };

      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockRejectedValue(new Error("Database error")),
        close: jest.fn()
      });

      await expect(Reply.createReply(newReplyData)).rejects.toThrow("Database error");
    });
  });

  describe("updateReply", () => {
    it("should update an existing reply and return the updated reply", async () => {
      const mockReplyId = 1;
      const newReplyData = {
        replyText: "Updated Reply Content",
        adminEdit: 1
      };

      const mockConnection = {
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({}),
        close: jest.fn()
      };

      sql.connect.mockResolvedValue(mockConnection);

      jest.spyOn(Reply, "getReplyById").mockResolvedValue({
        replyId: mockReplyId,
        replyDateTime: "2024-05-25 16:56:00",
        replyText: newReplyData.replyText,
        replyEdited: 1,
        adminEdit: newReplyData.adminEdit,
        accId: 1,
        replyTo: 1
      });

      const updatedReply = await Reply.updateReply(mockReplyId, newReplyData);

      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(mockConnection.request).toHaveBeenCalled();
      expect(mockConnection.input).toHaveBeenCalledWith("id", mockReplyId);
      expect(mockConnection.input).toHaveBeenCalledWith("replyText", newReplyData.replyText);
      expect(mockConnection.input).toHaveBeenCalledWith("adminEdit", newReplyData.adminEdit);
      expect(mockConnection.query).toHaveBeenCalledWith(expect.stringContaining("UPDATE Reply"));
      expect(mockConnection.close).toHaveBeenCalled();
      expect(updatedReply).toEqual(expect.objectContaining({ replyId: mockReplyId, replyText: newReplyData.replyText }));
    });

    it("should handle errors when updating a reply", async () => {
      const mockReplyId = 1;
      const newReplyData = {
        replyText: "Updated Reply Content",
        adminEdit: 1
      };

      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockRejectedValue(new Error("Database error")),
        close: jest.fn()
      });

      await expect(Reply.updateReply(mockReplyId, newReplyData)).rejects.toThrow("Database error");
    });
  });

  describe("deleteReply", () => {
    it("should delete a reply and return true if successful", async () => {
      const mockReplyId = 1;

      const mockConnection = {
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ rowsAffected: [1] }),
        close: jest.fn()
      };

      sql.connect.mockResolvedValue(mockConnection);

      const result = await Reply.deleteReply(mockReplyId);

      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(mockConnection.request).toHaveBeenCalled();
      expect(mockConnection.input).toHaveBeenCalledWith("id", mockReplyId);
      expect(mockConnection.query).toHaveBeenCalledWith("DELETE FROM Reply WHERE replyId = @id");
      expect(mockConnection.close).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should return false if reply deletion is unsuccessful", async () => {
      const mockReplyId = 1;

      const mockConnection = {
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ rowsAffected: [0] }),
        close: jest.fn()
      };

      sql.connect.mockResolvedValue(mockConnection);

      const result = await Reply.deleteReply(mockReplyId);

      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(mockConnection.request).toHaveBeenCalled();
      expect(mockConnection.input).toHaveBeenCalledWith("id", mockReplyId);
      expect(mockConnection.query).toHaveBeenCalledWith("DELETE FROM Reply WHERE replyId = @id");
      expect(mockConnection.close).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe("getRepliedPost", () => {
    it("should return the post replied to by the given reply", async () => {
      const mockReplyId = 1;
      const mockPostData = {
        postId: 1,
        postDateTime: "2024-05-25 16:56:00",
        postTitle: "Post Title",
        postText: "Post Content",
        postEdited: 0,
        adminEdit: 0,
        accId: 1
      };

      const mockConnection = {
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: [mockPostData] }),
        close: jest.fn()
      };

      sql.connect.mockResolvedValue(mockConnection);

      const post = await Reply.getRepliedPost(mockReplyId);

      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(mockConnection.request).toHaveBeenCalled();
      expect(mockConnection.input).toHaveBeenCalledWith("id", mockReplyId);
      expect(mockConnection.query).toHaveBeenCalledWith(expect.stringContaining(`SELECT p.postId, p.postDateTime, p.postTitle, p.postText, p.postEdited, p.adminEdit, p.accId FROM Reply r LEFT JOIN Post p ON r.replyTo = p.postId WHERE r.replyId = @id;`));
      expect(mockConnection.close).toHaveBeenCalled();
      expect(post).toEqual(expect.objectContaining({ postId: mockPostData.postId, postTitle: mockPostData.postTitle }));
    });

    it("should handle errors when retrieving the replied post", async () => {
      const mockReplyId = 1;

      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockRejectedValue(new Error("Database error")),
        close: jest.fn()
      });

      await expect(Reply.getRepliedPost(mockReplyId)).rejects.toThrow("Error fetching replied post");
    });
  });

  describe("getRepliesByPost", () => {
    it("should return replies for a specific post", async () => {
      const mockPostId = 1;
      const mockReplies = [
        { replyId: 1, replyDateTime: "2024-05-25 16:56:00", replyText: "Reply Content 1", replyEdited: 0, adminEdit: 0, accId: 1, replyTo: mockPostId },
        { replyId: 2, replyDateTime: "2024-05-26 16:56:00", replyText: "Reply Content 2", replyEdited: 0, adminEdit: 0, accId: 2, replyTo: mockPostId }
      ];

      const mockConnection = {
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: mockReplies }),
        close: jest.fn()
      };

      sql.connect.mockResolvedValue(mockConnection);

      const replies = await Reply.getRepliesByPost(mockPostId);

      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(mockConnection.request).toHaveBeenCalled();
      expect(mockConnection.input).toHaveBeenCalledWith("id", mockPostId);
      expect(mockConnection.query).toHaveBeenCalledWith("SELECT * FROM Reply WHERE replyTo = @id");
      expect(mockConnection.close).toHaveBeenCalled();
      expect(replies).toHaveLength(2);
      expect(replies).toEqual(expect.arrayContaining([
        expect.objectContaining({ replyId: 1, replyText: "Reply Content 1" }),
        expect.objectContaining({ replyId: 2, replyText: "Reply Content 2" })
      ]));
    });

    it("should handle errors when retrieving replies by post", async () => {
      const mockPostId = 1;

      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockRejectedValue(new Error("Database error")),
        close: jest.fn()
      });

      await expect(Reply.getRepliesByPost(mockPostId)).rejects.toThrow("Error fetching replied post");
    });
  });
});
