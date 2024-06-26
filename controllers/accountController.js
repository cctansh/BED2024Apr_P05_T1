const Account = require("../models/account");
const jwt = require("jsonwebtoken");
const secretKey = "jwt_secret"; 

const getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.getAllAccounts();
    res.json(accounts);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving accounts");
  }
};

const getAccountById = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const account = await Account.getAccountById(id);
    if (!account) {
      return res.status(404).send("Account not found");
    }
    res.json(account);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving account");
  }
};

const createAccount = async (req, res) => {
    const newAccount = req.body;
    try {
      const createdAccount = await Account.createAccount(newAccount);
      res.status(201).json(createdAccount);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error creating account");
    }
};

const updateAccount = async (req, res) => {
  const id = parseInt(req.params.id);
  const newAccountData = req.body;

  try {
    const updatedAccount = await Account.updateAccount(id, newAccountData);
    if (!updatedAccount) {
      return res.status(404).send("Account not found");
    }
    res.json(updatedAccount);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating account");
  }
};

const deleteAccount = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const success = await Account.deleteAccount(id);
    if (!success) {
      return res.status(404).send("Account not found");
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting account");
  }
};

const loginAccount = async (req, res) => {
  const logAccount = req.body;
  try {
    const token = await Account.loginAccount(logAccount);
    if (!token) {
      return res.status(404).send("Invalid email or password");
    }
    res.status(200).json({
      message: "Login successful",
      token: token
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving account");
  }
};

const getPostsAndRepliesByAccount = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const objList = await Account.getPostsAndRepliesByAccount(id);
    res.json(objList);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving posts and replies");
  }
};


module.exports = {
  getAllAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  loginAccount,
  getPostsAndRepliesByAccount
};