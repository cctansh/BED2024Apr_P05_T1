const Reply = require("../models/reply");

const getAllReplies = async (req, res) => {
  try {
    const replies = await Reply.getAllReplies();
    res.json(replies);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving replies");
  }
};

const getReplyById = async (req, res) => {
  const replyId = parseInt(req.params.id);
  try {
    const reply = await Reply.getReplyById(replyId);
    if (!reply) {
      return res.status(404).send("Reply not found");
    }
    res.json(reply);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving reply");
  }
};

const createReply = async (req, res) => {
    const newReply = req.body;
    try {
      const createdReply = await Reply.createReply(newReply);
      res.status(201).json(createdReply);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error creating reply");
    }
};

const updateReply = async (req, res) => {
  const replyId = parseInt(req.params.id);
  const newReplyData = req.body;

  try {
    const reply = await Reply.getReplyById(replyId);
    if (!reply) {
        return res.status(404).send("Reply not found");
    }

    // Check if the user is the owner of the reply or an admin
    if (reply.accId != req.user.accId && req.user.accRole != 'admin') {
        return res.status(403).json({ message: "You are not authorized to update this reply" });
    }

    // Ensure the adminEdit field is set correctly
    newReplyData.adminEdit = req.user.accRole == 'admin' ? 1 : 0;

    const updatedReply = await Reply.updateReply(replyId, newReplyData);
    if (!updatedReply) {
      return res.status(404).send("Reply not found");
    }
    res.json(updatedReply);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating reply");
  }
};

const deleteReply = async (req, res) => {
  const replyId = parseInt(req.params.id);

  try {
    const reply = await Reply.getReplyById(replyId);
    if (!reply) {
        return res.status(404).send("Reply not found");
    }

    // Check if the user is the owner of the reply or an admin
    if (reply.accId != req.user.accId && req.user.accRole != 'admin') {
        return res.status(403).json({ message: "You are not authorized to delete this reply" });
    }
    
    const success = await Reply.deleteReply(replyId);
    if (!success) {
      return res.status(404).send("Reply not found");
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting reply");
  }
};

const getRepliedPost = async (req, res) => {
  const replyId = parseInt(req.params.id);
  try {
    const reply = await Reply.getRepliedPost(replyId);
    if (!reply) {
      return res.status(404).send("Replied post not found");
    }
    res.json(reply);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving replied post");
  }
};

const getRepliesByPost = async (req, res) => {
  const replyId = parseInt(req.params.id);
  try {
    const replies = await Reply.getRepliesByPost(replyId);
    if (!replies || replies.length === 0) {
      return res.status(404).send("Replies not found");
    }
    res.json(replies);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving replies");
  }
};

module.exports = {
  getAllReplies,
  getReplyById,
  createReply,
  updateReply,
  deleteReply,
  getRepliedPost,
  getRepliesByPost
};