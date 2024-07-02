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
      // extract variables from user json object
    const { username, password } = req.body;
  
    try {
      // validate user exists in database
      const user = await User.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      // Compare password with hash
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) { // if wrong password
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      // Generate JWT token
      // store user id and role inside token data
      const payload = {
        id: user.id,
        role: user.role,
      };
      const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "3600s" }); 
  
      // return token
      return res.status(200).json({ token });
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
    getAllUsers
};