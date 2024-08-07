const Account = require("../models/account");
const bcrypt = require("bcryptjs");

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

    // Check for existing accEmail
    const existingEmail = await Account.getAccountByEmail(newAccount.accEmail);
    if (existingEmail) {
        return res.status(400).json({ message: "Email is already in use" });
    }

    // Check for existing accEmail
    const existingName = await Account.getAccountByName(newAccount.accName);
    if (existingName) {
        return res.status(400).json({ message: "Display name is already in use" });
    }

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
    const account = await Account.getAccountById(id);
    if (!account) {
        return res.status(404).send("Account not found");
    }

    if (account.accId != req.user.accId) {
      return res.status(403).json({ message: "You are not authorized to update this account" });
    }

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

const updateAccountRole = async (req, res) => {
  const id = parseInt(req.params.id);
  const newRoleData = req.body;

  try {
    const account = await Account.getAccountById(id);
    if (!account) {
        return res.status(404).send("Account not found");
    }

    if (req.user.accRole != 'admin') {
      return res.status(403).json({ message: "You are not authorized to update account roles" });
    }

    const updatedAccount = await Account.updateAccountRole(id, newRoleData);
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
    const account = await Account.getAccountById(id);
    if (!account) {
        return res.status(404).send("Account not found");
    }

    if (account.accId != req.user.accId && req.user.accRole != 'admin') {
      return res.status(403).json({ message: "You are not authorized to delete this account" });
    }

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
    const { token, refreshToken } = await Account.loginAccount(logAccount);
    if (!token) {
      return res.status(404).send("Invalid email or password");
    }
    res.status(200).json({
      message: "Login successful",
      token: token,
      refreshToken: refreshToken
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving account");
  }
};

const refreshAccessToken = async (req, res) => {
  const refreshToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
  try {
    const token = await Account.refreshAccessToken(refreshToken);
    if (!token) {
      return res.status(404).send("Invalid refresh token");
    }
    res.status(200).json({
      message: "successful",
      token: token
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating token");
  }
}

const logout = async (req, res) => {
  const refreshToken = req.headers.authorization && req.headers.authorization.split(" ")[1];
  try {
    const success = await Account.logout(refreshToken);
    if (!success) {
      return res.status(404).send("Unsuccessful");
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error logging out");
  }
}

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

const checkPassword = async (req, res) => {
  const {id, password} = req.body;
  try {
    const account = await Account.getAccountById(id);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (account.accId != req.user.accId) {
      return res.status(403).json({ message: "You are not authorized to check this password" });
    }
    
    const passwordMatch = await bcrypt.compare(password, account.accPassword);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials", check: false });
    }

    // Passwords match
    return res.status(200).json({ message: "Password match", check: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving account");
  }
}


module.exports = {
  getAllAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  updateAccountRole,
  deleteAccount,
  loginAccount,
  getPostsAndRepliesByAccount,
  checkPassword,
  refreshAccessToken,
  logout
};