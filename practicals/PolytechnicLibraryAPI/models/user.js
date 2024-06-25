const sql = require("mssql");
const dbConfig = require("../dbConfig");

class User {
    constructor(user_id, username, passwordHash, role) {
        this.user_id = user_id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    // for check
    static async getUserByUsername(username) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Users WHERE username = @username`;

        const request = connection.request();
        request.input("username", username);
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset[0]
            ? new User(
                result.recordset[0].user_id,
                result.recordset[0].username,
                result.recordset[0].passwordHash,
                result.recordset[0].role
            )
            : null;
    }

    //test bullshit
    static async getAllUsers() {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Users`; 
        const request = connection.request();
        const result = await request.query(sqlQuery);
    
        connection.close();
    
        return result.recordset.map(
          (row) => new User(row.user_id, row.username, row.passwordHash, row.role)
        ); 
      }
}

module.exports = User;