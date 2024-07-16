const sql = require("mssql");
const dbConfig = require("../dbConfig");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();

class Account {
    constructor(accId, accName, accEmail, accPassword, accRole) {
        this.accId = accId;
        this.accName = accName;
        this.accEmail = accEmail;
        this.accPassword = accPassword;
        this.accRole = accRole;
    }

    static async getAllAccounts() {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Account`; 

        const request = connection.request();
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset.map(
        (row) => new Account(row.accId, row.accName, row.accEmail, row.accPassword, row.accRole)
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
            result.recordset[0].accPassword,
            result.recordset[0].accRole
            )
        : null; 
    }

    static async createAccount(newAccountData) {
        //hashing password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newAccountData.accPassword, salt);

        const connection = await sql.connect(dbConfig);

        const sqlQuery = `INSERT INTO Account (accName, accEmail, accPassword, accRole) VALUES (@accName, @accEmail, @accPassword, @accRole); SELECT SCOPE_IDENTITY() AS accId;`; 

        const request = connection.request();
        request.input("accName", newAccountData.accName);
        request.input("accEmail", newAccountData.accEmail);
        request.input("accPassword", hashedPassword);
        request.input("accRole", newAccountData.accRole);

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
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(newAccountData.accPassword, salt);
                sqlQuery += 'accPassword = @accPassword, ';
                params.push({ name: 'accPassword', type: sql.VarChar, value: hashedPassword });
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

    static async updateAccountRole(id, newRoleData) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `UPDATE Account SET accRole = @accRole WHERE accId = @id`;

        const request = connection.request();
        request.input("id", id);
        request.input("accRole", newRoleData.accRole);

        await request.query(sqlQuery);

        connection.close();

        return await this.getAccountById(id);
    }

    static async deleteAccount(id) {
        const connection = await sql.connect(dbConfig);

        try {
            const transaction = new sql.Transaction(connection);
            await transaction.begin();
    
            // Delete replies
            const deleteRepliesQuery = `
                DELETE FROM Reply
                WHERE accId = @id;
            `;
            await transaction.request().input("id", id).query(deleteRepliesQuery);

            // Delete replies referencing posts
            const deleteRepliesToPostsQuery = `
                DELETE FROM Reply
                WHERE replyTo IN (
                    SELECT postId FROM Post WHERE accId = @id
                );
            `;
            await transaction.request().input("id", sql.Int, id).query(deleteRepliesToPostsQuery);
    
            // Delete posts
            const deletePostQuery = `
                DELETE FROM Post
                WHERE accId = @id;
            `;
            await transaction.request().input("id", id).query(deletePostQuery);

            const deleteAccQuery = `
            DELETE FROM Account
            WHERE accId = @id;
            `;
            const result = await transaction.request().input("id", id).query(deleteAccQuery);
    
            await transaction.commit();
            connection.close();
    
            return result.rowsAffected[0] > 0; // Return true if at least one row was affected
        } catch (err) {
            console.error("Error deleting accout:", err);
            connection.close();
            return false;
        }
    }

    static async loginAccount(loginAccountData) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Account WHERE accEmail = @accEmail`; 

        const request = connection.request();
        request.input("accEmail", loginAccountData.accEmail);

        const result = await request.query(sqlQuery);

        connection.close();

        if (result.recordset[0]) {
            const passwordMatch = await bcrypt.compare(loginAccountData.accPassword, result.recordset[0].accPassword);
            if (passwordMatch) {
                const account = new Account(
                    result.recordset[0].accId,
                    result.recordset[0].accName,
                    result.recordset[0].accEmail,
                    result.recordset[0].accPassword,
                    result.recordset[0].accRole
                );
                const token = jwt.sign({ accId: account.accId.toString(), accRole: account.accRole }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
                return token;
            }
        } 
        return null;
    }

    static async getPostsAndRepliesByAccount(id) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `
            SELECT 
                'Post' AS Type,
                postId AS Id,
                postDateTime AS DateTime,
                postTitle AS Title,
                postText AS Text,
                postEdited AS Edited,
                NULL AS adminEdited,
                NULL AS ReplyTo,
                accId
            FROM 
                Post
            WHERE 
                accId = @id

            UNION

            SELECT 
                'Reply' AS Type,
                replyId AS Id,
                replyDateTime AS DateTime,
                NULL AS Title,
                replyText AS Text,
                replyEdited AS Edited,
                adminEdit AS adminEdited,
                replyTo AS ReplyTo,
                accId
            FROM 
                Reply
            WHERE 
                accId = @id
            ORDER BY 
                DateTime;
        `;

        const request = connection.request();
        request.input("id", id);
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset.map(row => ({
            type: row.Type,
            id: row.Id,
            dateTime: row.DateTime,
            title: row.Title,
            text: row.Text,
            edited: row.Edited,
            adminEdited: row.adminEdited,
            replyto: row.ReplyTo,
            accId: row.accId
        }));
    }

    // for checking create account
    static async getAccountByEmail(email) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Account WHERE accEmail = @accEmail`; 

        const request = connection.request();
        request.input("accEmail", email);
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset[0]
            ? new Account(
                result.recordset[0].accId,
                result.recordset[0].accName,
                result.recordset[0].accEmail,
                result.recordset[0].accPassword,
                result.recordset[0].accRole
                )
            : null;
    }

    static async getAccountByName(name) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Account WHERE accName = @accName`; 

        const request = connection.request();
        request.input("accName", name);
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset[0]
            ? new Account(
                result.recordset[0].accId,
                result.recordset[0].accName,
                result.recordset[0].accEmail,
                result.recordset[0].accPassword,
                result.recordset[0].accRole
                )
            : null;
    }
}

module.exports = Account;