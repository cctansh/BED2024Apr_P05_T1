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
  WHERE id = object_id('dbo.Post') and sysstat & 0xf = 3)
  DROP TABLE dbo.Post;
GO

if exists (SELECT * FROM sysobjects 
  WHERE id = object_id('dbo.Reply') and sysstat & 0xf = 3)
  DROP TABLE dbo.Reply;
GO

-- TABLE CREATION
-- need to add user table, link to post/reply authors 
CREATE TABLE Post
( 
postId smallint IDENTITY(1,1), 
postAuthor varchar(100) NOT NULL, 
postDateTime smalldatetime NOT NULL, 
postText varchar(8000) NOT NULL,
CONSTRAINT PK_Post PRIMARY KEY (postId) 
); 

CREATE TABLE Reply
( 
replyId smallint IDENTITY(1,1), 
replyAuthor varchar(100) NOT NULL, 
replyDateTime smalldatetime NOT NULL, 
replyText varchar(5000) NOT NULL,
replyTo smallint NOT NULL,
CONSTRAINT PK_Reply PRIMARY KEY (replyId),
CONSTRAINT FK_Reply_ReplyTo
FOREIGN KEY (replyTo) REFERENCES Post(postId)
); 

-- insert temp data for testing
INSERT INTO Post(postAuthor, postDateTime, postText)
VALUES ( 'account1' , '2024-05-25 16:56:00' , 'Welcome to Post 1'),  
('account2' , '2024-05-27 12:03:46' , 'Welcome to Post 2');

INSERT INTO Reply(replyAuthor, replyDateTime, replyText, replyTo)
VALUES ( 'account2' , '2024-05-25 17:43:00' , 'This is Reply 1', 1),  
('account3' , '2024-05-26 13:12:19' , 'This is Reply 2', 1);

-- select statements for testing
SELECT * FROM Post;
SELECT * FROM Reply;