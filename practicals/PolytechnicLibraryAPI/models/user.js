const sql = require("mssql");
const dbConfig = require("../dbConfig");

class User {
    constructor(user_id, username, passwordHash, role) {
        this.user_id = user_id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    // get user by username for login/register checks
    static async getUserByUsername(username) {
        // connect to SQL database
        const connection = await sql.connect(dbConfig);

        // find user by username SQL query
        const sqlQuery = `SELECT * FROM Users WHERE username = @username`;

        // plugging query into databasee
        const request = connection.request();
        request.input("username", username); // set username in query
        const result = await request.query(sqlQuery); // this returns an array of 1

        connection.close();

        // return the user from array (index 0)
        return result.recordset[0]
            ? new User(
                result.recordset[0].user_id,
                result.recordset[0].username,
                result.recordset[0].passwordHash,
                result.recordset[0].role
            )
            : null;
    }

    // get all users (FOR TESTING PURPOSES)
    static async getAllUsers() {
         // connect to SQL database
        const connection = await sql.connect(dbConfig);
        // get all books SQL query
        const sqlQuery = `SELECT * FROM Users`; 
        // plugging query into database
        const request = connection.request();
        const result = await request.query(sqlQuery); // returns array of database data

        connection.close();
    
        // map data to array of users and return
        return result.recordset.map(
          (row) => new User(row.user_id, row.username, row.passwordHash, row.role)
        ); 
      }
}

module.exports = User;