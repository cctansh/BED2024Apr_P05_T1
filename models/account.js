const sql = require("mssql");
const dbConfig = require("../dbConfig");
const jwt = require("jsonwebtoken");

const secretKey = "jwt_secret"; 

class Account {
    constructor(accId, accName, accEmail, accPassword) {
        this.accId = accId;
        this.accName = accName;
        this.accEmail = accEmail;
        this.accPassword = accPassword;
    }

    static async getAllAccounts() {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Account`; 

        const request = connection.request();
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset.map(
        (row) => new Account(row.accId, row.accName, row.accEmail, row.accPassword)
        ); 
    }

    static async getAccountById(id) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Account WHERE accId = @id`; 

        const request = connection.request();
        request.input("id", id);
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset[0]
        ? new Account(
            result.recordset[0].accId,
            result.recordset[0].accName,
            result.recordset[0].accEmail,
            result.recordset[0].accPassword
            )
        : null; 
    }

    static async createAccount(newAccountData) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `INSERT INTO Account (accName, accEmail, accPassword) VALUES (@accName, @accEmail, @accPassword); SELECT SCOPE_IDENTITY() AS accId;`; 

        const request = connection.request();
        request.input("accName", newAccountData.accName);
        request.input("accEmail", newAccountData.accEmail);
        request.input("accPassword", newAccountData.accPassword);

        const result = await request.query(sqlQuery);

        connection.close();

        return this.getAccountById(result.recordset[0].accId);
    }

    static async updateAccount(id, newAccountData) { 
        // allows for dynamic input data, eg name + email + pass, name + email only, name only
        let connection;
        try {
            connection = await sql.connect(dbConfig);
    
            let sqlQuery = 'UPDATE Account SET ';
            const params = [];
    
            if (newAccountData.accName) {
                sqlQuery += 'accName = @accName, ';
                params.push({ name: 'accName', type: sql.VarChar, value: newAccountData.accName });
            }
    
            if (newAccountData.accEmail) {
                sqlQuery += 'accEmail = @accEmail, ';
                params.push({ name: 'accEmail', type: sql.VarChar, value: newAccountData.accEmail });
            }
    
            if (newAccountData.accPassword) {
                sqlQuery += 'accPassword = @accPassword, ';
                params.push({ name: 'accPassword', type: sql.VarChar, value: newAccountData.accPassword });
            }
    
            // Remove the last comma and add the WHERE clause
            sqlQuery = sqlQuery.slice(0, -2) + ' WHERE accId = @id';
            params.push({ name: 'id', type: sql.Int, value: id });
    
            const request = connection.request();
            params.forEach(param => {
                request.input(param.name, param.type, param.value);
            });
    
            await request.query(sqlQuery);
    
            return await this.getAccountById(id); 
        } catch (err) {
            console.error("SQL error", err);
            throw err;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async deleteAccount(id) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `DELETE FROM Account WHERE accId = @id`; 

        const request = connection.request();
        request.input("id", id);
        const result = await request.query(sqlQuery);

        connection.close();

        return result.rowsAffected > 0; 
    }

    static async loginAccount(loginAccountData) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Account WHERE accEmail = @accEmail AND accPassword = @accPassword`; 

        const request = connection.request();
        request.input("accEmail", loginAccountData.accEmail);
        request.input("accPassword", loginAccountData.accPassword);

        const result = await request.query(sqlQuery);

        connection.close();

        if (result.recordset[0]) {
            const account = new Account(
                result.recordset[0].accId,
                result.recordset[0].accName,
                result.recordset[0].accEmail,
                result.recordset[0].accPassword
            );
            const token = jwt.sign({ accId: account.accId.toString() }, secretKey, { expiresIn: '8h' });
            return token;
        } else {
            return null;
        }
    }
}

module.exports = Account;