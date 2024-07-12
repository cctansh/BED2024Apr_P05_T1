// Import Post model to postController.js
const Post = require("../models/post");

// Controller to get all posts
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.getAllPosts(); // Retrieve all posts from data source
    res.json(posts); // Send the post data as JSON response
  } catch (error) { 
    console.error(error); // Log errors occured in console
    res.status(500).send("Error retrieving posts"); // Respond with status code 500 (Internal Server Error) with message "Error retrieving posts"
  }
};

// Controller to get a post by its postId
const getPostById = async (req, res) => {
  const postId = parseInt(req.params.id); // Extract postId from request parameters and convert to integer
  try {
    const post = await Post.getPostById(postId); // Retrieve the post with the postId from the data source
    if (!post) {
      return res.status(404).send("Post not found"); // If post not found, send response with status code 404 (Not Found) with message "Post not found"
    }
    res.json(post); // If post is found, send the post data as JSON response
  } catch (error) {
    console.error(error); // Log errors occured in console
    res.status(500).send("Error retrieving post"); // Respond with status code 500 (Internal Server Error) with message "Error retrieving post"
  }
};

// Controller to create a new post
const createPost = async (req, res) => {
    const newPost = req.body; // Extract the new post data from request body
    try {
      const createdPost = await Post.createPost(newPost); // Create new post
      res.status(201).json(createdPost); // If successful, respond with status code 201 (Created) and return createdPost as JSON
    } catch (error) {
      console.error(error); // Log errors occured in console
      res.status(500).send("Error creating post"); // Respond with status code 500 (Internal Server Error) with message "Error creating post"
    }
};

// Controller to update a post
const updatePost = async (req, res) => {
  const postId = parseInt(req.params.id); // Extract postId from request parameters and convert to integer
  const newPostData = req.body; // Extract updated post data from request body

  try {
    const post = await Post.getPostById(postId); // Retrieve the post with the postId from the data source
    if (!post) {
      return res.status(404).send("Post not found"); // If post not found, respond with status code 404 (Not Found) with message "Post not found"
    }

    // Check if the user is the owner of the post or an admin
    if (post.accId != req.user.accId && req.user.accRole != 'admin') {
      return res.status(403).json({ message: "You are not authorized to update this post" }) // If user not authorized, respond with status code 403 (Forbidden) with message "You are not authorized to update this post"
    }

    const updatedPost = await Post.updatePost(postId, newPostData); // Update the post with new post data from before
    if (!updatedPost) {
      return res.status(404).send("Post not found"); // If cannot find new post data, respond with status code 404 (Not Found) with message "Post not found"
    }
    res.json(updatedPost); // If found, send updatedPost as JSON response
  } catch (error) {
    console.error(error); // Log errors occured in console
    res.status(500).send("Error updating post"); // Respond with status code 500 (Internal Server Error) with message "Error updating post"
  }
};

// Controller to delete a post
const deletePost = async (req, res) => {
  const postId = parseInt(req.params.id); // Extract postId from request parameters and convert to integer

  try {
    const success = await Post.deletePost(postId); // Delete the post with the postId from the data source
    if (!success) {
      return res.status(404).send("Post not found"); // If post is not found, respond with status code 404 (Not Found) with message "Post not found"
    }
    res.status(204).send(); // If successfully deleted post, respond with status code 204 (No Content)
  } catch (error) {
    console.error(error); // Log errors occured in console
    res.status(500).send("Error deleting post"); // Respond with status code 500 (Internal Server Error) with message "Error deleting post"
  }
};

// Controller to get reply count of a post
const getReplyCount = async (req, res) => {
  const postId = parseInt(req.params.id); // Extract postId from request parameters and convert to integer
  try {
    const replyCount = await Post.getReplyCount(postId); // Fetch reply count for the post
    res.json({ replyCount }); // Send replyCount as JSON response
  } catch (error) {
    console.error(`Error fetching reply count for post ${postId}:`, error); // Log errors occured in this format
    res.status(500).json({ error: 'Server error' }); // Respond with status code 500 (Internal Server Error) and a generic error message as shown
  }
};

// Export all controllers from postController.js so that it can be imported and used in other files/modules
module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getReplyCount
};