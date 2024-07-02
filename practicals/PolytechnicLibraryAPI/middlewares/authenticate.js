require('dotenv').config();
const jwt = require("jsonwebtoken");

function verifyJWT(req, res, next) {
  // get token
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) { // if no token, deny
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => { // verify if token is valid
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Check user role for authorization 
    const authorizedRoles = {
      "/books": ["member", "librarian"], // Anyone can view books
      "/books/[0-9]+/availability": ["librarian"], // Only librarians can update availability
    };

    const requestedEndpoint = req.url;
    const userRole = decoded.role;

    const authorizedRole = Object.entries(authorizedRoles).find(
      ([endpoint, roles]) => {
        const regex = new RegExp(`^${endpoint}$`); // Create RegExp from endpoint
        return regex.test(requestedEndpoint) && roles.includes(userRole);
      }
    );

    if (!authorizedRole) { // if role is unauthorised
      return res.status(403).json({ message: "Forbidden" });
    }

    req.user = decoded; // Attach decoded user information to the request object
    next();
  });
}

module.exports = {
  verifyJWT
};