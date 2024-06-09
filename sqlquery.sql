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

/* for switching to accId, remember to:
- fix frontend to display account name
*/
CREATE TABLE Post
( 
postId smallint IDENTITY(1,1), 
postDateTime smalldatetime NOT NULL, 
postText varchar(8000) NOT NULL,
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
accId smallint NOT NULL,
replyTo smallint NOT NULL,
CONSTRAINT PK_Reply PRIMARY KEY (replyId),
CONSTRAINT FK_Reply_accId
FOREIGN KEY (accId) REFERENCES Account(accId),
CONSTRAINT FK_Reply_replyTo
FOREIGN KEY (replyTo) REFERENCES Post(postId)
); 

-- insert temp data for testing
INSERT INTO Account(accName, accEmail, accPassword)
VALUES ( 'account1' , 'hi@gmail.com' , 'abcd1234'),  
('account2' , 'hello@yahoo.com.sg' , 'abcd1234');

INSERT INTO Post(postDateTime, postText, accId)
VALUES ( '2024-05-25 16:56:00' , 'Welcome to Post 1', 1),  
('2024-05-27 12:03:46' , 'Welcome to Post 2', 2),
('2024-05-27 12:03:46' , 'Welcome to Post 3', 1);

INSERT INTO Reply(replyDateTime, replyText, accId, replyTo)
VALUES ('2024-05-25 17:43:00' , 'This is Reply 1', 2, 1),  
('2024-05-26 13:12:19' , 'This is Reply 2', 1, 1);

-- select statements for testing
SELECT * FROM Account;
SELECT * FROM Post;
SELECT * FROM Reply;