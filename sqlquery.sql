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

CREATE TABLE QuizQuestions (
    id INT IDENTITY PRIMARY KEY,
    question TEXT NOT NULL,
    image_path TEXT,
    
);


CREATE TABLE AnswerChoices (
    id INT IDENTITY PRIMARY KEY,
    question_id INT NOT NULL,
    answer_text TEXT,
    is_correct BIT,
    explanation TEXT,
    FOREIGN KEY (question_id) REFERENCES QuizQuestions(id)
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

-- Inserting data into QuizQuestions table
INSERT INTO QuizQuestions (question, image_path)
VALUES 
    ('What is the Singaporean government''s ''30 by 30'' goal for food security?', 'img/30by30.png'),
    ('How is Singapore addressing the challenge of limited land space for agriculture?', 'img/urbanfarmrooftop.png'),
    ('Which of the following is a key component of Singapore''s food security strategy?', 'img/diversefood.png'),
    ('What role does the Singapore Food Agency (SFA) play in ensuring food security?', NULL),
    ('What is one way that Singapore can reduce its reliance on food imports?', NULL);


-- Inserting data into AnswerChoices table
-- For Question 1
INSERT INTO AnswerChoices (question_id, answer_text, is_correct, explanation)
VALUES 
    (1, 'To produce 30% of Singapore''s nutritional needs locally by 2030', 1, 'The ''30 by 30'' goal aims for Singapore to produce 30% of its nutritional needs locally by 2030 to enhance food security.'),
    (1, 'To reduce food imports by 30% by 2030', 0, NULL),
    (1, 'To increase food exports by 30% by 2030', 0, NULL),
    (1, 'To invest 30% of the national budget in agriculture by 2030', 0, NULL);

-- For Question 2
INSERT INTO AnswerChoices (question_id, answer_text, is_correct, explanation)
VALUES 
    (2, 'By reclaiming land from the sea for farming', 0, NULL),
    (2, 'By importing all its food needs', 0, NULL),
    (2, 'By investing in vertical farming and rooftop gardens', 1, 'Singapore is investing in vertical farming and rooftop gardens to maximize the use of limited land space for agriculture.'),
    (2, 'By reducing the population to lower food demand', 0, NULL);

-- For Question 3
INSERT INTO AnswerChoices (question_id, answer_text, is_correct, explanation)
VALUES 
    (3, 'Relying heavily on neighboring countries for food', 0, NULL),
    (3, 'Encouraging a monoculture farming approach', 0, NULL),
    (3, 'Limiting technological advancements in agriculture', 0, NULL),
    (3, 'Diversifying its food sources and suppliers', 1, 'Diversifying food sources and suppliers is a key component of Singapore''s food security strategy to mitigate risks.');

-- For Question 4
INSERT INTO AnswerChoices (question_id, answer_text, is_correct, explanation)
VALUES 
    (4, 'Regulating food imports and exports', 0, NULL),
    (4, 'Supporting local food production', 0, NULL),
    (4, 'Ensuring food safety and quality', 0, NULL),
    (4, 'All of the above', 1, 'The Singapore Food Agency (SFA) plays a comprehensive role including regulating imports/exports, supporting local production, and ensuring food safety and quality.');

-- For Question 5
INSERT INTO AnswerChoices (question_id, answer_text, is_correct, explanation)
VALUES 
    (5, 'Banning all imported food products', 0, NULL),
    (5, 'Increasing public awareness about food waste reduction', 1, 'Increasing public awareness about food waste reduction can help Singapore reduce its reliance on food imports.'),
    (5, 'Closing all restaurants that serve foreign cuisine', 0, NULL),
    (5, 'Restricting the use of fertilizers', 0, NULL);

-- select statements for testing
SELECT * FROM Account;
SELECT * FROM Post;
SELECT * FROM Reply;
SELECT * FROM QuizQuestions;
SELECT * FROM AnswerChoices;
