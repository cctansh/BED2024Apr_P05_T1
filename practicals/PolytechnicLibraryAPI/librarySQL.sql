-- init database
USE master
IF EXISTS(select * from sys.databases where name='BEDAssignmentLibrary')
DROP DATABASE BEDAssignmentLibrary;
GO

Create Database BEDAssignmentLibrary;
GO

use BEDAssignmentLibrary;
GO

if exists (SELECT * FROM sysobjects 
  WHERE id = object_id('dbo.Users') and sysstat & 0xf = 3)
  DROP TABLE dbo.Users;
GO

-- Users Table
CREATE TABLE Users (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    username VARCHAR(255) UNIQUE NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('member', 'librarian')) NOT NULL
);

-- Books Table
CREATE TABLE Books (
    book_id INT PRIMARY KEY IDENTITY(1,1),
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    availability CHAR(1) CHECK (availability IN ('Y', 'N')) NOT NULL
);

-- Books Data
INSERT INTO Books(title, author, availability)
VALUES ( 'title1', 'author1', 'Y'),
( 'title2', 'author2', 'N'),
( 'title3', 'author3', 'Y');