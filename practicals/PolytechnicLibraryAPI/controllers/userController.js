const User = require("../models/user");
const sql = require("mssql");
const dbConfig = require("../dbConfig");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secretKey = "lol"; 

const registerUser = async (req, res) => {
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

        const sqlQuery = `INSERT INTO Users (username, passwordHash, role) VALUES (@username, @hashedPassword, @role); SELECT SCOPE_IDENTITY() AS user_id;`;

        const request = connection.request();
        request.input("username", username);
        request.input("hashedPassword", hashedPassword);
        request.input("role", role);

        const result = await request.query(sqlQuery);
        const newUserId = result.recordset[0].user_id;

        connection.close();

        return res.status(201).json({ message: "User created successfully", userId: newUserId });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const login = async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Validate user credentials
      const user = await User.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      // Compare password with hash
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      // Generate JWT token
      const payload = {
        id: user.id,
        role: user.role,
      };
      const token = jwt.sign(payload, secretKey, { expiresIn: "3600s" }); 
  
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