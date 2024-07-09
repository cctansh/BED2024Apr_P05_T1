const User = require("../models/user");
const sql = require("mssql");
const dbConfig = require("../dbConfig");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const registerUser = async (req, res) => {
    // extract variables from user json object
    const { username, password, role } = req.body; 

    try {
        // Check for existing username
        const existingUser = await User.getUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // connect
        const connection = await sql.connect(dbConfig);

        // insert data in SQL database
        const sqlQuery = `INSERT INTO Users (username, passwordHash, role) VALUES (@username, @hashedPassword, @role); SELECT SCOPE_IDENTITY() AS user_id;`;
        const request = connection.request();
        request.input("username", username);
        request.input("hashedPassword", hashedPassword);
        request.input("role", role);
        const result = await request.query(sqlQuery); // return new user data

        const newUserId = result.recordset[0].user_id; // get new user id

        connection.close();

        // return success message and new user id
        return res.status(201).json({ message: "User created successfully", userId: newUserId });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.getUserByUsername(username);
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const payload = { id: user.user_id, role: user.role };
        const accessToken = generateAccessToken(payload);
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        const salt = await bcrypt.genSalt(10);
        const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);

        const connection = await sql.connect(dbConfig);
        const sqlQuery = `INSERT INTO RefreshTokens (refreshToken) VALUES (@refreshToken);`;
        const request = connection.request();
        request.input("refreshToken", hashedRefreshToken);
        await request.query(sqlQuery);

        connection.close();

        return res.status(200).json({ accessToken: accessToken, refreshToken: refreshToken });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "3600s" }); // edited this from 60s to 3600s for testing purposes
}

const token = async (req, res) => {
  const { token: refreshToken } = req.body;

  if (refreshToken == null) return res.status(401).json({ message: "No refresh token" });

  try {
    const connection = await sql.connect(dbConfig);
    const sqlQuery = `SELECT * FROM RefreshTokens WHERE refreshToken IS NOT NULL`;
    const request = connection.request();
    const result = await request.query(sqlQuery);

    if (result.recordset.length === 0) {
      return res.status(403).json({ message: "No tokens found" });
    }

    let match = null;

    for (const tokenRecord of result.recordset) {
      const isMatch = await bcrypt.compare(refreshToken, tokenRecord.refreshToken);
      if (isMatch) {
        match = true;
        break;
      }
    }

    if (!match) {
      return res.status(403).json({ message: "Forbidden" });
    }

      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
          if (err) {
              return res.status(403).json({ message: "Forbidden" });
          }
          const accessToken = generateAccessToken({ id: decoded.id, role: decoded.role });
          return res.status(200).json({ accessToken: accessToken });
      });

      connection.close();
  } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
  }
}

const logout = async (req, res) => {
  const { token: refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const connection = await sql.connect(dbConfig);
    const sqlQuery = `SELECT * FROM RefreshTokens WHERE refreshToken IS NOT NULL`;
    const request = connection.request();
    const result = await request.query(sqlQuery);

    if (result.recordset.length === 0) {
      return res.status(403).json({ message: "No tokens found" });
    }

    let tokenToDelete = null;

    for (const tokenRecord of result.recordset) {
      const isMatch = await bcrypt.compare(refreshToken, tokenRecord.refreshToken);
      if (isMatch) {
        tokenToDelete = tokenRecord.refreshToken;
        break;
      }
    }

    if (!tokenToDelete) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const deleteQuery = `DELETE FROM RefreshTokens WHERE refreshToken = @refreshToken`;
    request.input("refreshToken", tokenToDelete);
    await request.query(deleteQuery);

    connection.close();

    return res.status(204).json({ message: "Logged out" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

const getAllUsers = async (req, res) => {
    try {
      const users = await User.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error retrieving users");
    }
  };

module.exports = {
    registerUser,
    login,
    token,
    logout,
    getAllUsers
};