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

const searchRepliesByAccount = async(req, res) => {
  const searchTerm = req.query.searchTerm; 

  try {
    const replies = await Reply.searchRepliesByAccount(searchTerm);
    res.json(replies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error searching replies" });
  }
}

const searchRepliesByText = async(req, res) => {
  const searchTerm = req.query.searchTerm; 

  try {
    const replies = await Reply.searchRepliesByText(searchTerm);
    res.json(replies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error searching replies" });
  }
}

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
    if (!replies) {
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
  searchRepliesByAccount,
  searchRepliesByText,
  getRepliedPost,
  getRepliesByPost
};