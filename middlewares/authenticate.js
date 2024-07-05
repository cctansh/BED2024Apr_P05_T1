const jwt = require("jsonwebtoken");
require('dotenv').config();

function verifyJWT(req, res, next) {
    // get token
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

    if (!token) { // if no token, deny
        return res.status(401).json({ message: "Unauthorized" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => { // verify if token is valid
        if (err) {
            return res.status(403).json({ message: "Forbidden" });
        }

        // ive put speciifc role/user authorisation in the controllers themselves
        /*
        const authorizedRoles = {
            "POST /replies": ["member", "admin"],
            "PUT /replies/:id": ["member", "admin"],
            "DELETE /replies/:id": ["member", "admin"]
        };

        const requestedMethod = req.method;
        const requestedPath = req.path;
        const userRole = decoded.accRole;

        const authorizedRole = Object.entries(authorizedRoles).find(
            ([endpoint, roles]) => {
                const [method, path] = endpoint.split(" ");
                const regex = new RegExp(`^${path.replace(/:[^\s/]+/g, '[^/]+')}$`); // Create RegExp from endpoint
                return method === requestedMethod && regex.test(requestedPath) && roles.includes(userRole);
            }
        );

        if (!authorizedRole) { // if role is unauthorized
            return res.status(403).json({ message: "Forbidden" });
        }
        */

        req.user = decoded; // Attach decoded user information to the request object
        next();
    });
}

module.exports = {
    verifyJWT
};