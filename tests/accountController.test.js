// accountController.test.js
const accountController = require("../controllers/accountController.js");
const Account = require("../models/account.js");
const bcrypt = require("bcryptjs");

// Mock the Post model
jest.mock("../models/Account"); // Replace with the actual path to your Post model
jest.mock("bcryptjs");

describe("accountController.getAllAccounts", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it("should fetch all accounts and return a JSON response", async () => {
      const mockAccounts = [
        { accId: 1, accUsername: "user1", accPassword: "hashedPassword1", accFirstName: "John", accLastName: "Doe", accEmail: "john@example.com", accRole: "member" },
        { accId: 2, accUsername: "user2", accPassword: "hashedPassword2", accFirstName: "Jane", accLastName: "Smith", accEmail: "jane@example.com", accRole: "admin" },
      ];
  
      // Mock the Account.getAllAccounts function to return the mock data
      Account.getAllAccounts.mockResolvedValue(mockAccounts);
  
      const req = {};
      const res = {
        json: jest.fn(),
      };
  
      await accountController.getAllAccounts(req, res);
  
      expect(Account.getAllAccounts).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockAccounts);
    });
  
    it("should handle errors and return a 500 status with error message", async () => {
      const errorMessage = "Database error";
      Account.getAllAccounts.mockRejectedValue(new Error(errorMessage));
  
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
  
      await accountController.getAllAccounts(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error retrieving accounts");
    }); 
});

// retrieve account by accid
describe("accountController.getAccountById", () => {
    let req, res;
  
    beforeEach(() => {
      jest.clearAllMocks();
      req = {
        params: {}
      };
      res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
    });
  
    it("should fetch an account by id and return a JSON response", async () => {
      const mockAccount = {
        accId: 1,
        accUsername: "user1",
        accFirstName: "John",
        accLastName: "Doe",
        accEmail: "john@example.com",
        accRole: "member"
      };
  
      req.params.id = "1";
      Account.getAccountById.mockResolvedValue(mockAccount);
  
      await accountController.getAccountById(req, res);
  
      expect(Account.getAccountById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockAccount);
    });
  
    it("should return 404 if account is not found", async () => {
      req.params.id = "999";
      Account.getAccountById.mockResolvedValue(null);
  
      await accountController.getAccountById(req, res);
  
      expect(Account.getAccountById).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("Account not found");
    });
  
    it("should handle errors and return a 500 status with error message", async () => {
      req.params.id = "1";
      const errorMessage = "Database error";
      Account.getAccountById.mockRejectedValue(new Error(errorMessage));
  
      await accountController.getAccountById(req, res);
  
      expect(Account.getAccountById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error retrieving account");
    });
  
    it("should handle non-integer id parameter", async () => {
      req.params.id = "abc";
  
      await accountController.getAccountById(req, res);
  
      expect(Account.getAccountById).toHaveBeenCalledWith(NaN);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error retrieving account");
    });
});

// create account
describe("accountController.createAccount", () => {
    let req, res;
  
    beforeEach(() => {
      jest.clearAllMocks();
      req = {
        body: {
          accEmail: "test@example.com",
          accName: "TestUser",
          // Add other required fields here
        }
      };
      res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
    });
  
    it("should create a new account and return 201 status", async () => {
      const mockCreatedAccount = { ...req.body, accId: 1 };
      
      Account.getAccountByEmail.mockResolvedValue(null);
      Account.getAccountByName.mockResolvedValue(null);
      Account.createAccount.mockResolvedValue(mockCreatedAccount);
  
      await accountController.createAccount(req, res);
  
      expect(Account.getAccountByEmail).toHaveBeenCalledWith("test@example.com");
      expect(Account.getAccountByName).toHaveBeenCalledWith("TestUser");
      expect(Account.createAccount).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCreatedAccount);
    });
  
    it("should return 400 if email is already in use", async () => {
      Account.getAccountByEmail.mockResolvedValue({ accEmail: "test@example.com" });
  
      await accountController.createAccount(req, res);
  
      expect(Account.getAccountByEmail).toHaveBeenCalledWith("test@example.com");
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email is already in use" });
    });
  
    it("should return 400 if display name is already in use", async () => {
      Account.getAccountByEmail.mockResolvedValue(null);
      Account.getAccountByName.mockResolvedValue({ accName: "TestUser" });
  
      await accountController.createAccount(req, res);
  
      expect(Account.getAccountByEmail).toHaveBeenCalledWith("test@example.com");
      expect(Account.getAccountByName).toHaveBeenCalledWith("TestUser");
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Display name is already in use" });
    });
  
    it("should handle errors and return 500 status", async () => {
      Account.getAccountByEmail.mockResolvedValue(null);
      Account.getAccountByName.mockResolvedValue(null);
      Account.createAccount.mockRejectedValue(new Error("Database error"));
  
      await accountController.createAccount(req, res);
  
      expect(Account.getAccountByEmail).toHaveBeenCalledWith("test@example.com");
      expect(Account.getAccountByName).toHaveBeenCalledWith("TestUser");
      expect(Account.createAccount).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error creating account");
    });
});

// update account
describe("accountController.updateAccount", () => {
    let req, res;
  
    beforeEach(() => {
      jest.clearAllMocks();
      req = {
        params: { id: "1" },
        body: {
          accEmail: "updated@example.com",
          accName: "UpdatedUser",
          // Add other fields as needed
        },
        user: {
          accId: 1 // Assuming the user is authenticated and their ID is available
        }
      };
      res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
    });
  
    it("should update an account and return the updated account", async () => {
      const mockAccount = {
        accId: 1,
        accEmail: "test@example.com",
        accName: "TestUser",
        // Add other fields as needed
      };
  
      const mockUpdatedAccount = {
        accId: 1,
        accEmail: "updated@example.com",
        accName: "UpdatedUser",
        // Add other fields as needed
      };
  
      Account.getAccountById.mockResolvedValue(mockAccount);
      Account.updateAccount.mockResolvedValue(mockUpdatedAccount);
  
      await accountController.updateAccount(req, res);
  
      expect(Account.getAccountById).toHaveBeenCalledWith(1);
      expect(Account.updateAccount).toHaveBeenCalledWith(1, req.body);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedAccount);
    });
  
    it("should return 404 if account is not found", async () => {
      Account.getAccountById.mockResolvedValue(null);
  
      await accountController.updateAccount(req, res);
  
      expect(Account.getAccountById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("Account not found");
    });
  
    it("should return 403 if user is not authorized to update the account", async () => {
      const mockAccount = {
        accId: 2,
        accEmail: "test@example.com",
        accName: "TestUser",
        // Add other fields as needed
      };
  
      Account.getAccountById.mockResolvedValue(mockAccount);
  
      await accountController.updateAccount(req, res);
  
      expect(Account.getAccountById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "You are not authorized to update this account" });
    });
  
    it("should handle errors and return 500 status", async () => {
      const errorMessage = "Database error";
      Account.getAccountById.mockRejectedValue(new Error(errorMessage));
  
      await accountController.updateAccount(req, res);
  
      expect(Account.getAccountById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error updating account");
    });
});

// update account role
describe("accountController.updateAccountRole", () => {
    let req, res;
  
    beforeEach(() => {
      jest.clearAllMocks();
      req = {
        params: { id: "1" },
        body: {
          accRole: "member" // New role data
        },
        user: {
          accRole: "admin" // Assuming the user is authenticated and their role is available
        }
      };
      res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
    });
  
    it("should update an account role and return the updated account", async () => {
      const mockAccount = {
        accId: 1,
        accRole: "member",
        // Add other fields as needed
      };
  
      const mockUpdatedAccount = {
        accId: 1,
        accRole: "admin",
        // Add other fields as needed
      };
  
      Account.getAccountById.mockResolvedValue(mockAccount);
      Account.updateAccountRole.mockResolvedValue(mockUpdatedAccount);
  
      await accountController.updateAccountRole(req, res);
  
      expect(Account.getAccountById).toHaveBeenCalledWith(1);
      expect(Account.updateAccountRole).toHaveBeenCalledWith(1, req.body);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedAccount);
    });
  
    it("should return 404 if account is not found", async () => {
      Account.getAccountById.mockResolvedValue(null);
  
      await accountController.updateAccountRole(req, res);
  
      expect(Account.getAccountById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("Account not found");
    });
  
    it("should return 403 if user is not authorized to update account roles", async () => {
      req.user.accRole = "member"; // Change the user role to non-admin
  
      const mockAccount = {
        accId: 1,
        accRole: "member",
        // Add other fields as needed
      };
  
      Account.getAccountById.mockResolvedValue(mockAccount);
  
      await accountController.updateAccountRole(req, res);
  
      expect(Account.getAccountById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "You are not authorized to update account roles" });
    });
  
    it("should handle errors and return 500 status", async () => {
      const errorMessage = "Database error";
      Account.getAccountById.mockRejectedValue(new Error(errorMessage));
  
      await accountController.updateAccountRole(req, res);
  
      expect(Account.getAccountById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error updating account");
    });
});

// delete account
describe("accountController.deleteAccount", () => {
    let req, res;
  
    beforeEach(() => {
      jest.clearAllMocks();
      req = {
        params: { id: "1" },
        user: {
          accId: 1, // Assuming the user is authenticated and their ID is available
          accRole: "admin" // Assuming the user role is available
        }
      };
      res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
    });
  
    it("should delete an account and return 204 status", async () => {
      const mockAccount = {
        accId: 1,
        accEmail: "test@example.com",
        accName: "TestUser",
        // Add other fields as needed
      };
  
      Account.getAccountById.mockResolvedValue(mockAccount);
      Account.deleteAccount.mockResolvedValue(true);
  
      await accountController.deleteAccount(req, res);
  
      expect(Account.getAccountById).toHaveBeenCalledWith(1);
      expect(Account.deleteAccount).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  
    it("should return 404 if account is not found", async () => {
      Account.getAccountById.mockResolvedValue(null);
  
      await accountController.deleteAccount(req, res);
  
      expect(Account.getAccountById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("Account not found");
    });
  
    it("should return 403 if user is not authorized to delete the account", async () => {
      const mockAccount = {
        accId: 2,
        accEmail: "test@example.com",
        accName: "TestUser",
        // Add other fields as needed
      };
  
      req.user.accRole = "member"; // Change the user role to non-admin
      Account.getAccountById.mockResolvedValue(mockAccount);
  
      await accountController.deleteAccount(req, res);
  
      expect(Account.getAccountById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "You are not authorized to delete this account" });
    });
  
    it("should handle errors and return 500 status", async () => {
      const errorMessage = "Database error";
      Account.getAccountById.mockRejectedValue(new Error(errorMessage));
  
      await accountController.deleteAccount(req, res);
  
      expect(Account.getAccountById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error deleting account");
    });
});

// login account
describe("accountController.loginAccount", () => {
    let req, res;
  
    beforeEach(() => {
      jest.clearAllMocks();
      req = {
        body: {
          email: "test@example.com",
          password: "password123"
        }
      };
      res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
    });
  
    it("should log in an account and return a token and refresh token", async () => {
      const mockTokens = {
        token: "mockToken123",
        refreshToken: "mockRefreshToken123"
      };
  
      Account.loginAccount.mockResolvedValue(mockTokens);
  
      await accountController.loginAccount(req, res);
  
      expect(Account.loginAccount).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Login successful",
        token: mockTokens.token,
        refreshToken: mockTokens.refreshToken
      });
    });
  
    it("should return 404 if invalid email or password", async () => {
      Account.loginAccount.mockResolvedValue({ token: null });
  
      await accountController.loginAccount(req, res);
  
      expect(Account.loginAccount).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("Invalid email or password");
    });
  
    it("should handle errors and return 500 status", async () => {
      const errorMessage = "Database error";
      Account.loginAccount.mockRejectedValue(new Error(errorMessage));
  
      await accountController.loginAccount(req, res);
  
      expect(Account.loginAccount).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error retrieving account");
    });
});

// refresh access token
describe("accountController.refreshAccessToken", () => {
    let req, res;
  
    beforeEach(() => {
      jest.clearAllMocks();
      req = {
        headers: {
          authorization: "Bearer validRefreshToken"
        }
      };
      res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
    });
  
    it("should refresh the access token and return it", async () => {
      const mockToken = "newAccessToken123";
  
      Account.refreshAccessToken.mockResolvedValue(mockToken);
  
      await accountController.refreshAccessToken(req, res);
  
      expect(Account.refreshAccessToken).toHaveBeenCalledWith("validRefreshToken");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "successful",
        token: mockToken
      });
    });
  
    it("should return 404 if the refresh token is invalid", async () => {
      Account.refreshAccessToken.mockResolvedValue(null);
  
      await accountController.refreshAccessToken(req, res);
  
      expect(Account.refreshAccessToken).toHaveBeenCalledWith("validRefreshToken");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("Invalid refresh token");
    });
  
    it("should handle errors and return 500 status", async () => {
      const errorMessage = "Database error";
      Account.refreshAccessToken.mockRejectedValue(new Error(errorMessage));
  
      await accountController.refreshAccessToken(req, res);
  
      expect(Account.refreshAccessToken).toHaveBeenCalledWith("validRefreshToken");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error generating token");
    });
});

// logout
describe("accountController.logout", () => {
    let req, res;
  
    beforeEach(() => {
      jest.clearAllMocks();
      req = {
        headers: {
          authorization: "Bearer validRefreshToken"
        }
      };
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
    });
  
    it("should log out successfully and return 204 status", async () => {
      Account.logout.mockResolvedValue(true); // Mock successful logout
  
      await accountController.logout(req, res);
  
      expect(Account.logout).toHaveBeenCalledWith("validRefreshToken");
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  
    it("should return 404 if logout is unsuccessful", async () => {
      Account.logout.mockResolvedValue(false); // Mock unsuccessful logout
  
      await accountController.logout(req, res);
  
      expect(Account.logout).toHaveBeenCalledWith("validRefreshToken");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("Unsuccessful");
    });
  
    it("should handle errors and return 500 status", async () => {
      const errorMessage = "Database error";
      Account.logout.mockRejectedValue(new Error(errorMessage)); // Mock an error
  
      await accountController.logout(req, res);
  
      expect(Account.logout).toHaveBeenCalledWith("validRefreshToken");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error logging out");
    });
});

// get posts and replies by account
describe("accountController.getPostsAndRepliesByAccount", () => {
    let req, res;
  
    beforeEach(() => {
      jest.clearAllMocks();
      req = {
        params: { id: "1" } // Mock account ID
      };
      res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
    });
  
    it("should retrieve posts and replies for a given account", async () => {
      const mockPostsAndReplies = [
        { postId: 1, content: "Post 1", replies: [] },
        { postId: 2, content: "Post 2", replies: [{ replyId: 1, content: "Reply 1" }] }
      ];
  
      Account.getPostsAndRepliesByAccount.mockResolvedValue(mockPostsAndReplies);
  
      await accountController.getPostsAndRepliesByAccount(req, res);
  
      expect(Account.getPostsAndRepliesByAccount).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockPostsAndReplies);
    });
  
    it("should handle errors and return 500 status", async () => {
      const errorMessage = "Database error";
      Account.getPostsAndRepliesByAccount.mockRejectedValue(new Error(errorMessage));
  
      await accountController.getPostsAndRepliesByAccount(req, res);
  
      expect(Account.getPostsAndRepliesByAccount).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error retrieving posts and replies");
    });
});

// check password
describe("accountController.checkPassword", () => {
    let req, res;
  
    beforeEach(() => {
      jest.clearAllMocks();
      req = {
        body: {
          id: 1,
          password: "password123"
        },
        user: {
          accId: 1 // Assuming the user is authenticated and their ID is available
        }
      };
      res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
    });
  
    it("should return 404 if account is not found", async () => {
      Account.getAccountById.mockResolvedValue(null); // Mock account not found
  
      await accountController.checkPassword(req, res);
  
      expect(Account.getAccountById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Account not found" });
    });
  
    it("should return 403 if user is not authorized to check the password", async () => {
      const mockAccount = {
        accId: 2, // Different account ID
        accPassword: "hashedPassword"
      };
  
      Account.getAccountById.mockResolvedValue(mockAccount);
  
      await accountController.checkPassword(req, res);
  
      expect(Account.getAccountById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "You are not authorized to check this password" });
    });
  
    it("should return 401 if password does not match", async () => {
      const mockAccount = {
        accId: 1,
        accPassword: "hashedPassword"
      };
  
      Account.getAccountById.mockResolvedValue(mockAccount);
      bcrypt.compare.mockResolvedValue(false); // Mock password mismatch
  
      await accountController.checkPassword(req, res);
  
      expect(Account.getAccountById).toHaveBeenCalledWith(1);
      expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, mockAccount.accPassword);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
    });
  
    it("should return 200 if password matches", async () => {
      const mockAccount = {
        accId: 1,
        accPassword: "hashedPassword"
      };
  
      Account.getAccountById.mockResolvedValue(mockAccount);
      bcrypt.compare.mockResolvedValue(true); // Mock password match
  
      await accountController.checkPassword(req, res);
  
      expect(Account.getAccountById).toHaveBeenCalledWith(1);
      expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, mockAccount.accPassword);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Password match" });
    });
  
    it("should handle errors and return 500 status", async () => {
      const errorMessage = "Database error";
      Account.getAccountById.mockRejectedValue(new Error(errorMessage)); // Mock an error
  
      await accountController.checkPassword(req, res);
  
      expect(Account.getAccountById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error retrieving account");
    });
});