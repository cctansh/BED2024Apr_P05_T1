// account.test.js
// Import required modules
const Account = require("../models/account.js");
const sql = require("mssql");
const dbConfig = require("../dbConfig");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Mock mssql, bcryptjs, and jsonwebtoken modules
jest.mock("mssql");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

// Test suite to get all accounts
describe("Account.getAllAccounts", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it("should retrieve all accounts from the database", async () => {
      // Mock the database response
      const mockRecords = [
        { accId: 1, accName: "User One", accEmail: "userone@example.com", accPassword: "hashedPassword1", accRole: "member" },
        { accId: 2, accName: "User Two", accEmail: "usertwo@example.com", accPassword: "hashedPassword2", accRole: "admin" },
      ];
  
      // Mock the connection and query
      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: mockRecords }),
        close: jest.fn(),
      });
  
      const accounts = await Account.getAllAccounts();
  
      // Assertions
      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(accounts).toHaveLength(2);
      expect(accounts[0]).toBeInstanceOf(Account);
      expect(accounts[0].accId).toBe(1);
      expect(accounts[1].accName).toBe("User Two");
    });
  
    it("should handle errors when retrieving accounts", async () => {
      // Mock the connection to throw an error
      sql.connect.mockRejectedValue(new Error("Database connection error"));
  
      await expect(Account.getAllAccounts()).rejects.toThrow("Database connection error");
    });
});

// Test suite to get account by accId
describe("Account.getAccountById", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it("should retrieve an account by ID from the database", async () => {
      const mockAccount = {
        accId: 1,
        accName: "User One",
        accEmail: "userone@example.com",
        accPassword: "hashedPassword1",
        accRole: "member"
      };
  
      // Mock the connection and query
      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: [mockAccount] }),
        close: jest.fn(),
      });
  
      const account = await Account.getAccountById(1);
  
      // Assertions
      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(account).toBeInstanceOf(Account);
      expect(account.accId).toBe(1);
      expect(account.accName).toBe("User One");
    });
  
    it("should return null if no account is found", async () => {
      // Mock the connection to return no records
      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: [] }),
        close: jest.fn(),
      });
  
      const account = await Account.getAccountById(1);
  
      // Assertions
      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(account).toBeNull();
    });
  
    it("should handle errors when retrieving the account", async () => {
      // Mock the connection to throw an error
      sql.connect.mockRejectedValue(new Error("Database connection error"));
  
      await expect(Account.getAccountById(1)).rejects.toThrow("Database connection error");
    });
});

// Test suite to create account
describe("Account.createAccount", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it("should create a new account and return the created account", async () => {
      const newAccountData = {
        accName: "User One",
        accEmail: "userone@example.com",
        accPassword: "password123",
        accRole: "member"
      };
  
      const hashedPassword = "hashedPassword123";
      const mockAccountId = 1;
  
      // Mock bcrypt methods
      bcrypt.genSalt.mockResolvedValue("salt");
      bcrypt.hash.mockResolvedValue(hashedPassword);
  
      // Mock the connection and query
      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: [{ accId: mockAccountId }] }),
        close: jest.fn(),
      });
  
      // Mock getAccountById to return the created account
      jest.spyOn(Account, 'getAccountById').mockResolvedValue(new Account(mockAccountId, newAccountData.accName, newAccountData.accEmail, hashedPassword, newAccountData.accRole));
  
      const account = await Account.createAccount(newAccountData);
  
      // Assertions
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(newAccountData.accPassword, "salt");
      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(account).toBeInstanceOf(Account);
      expect(account.accId).toBe(mockAccountId);
      expect(account.accName).toBe(newAccountData.accName);
      expect(account.accEmail).toBe(newAccountData.accEmail);
      expect(account.accRole).toBe(newAccountData.accRole);
    });
  
    it("should handle errors when creating an account", async () => {
      const newAccountData = {
        accName: "User One",
        accEmail: "userone@example.com",
        accPassword: "password123",
        accRole: "member"
      };
  
      // Mock bcrypt methods
      bcrypt.genSalt.mockResolvedValue("salt");
      bcrypt.hash.mockResolvedValue("hashedPassword123");
  
      // Mock the connection to throw an error
      sql.connect.mockRejectedValue(new Error("Database connection error"));
  
      await expect(Account.createAccount(newAccountData)).rejects.toThrow("Database connection error");
    });
});

// Test suite to update account
describe("Account.updateAccount", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it("should update an account and return the updated account", async () => {
      const id = 1;
      const newAccountData = {
        accName: "Updated User",
        accEmail: "updateduser@example.com",
        accPassword: "newpassword123"
      };
  
      const hashedPassword = "hashedNewPassword123";
      
      // Mock bcrypt methods
      bcrypt.genSalt.mockResolvedValue("salt");
      bcrypt.hash.mockResolvedValue(hashedPassword);
  
      // Mock the connection and query
      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({}),
        close: jest.fn(),
      });
  
      // Mock getAccountById to return the updated account
      jest.spyOn(Account, 'getAccountById').mockResolvedValue(new Account(id, newAccountData.accName, newAccountData.accEmail, hashedPassword, "user"));
  
      const updatedAccount = await Account.updateAccount(id, newAccountData);
  
      // Assertions
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(newAccountData.accPassword, "salt");
      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(updatedAccount).toBeInstanceOf(Account);
      expect(updatedAccount.accId).toBe(id);
      expect(updatedAccount.accName).toBe(newAccountData.accName);
      expect(updatedAccount.accEmail).toBe(newAccountData.accEmail);
    });
  
    it("should handle errors when updating an account", async () => {
      const id = 1;
      const newAccountData = {
        accName: "Updated User",
        accEmail: "updateduser@example.com"
      };
  
      // Mock bcrypt methods
      bcrypt.genSalt.mockResolvedValue("salt");
      bcrypt.hash.mockResolvedValue("hashedPassword123");
  
      // Mock the connection to throw an error
      sql.connect.mockRejectedValue(new Error("Database connection error"));
  
      await expect(Account.updateAccount(id, newAccountData)).rejects.toThrow("Database connection error");
    });
});

// Test suite to update account role
describe("Account.updateAccountRole", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it("should update the account role and return the updated account", async () => {
      const id = 1;
      const newRoleData = {
        accRole: "admin"
      };
  
      const mockAccount = new Account(
        id,
        "User One",
        "userone@example.com",
        "hashedPassword1",
        newRoleData.accRole
      );
  
      // Mock the connection and query
      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({}),
        close: jest.fn(),
      });
  
      // Mock getAccountById to return the updated account
      jest.spyOn(Account, 'getAccountById').mockResolvedValue(mockAccount);
  
      const updatedAccount = await Account.updateAccountRole(id, newRoleData);
  
      // Assertions
      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(updatedAccount).toBeInstanceOf(Account);
      expect(updatedAccount.accId).toBe(id);
      expect(updatedAccount.accRole).toBe(newRoleData.accRole);
    });
  
    it("should handle errors when updating the account role", async () => {
      const id = 1;
      const newRoleData = {
        accRole: "admin"
      };
  
      // Mock the connection to throw an error
      sql.connect.mockRejectedValue(new Error("Database connection error"));
  
      await expect(Account.updateAccountRole(id, newRoleData)).rejects.toThrow("Database connection error");
    });
});

// Test suite to delete account
describe("Account.deleteAccount", () => {
    const mockId = 1; // Example account ID

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should delete the account and return true if the account exists", async () => {
        // Mock the SQL connection and transaction
        const mockConnection = {
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                rowsAffected: [1] // Simulate that one row was affected in the final delete
            }),
            close: jest.fn(),
        };

        const mockTransaction = {
            begin: jest.fn().mockResolvedValue(),
            commit: jest.fn().mockResolvedValue(),
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                rowsAffected: [1] // Simulate that one row was affected for each delete
            }),
        };

        // Mock the sql.connect method to return the mock connection
        sql.connect.mockResolvedValue(mockConnection);
        // Mock the transaction constructor to return the mock transaction
        sql.Transaction = jest.fn(() => mockTransaction);

        // Call the deleteAccount method
        const result = await Account.deleteAccount(mockId);

        // Assertions
        expect(sql.connect).toHaveBeenCalledWith(dbConfig);
        expect(mockTransaction.begin).toHaveBeenCalled(); // Ensure transaction begins
        expect(mockTransaction.commit).toHaveBeenCalled(); // Ensure transaction commits
        expect(mockConnection.close).toHaveBeenCalled(); // Ensure connection is closed
        expect(result).toBe(true); // Expect the result to be true
    });

    it("should return false if an error occurs", async () => {
        // Mock the SQL connection to throw an error
        const mockConnection = {
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockRejectedValue(new Error("Database error")),
            close: jest.fn(),
        };

        const mockTransaction = {
            begin: jest.fn().mockResolvedValue(),
            commit: jest.fn().mockResolvedValue(),
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockRejectedValue(new Error("Database error")), // Simulate an error during the transaction query
        };
    
        // Mock the sql.connect method to return the mock connection
        sql.connect.mockResolvedValue(mockConnection);
        // Mock the transaction constructor to return the mock transaction
        sql.Transaction = jest.fn(() => mockTransaction);
    
        // Call the deleteAccount method
        const result = await Account.deleteAccount(mockId);
    
        // Assertions
        expect(result).toBe(false); // Expect false since there was an error
        expect(mockConnection.close).toHaveBeenCalled(); // Ensure connection is closed
    });
});

// Test suite to login account
describe("Account.loginAccount", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it("should log in successfully and return tokens", async () => {
      const loginAccountData = {
        accEmail: "user@example.com",
        accPassword: "password123"
      };
  
      const mockAccount = {
        accId: 1,
        accName: "User One",
        accEmail: loginAccountData.accEmail,
        accPassword: await bcrypt.hash(loginAccountData.accPassword, 10), // Hashed password
        accRole: "member"
      };
  
      // Mock the database connection and query
      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: [mockAccount] }),
        close: jest.fn(),
      });
  
      // Mock bcrypt.compare to return true
      bcrypt.compare.mockResolvedValue(true);
  
      // Mock token generation
      const mockToken = "mockAccessToken";
      const mockRefreshToken = "mockRefreshToken";
      jwt.sign.mockReturnValue(mockRefreshToken);
      Account.generateAccessToken = jest.fn().mockResolvedValue(mockToken);
  
      // Call the loginAccount method
      const result = await Account.loginAccount(loginAccountData);
  
      // Assertions
      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginAccountData.accPassword, mockAccount.accPassword);
      expect(result).toEqual({ token: mockToken, refreshToken: mockRefreshToken });
    });
  
    it("should return null if the email does not exist", async () => {
      const loginAccountData = {
        accEmail: "nonexistent@example.com",
        accPassword: "password123"
      };
  
      // Mock the database connection and query to return no results
      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: [] }),
        close: jest.fn(),
      });
  
      const result = await Account.loginAccount(loginAccountData);
  
      // Assertions
      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(result).toBeNull();
    });
  
    it("should return null if the password does not match", async () => {
      const loginAccountData = {
        accEmail: "user@example.com",
        accPassword: "wrongpassword"
      };
  
      const mockAccount = {
        accId: 1,
        accName: "User One",
        accEmail: loginAccountData.accEmail,
        accPassword: await bcrypt.hash("password123", 10), // Correct hashed password
        accRole: "member"
      };
  
      // Mock the database connection and query
      sql.connect.mockResolvedValue({
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: [mockAccount] }),
        close: jest.fn(),
      });
  
      // Mock bcrypt.compare to return false
      bcrypt.compare.mockResolvedValue(false);
  
      const result = await Account.loginAccount(loginAccountData);
  
      // Assertions
      expect(sql.connect).toHaveBeenCalledWith(dbConfig);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginAccountData.accPassword, mockAccount.accPassword);
      expect(result).toBeNull();
    });
});

// Test suite to generate access token
describe('Account.generateAccessToken', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should generate a valid access token', async () => {
        // Mock payload for the token
        const payload = {
            userId: 123,
            username: 'example_user',
        };

        // Mock environment variables (if necessary)
        process.env.ACCESS_TOKEN_SECRET = 'your_secret_key';

        // Spy on jwt.sign to ensure it's called with the correct parameters
        const signSpy = jest.spyOn(jwt, 'sign').mockReturnValue('mockAccessToken');

        // Call the static method to generate the token
        const token = await Account.generateAccessToken(payload);

        // Assertions
        expect(token).toEqual('mockAccessToken');

        // Verify token content and validity
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);        
    });
});

// Test suite to generate refresh access token
describe("Account.refreshAccessToken", () => {
    const mockRefreshToken = "mockRefreshToken";
    const mockDecodedToken = { accId: 1, accRole: "member" };
    const mockAccessToken = "mockAccessToken";

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.REFRESH_TOKEN_SECRET = "your_refresh_token_secret"; // Set your secret key for testing
    });

    it("should return a new access token if the refresh token is valid", async () => {
        // Mock the SQL connection and query
        sql.connect.mockResolvedValue({
            request: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: [{ refreshToken: await bcrypt.hash(mockRefreshToken, 10) }] // Store a hashed refresh token
            }),
            close: jest.fn(),
        });

        // Mock bcrypt.compare to return true
        bcrypt.compare.mockResolvedValue(true);

        // Mock jwt.verify to call the callback with the decoded token
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(null, mockDecodedToken); // Simulate successful verification
        });

        // Mock the generateAccessToken method
        Account.generateAccessToken = jest.fn().mockResolvedValue(mockAccessToken);

        // Call the refreshAccessToken method
        const accessToken = await Account.refreshAccessToken(mockRefreshToken);

        // Assertions
        expect(sql.connect).toHaveBeenCalledWith(dbConfig);
        expect(bcrypt.compare).toHaveBeenCalledWith(mockRefreshToken, expect.any(String)); // Expect comparison with the hashed token
        expect(jwt.verify).toHaveBeenCalledWith(mockRefreshToken, process.env.REFRESH_TOKEN_SECRET, expect.any(Function));
        expect(Account.generateAccessToken).toHaveBeenCalledWith(mockDecodedToken);
        expect(accessToken).toBe(mockAccessToken); // Expect the returned access token to match the mock
    });

    it("should return null if the refresh token is invalid", async () => {
        // Mock the SQL connection and query to return a refresh token
        sql.connect.mockResolvedValue({
            request: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: [{ refreshToken: await bcrypt.hash("otherToken", 10) }] // Store a different hashed token
            }),
            close: jest.fn(),
        });

        // Mock bcrypt.compare to return false
        bcrypt.compare.mockResolvedValue(false);

        // Call the refreshAccessToken method
        const accessToken = await Account.refreshAccessToken(mockRefreshToken);

        // Assertions
        expect(accessToken).toBeNull(); // Expect null since the refresh token does not match
    });

    it("should return null if no refresh tokens are found", async () => {
        // Mock the SQL connection and query to return no results
        sql.connect.mockResolvedValue({
            request: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: [] // No refresh tokens found
            }),
            close: jest.fn(),
        });

        // Call the refreshAccessToken method
        const accessToken = await Account.refreshAccessToken(mockRefreshToken);

        // Assertions
        expect(accessToken).toBeNull(); // Expect null since no refresh tokens were found
    });

    it("should return null if there is an error", async () => {
        // Mock the SQL connection to throw an error
        sql.connect.mockRejectedValue(new Error("Database connection error"));

        // Call the refreshAccessToken method
        const accessToken = await Account.refreshAccessToken(mockRefreshToken);

        // Assertions
        expect(accessToken).toBeNull(); // Expect null since there was an error
    });
});

// Test suite for logout
describe("Account.logout", () => {
    const mockRefreshToken = "mockRefreshToken";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should log out successfully and return true if the token is found and deleted", async () => {
        // Mock the SQL connection and query to return a refresh token
        const mockConnection = {
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: [{ refreshToken: await bcrypt.hash(mockRefreshToken, 10) }], // Store a hashed refresh token
                rowsAffected: [1] // Simulate that one row was affected
            }),
            close: jest.fn(),
        };

        // Mock the sql.connect method to return the mock connection
        sql.connect.mockResolvedValue(mockConnection);

        // Mock bcrypt.compare to return true
        bcrypt.compare.mockResolvedValue(true);

        // Call the logout method
        const result = await Account.logout(mockRefreshToken);

        // Assertions
        expect(sql.connect).toHaveBeenCalledWith(dbConfig);
        expect(bcrypt.compare).toHaveBeenCalledWith(mockRefreshToken, expect.any(String)); // Expect comparison with the hashed token
        expect(result).toBe(true); // Expect the result to be true
    });

    it("should return null if no refresh tokens are found", async () => {
        // Mock the SQL connection and query to return no results
        const mockConnection = {
            request: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: [], // No refresh tokens found
                rowsAffected: [0]
            }),
            close: jest.fn(),
        };

        // Mock the sql.connect method to return the mock connection
        sql.connect.mockResolvedValue(mockConnection);

        // Call the logout method
        const result = await Account.logout(mockRefreshToken);

        // Assertions
        expect(result).toBeNull(); // Expect null since no refresh tokens were found
    });

    it("should return null if the refresh token does not match", async () => {
        // Mock the SQL connection and query to return a refresh token
        const mockConnection = {
            request: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: [{ refreshToken: await bcrypt.hash("otherToken", 10) }], // Store a different hashed token
                rowsAffected: [0]
            }),
            close: jest.fn(),
        };

        // Mock the sql.connect method to return the mock connection
        sql.connect.mockResolvedValue(mockConnection);

        // Mock bcrypt.compare to return false
        bcrypt.compare.mockResolvedValue(false);

        // Call the logout method
        const result = await Account.logout(mockRefreshToken);

        // Assertions
        expect(result).toBeNull(); // Expect null since the refresh token does not match
    });
});

// Test suite to get posts and replies by account
describe("Account.getPostsAndRepliesByAccount", () => {
    const mockId = 1; // Example account ID

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return posts and replies for the given account ID", async () => {
        // Mock the SQL connection and query
        const mockConnection = {
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: [
                    {
                        Type: 'Post',
                        Id: 1,
                        DateTime: new Date(),
                        Title: 'Post Title 1',
                        Text: 'This is the first post.',
                        Edited: false,
                        adminEdited: false,
                        ReplyTo: null,
                        accId: mockId
                    },
                    {
                        Type: 'Reply',
                        Id: 2,
                        DateTime: new Date(),
                        Title: null,
                        Text: 'This is a reply to the post.',
                        Edited: false,
                        adminEdited: false,
                        ReplyTo: 1,
                        accId: mockId
                    }
                ]
            }),
            close: jest.fn(),
        };

        // Mock the sql.connect method to return the mock connection
        sql.connect.mockResolvedValue(mockConnection);

        // Call the getPostsAndRepliesByAccount method
        const result = await Account.getPostsAndRepliesByAccount(mockId);

        // Assertions
        expect(sql.connect).toHaveBeenCalledWith(dbConfig);
        expect(mockConnection.request).toHaveBeenCalled();
        expect(mockConnection.input).toHaveBeenCalledWith("id", mockId);
        expect(mockConnection.query).toHaveBeenCalled(); // Ensure the query was executed
        expect(result).toEqual([
            {
                type: 'Post',
                id: 1,
                dateTime: expect.any(Date),
                title: 'Post Title 1',
                text: 'This is the first post.',
                edited: false,
                adminEdited: false,
                replyto: null,
                accId: mockId
            },
            {
                type: 'Reply',
                id: 2,
                dateTime: expect.any(Date),
                title: null,
                text: 'This is a reply to the post.',
                edited: false,
                adminEdited: false,
                replyto: 1,
                accId: mockId
            }
        ]);
    });

    it("should return an empty array if no posts or replies are found", async () => {
        // Mock the SQL connection and query to return no results
        const mockConnection = {
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: [] // No posts or replies found
            }),
            close: jest.fn(),
        };

        // Mock the sql.connect method to return the mock connection
        sql.connect.mockResolvedValue(mockConnection);

        // Call the getPostsAndRepliesByAccount method
        const result = await Account.getPostsAndRepliesByAccount(mockId);

        // Assertions
        expect(result).toEqual([]); // Expect an empty array since no records were found
    });
});

// Test suite to get account by email
describe("Account.getAccountByEmail", () => {
    const mockEmail = "user@example.com";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return an account object if the account exists", async () => {
        // Mock the SQL connection and query to return an account
        const mockConnection = {
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: [{
                    accId: 1,
                    accName: "User One",
                    accEmail: mockEmail,
                    accPassword: "hashedPassword",
                    accRole: "member"
                }]
            }),
            close: jest.fn(),
        };

        // Mock the sql.connect method to return the mock connection
        sql.connect.mockResolvedValue(mockConnection);

        // Call the getAccountByEmail method
        const result = await Account.getAccountByEmail(mockEmail);

        // Assertions
        expect(sql.connect).toHaveBeenCalledWith(dbConfig);
        expect(mockConnection.request).toHaveBeenCalled();
        expect(mockConnection.input).toHaveBeenCalledWith("accEmail", mockEmail);
        expect(mockConnection.query).toHaveBeenCalled(); // Ensure the query was executed
        expect(result).toBeInstanceOf(Account); // Expect the result to be an instance of Account
        expect(result).toEqual(expect.objectContaining({
            accId: 1,
            accName: "User One",
            accEmail: mockEmail,
            accRole: "member"
        }));
    });

    it("should return null if no account exists", async () => {
        // Mock the SQL connection and query to return no results
        const mockConnection = {
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: [] // No accounts found
            }),
            close: jest.fn(),
        };

        // Mock the sql.connect method to return the mock connection
        sql.connect.mockResolvedValue(mockConnection);

        // Call the getAccountByEmail method
        const result = await Account.getAccountByEmail(mockEmail);

        // Assertions
        expect(result).toBeNull(); // Expect null since no account was found
    });
});

// Test suite to get account by name
describe("Account.getAccountByName", () => {
    const mockName = "User One";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return an account object if the account exists", async () => {
        // Mock the SQL connection and query to return an account
        const mockConnection = {
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: [{
                    accId: 1,
                    accName: mockName,
                    accEmail: "user@example.com",
                    accPassword: "hashedPassword",
                    accRole: "member"
                }]
            }),
            close: jest.fn(),
        };

        // Mock the sql.connect method to return the mock connection
        sql.connect.mockResolvedValue(mockConnection);

        // Call the getAccountByName method
        const result = await Account.getAccountByName(mockName);

        // Assertions
        expect(sql.connect).toHaveBeenCalledWith(dbConfig);
        expect(mockConnection.request).toHaveBeenCalled();
        expect(mockConnection.input).toHaveBeenCalledWith("accName", mockName);
        expect(mockConnection.query).toHaveBeenCalled(); // Ensure the query was executed
        expect(result).toBeInstanceOf(Account); // Expect the result to be an instance of Account
        expect(result).toEqual(expect.objectContaining({
            accId: 1,
            accName: mockName,
            accEmail: "user@example.com",
            accRole: "member"
        }));
    });

    it("should return null if no account exists", async () => {
        // Mock the SQL connection and query to return no results
        const mockConnection = {
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: [] // No accounts found
            }),
            close: jest.fn(),
        };

        // Mock the sql.connect method to return the mock connection
        sql.connect.mockResolvedValue(mockConnection);

        // Call the getAccountByName method
        const result = await Account.getAccountByName(mockName);

        // Assertions
        expect(result).toBeNull(); // Expect null since no account was found
    });
});