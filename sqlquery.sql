-- init database
USE master
IF EXISTS(select * from sys.databases where name='BEDAssignment')
DROP DATABASE BEDAssignment;
GO

Create Database BEDAssignment;
GO

use BEDAssignment;
GO

if exists (SELECT * FROM sysobjects 
  WHERE id = object_id('dbo.Account') and sysstat & 0xf = 3)
  DROP TABLE dbo.Account;
GO

if exists (SELECT * FROM sysobjects 
  WHERE id = object_id('dbo.Post') and sysstat & 0xf = 3)
  DROP TABLE dbo.Post;
GO

if exists (SELECT * FROM sysobjects 
  WHERE id = object_id('dbo.Reply') and sysstat & 0xf = 3)
  DROP TABLE dbo.Reply;
GO

-- TABLE CREATION
CREATE TABLE Account 
(
accId smallint IDENTITY(1,1),
accName varchar(50) NOT NULL,
accEmail varchar(120) NOT NULL,
accPassword varchar(50) NOT NULL,
CONSTRAINT PK_Account PRIMARY KEY (accId)
);

-- Added postTitle, postEdited
-- postTitle: title of the post
-- postEdited: 0 for default, 1 for edited
CREATE TABLE Post
( 
postId smallint IDENTITY(1,1),
postDateTime smalldatetime NOT NULL, 
postTitle varchar(255) NOT NULL,
postText varchar(8000) NOT NULL,
postEdited bit NOT NULL,
accId smallint NOT NULL,
CONSTRAINT PK_Post PRIMARY KEY (postId),
CONSTRAINT FK_Post_accId
FOREIGN KEY (accId) REFERENCES Account(accId)
); 

CREATE TABLE Reply
( 
replyId smallint IDENTITY(1,1), 
replyDateTime smalldatetime NOT NULL, 
replyText varchar(5000) NOT NULL,
replyEdited bit NOT NULL,
accId smallint NOT NULL,
replyTo smallint NOT NULL,
CONSTRAINT PK_Reply PRIMARY KEY (replyId),
CONSTRAINT FK_Reply_accId
FOREIGN KEY (accId) REFERENCES Account(accId),
CONSTRAINT FK_Reply_replyTo
FOREIGN KEY (replyTo) REFERENCES Post(postId)
); 

CREATE TABLE Questions 
(
questionId smallint IDENTITY(1,1),
questionText varchar(255) NOT NULL,
option1 varchar(255) NOT NULL,
option2 varchar(255) NOT NULL,
option3 varchar(255) NOT NULL,
option4 varchar(255) NOT NULL,
correctOption varchar(255) NOT NULL,
CONSTRAINT PK_Questions PRIMARY KEY (questionId),
CONSTRAINT FK_Question_accId,
FOREIGN KEY (accId) REFERENCES Account(accId)
);

-- insert temp data for testing
INSERT INTO Account(accName, accEmail, accPassword)
VALUES ( 'account1' , 'hi@gmail.com' , 'abcd1234'),  
('account2' , 'hello@yahoo.com.sg' , 'abcd1234'),
('account3' , 'haha@yahoo.com.sg' , 'abcd1234');

INSERT INTO Post(postDateTime, postTitle, postText, postEdited, accId)
VALUES ( '2024-05-25 16:56:00' , 'Welcome to Post 1', 'Post 1 contents', 0, 1),  
('2024-05-27 12:03:46' , 'Welcome to Post 2', 'Post 2 contents', 0, 2),
('2024-05-27 12:03:46' , 'Welcome to Post 3', 'Post 3 contents', 0, 1),
('2024-05-28 20:00:00' , 'Welcome to Post 4', 'Post 4 contents', 0, 3);

INSERT INTO Reply(replyDateTime, replyText, replyEdited, accId, replyTo)
VALUES ('2024-05-25 17:43:00' , 'This is Reply 1', 0, 2, 1),  
('2024-05-26 13:12:19' , 'This is Reply 2', 0, 1, 1);

-- select statements for testing
SELECT * FROM Account;
SELECT * FROM Post;
SELECT * FROM Reply;
