const sql = require('mssql');
const dbConfig = require("./dbConfig");
const bcrypt = require('bcryptjs');

async function seedDatabase() {
    try {
        await sql.connect(dbConfig);

        // Drop existing tables (optional if you want to recreate them entirely)
        await sql.query(`
            if exists (SELECT * FROM sysobjects 
            WHERE id = object_id('dbo.Reply') and sysstat & 0xf = 3)
            DROP TABLE dbo.Reply;

            if exists (SELECT * FROM sysobjects 
            WHERE id = object_id('dbo.Post') and sysstat & 0xf = 3)
            DROP TABLE dbo.Post;

            if exists (SELECT * FROM sysobjects 
            WHERE id = object_id('dbo.Account') and sysstat & 0xf = 3)
            DROP TABLE dbo.Account;

            if exists (SELECT * FROM sysobjects 
            WHERE id = object_id('dbo.AnswerChoices') and sysstat & 0xf = 3)
            DROP TABLE dbo.AnswerChoices;

            if exists (SELECT * FROM sysobjects 
            WHERE id = object_id('dbo.QuizQuestions') and sysstat & 0xf = 3)
            DROP TABLE dbo.QuizQuestions;
        `);

        // Create tables
        await sql.query(`
            CREATE TABLE Account 
            (
            accId smallint IDENTITY(1,1),
            accName varchar(50) NOT NULL,
            accEmail varchar(120) NOT NULL,
            accPassword varchar(60) NOT NULL,
            accRole varchar(6) CHECK (accRole IN ('member', 'admin')) NOT NULL
            CONSTRAINT PK_Account PRIMARY KEY (accId)
            );

            CREATE TABLE Post
            ( 
            postId smallint IDENTITY(1,1),
            postDateTime smalldatetime NOT NULL, 
            postTitle varchar(255) NOT NULL,
            postText varchar(8000) NOT NULL,
            postEdited bit NOT NULL,
            adminEdit bit NOT NULL,
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
            adminEdit bit NOT NULL,
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
        `);

        // Hash passwords
        let salt = await bcrypt.genSalt(10);
        const hashedPassword1 = await bcrypt.hash('abcd1234', salt);
        salt = await bcrypt.genSalt(10);
        const hashedPassword2 = await bcrypt.hash('abcd1234', salt);
        salt = await bcrypt.genSalt(10);
        const hashedPassword3 = await bcrypt.hash('abcd1234', salt);

        // Insert data into Account table
        await sql.query(`
            INSERT INTO Account(accName, accEmail, accPassword, accRole)
            VALUES ('potatofarm123', 'hi@gmail.com', '${hashedPassword1}', 'member'),  
                   ('Damian Ang', 'hello@yahoo.com.sg', '${hashedPassword2}', 'member'),
                   ('easystrikes', 'haha@yahoo.com.sg', '${hashedPassword3}', 'admin');
        `);

        // Insert data into Post table
        await sql.query(`
            INSERT INTO Post(postDateTime, postTitle, postText, postEdited, adminEdit, accId)
            VALUES ('2024-05-25 16:56:00', 'Singapore''s Food Security: Current Challenges and Solutions', 'Singapore''s food security has been a topic of significant discussion recently. With our reliance on imports for over 90% of our food, what are the key challenges we face in ensuring a stable food supply? Are there any innovative solutions or policies that have been proposed to address these issues?', 0, 0, 1),  
                   ('2024-05-27 12:03:46', 'Impact of Climate Change on Singapore''s Food Supply', 'Climate change is affecting global agriculture, and Singapore is no exception. How might changing weather patterns and rising temperatures impact our food supply? What steps can we take to adapt to these changes and ensure a stable food supply?', 0, 0, 2),
                   ('2024-05-27 12:03:46', 'Technological Innovations in Food Security: What''s Next for Singapore?', 'Technology is playing an increasingly important role in food security. From AI and data analytics to biotechnology, what are some of the most promising technological innovations that could impact Singapore’s food security? How can we leverage these technologies to strengthen our food supply chain?', 0, 0, 1),
                   ('2024-05-28 20:00:00', 'Government Policies and Their Role in Ensuring Food Security', 'Government policies play a crucial role in shaping food security strategies. What are some of the key policies that have been implemented in Singapore to address food security? Are there any areas where policy improvements are needed?', 0, 0, 3);
        `);

        // Insert data into Reply table
        await sql.query(`
            INSERT INTO Reply(replyDateTime, replyText, replyEdited, adminEdit, accId, replyTo)
            VALUES ('2024-05-25 17:43:00', 'The major challenge is our heavy dependence on food imports, which makes us vulnerable to global supply chain disruptions. One solution that has been proposed is increasing local food production through vertical farming and aquaculture. These methods could help reduce our reliance on imports and enhance food security.', 0, 0, 2, 1),  
                   ('2024-05-26 13:12:19', 'I agree with the focus on local production, but we should also consider improving our food stockpiling strategies. Ensuring that we have adequate reserves could help mitigate the impact of sudden supply chain issues.', 0, 0, 1, 1),
                   ('2024-05-26 16:32:43', 'Another approach could be to diversify our import sources. By not relying too heavily on any single country or region, we can reduce the risk of supply disruptions. Additionally, investing in technology to improve the efficiency of food distribution could be beneficial.', 0, 0, 3, 1),
                   ('2024-05-27 18:54:34', 'Climate change can lead to unpredictable weather patterns, which can affect both local and global food production. For Singapore, investing in climate-resilient agricultural technologies, such as climate-controlled greenhouses, could be a key strategy to ensure a steady supply of fresh produce.', 0, 0, 3, 2),
                   ('2024-05-28 11:23:56', 'AI and data analytics can enhance our ability to predict and manage food supply and demand. By analyzing data on weather patterns, market trends, and supply chain logistics, we can make more informed decisions and improve food distribution efficiency.', 0, 0, 3, 3),
                   ('2024-05-28 18:43:23', 'Biotechnology offers potential solutions such as genetically modified crops that can withstand harsh conditions or pests. Investing in research and development in this area could significantly benefit our food security.', 0, 0, 2, 3);
        `);

        // Insert data into QuizQuestions and AnswerChoices tables (example shown earlier)
        await sql.query(`
            INSERT INTO QuizQuestions (question, image_path)
            VALUES 
                ('What is the Singaporean government''s ''30 by 30'' goal for food security?', 'img/30by30.png'),
                ('How is Singapore addressing the challenge of limited land space for agriculture?', 'img/urbanfarmrooftop.png'),
                ('Which of the following is a key component of Singapore''s food security strategy?', 'img/diversefood.png'),
                ('What role does the Singapore Food Agency (SFA) play in ensuring food security?', NULL),
                ('What is one way that Singapore can reduce its reliance on food imports?', NULL);
        `);

        await sql.query(`
            INSERT INTO AnswerChoices (question_id, answer_text, is_correct, explanation)
            VALUES 
                (1, 'To produce 30% of Singapore''s nutritional needs locally by 2030', 1, 'The ''30 by 30'' goal aims for Singapore to produce 30% of its nutritional needs locally by 2030 to enhance food security.'),
                (1, 'To reduce food imports by 30% by 2030', 0, NULL),
                (1, 'To increase food exports by 30% by 2030', 0, NULL),
                (1, 'To invest 30% of the national budget in agriculture by 2030', 0, NULL),
                (2, 'By reclaiming land from the sea for farming', 0, NULL),
                (2, 'By importing all its food needs', 0, NULL),
                (2, 'By investing in vertical farming and rooftop gardens', 1, 'Singapore is investing in vertical farming and rooftop gardens to maximize the use of limited land space for agriculture.'),
                (2, 'By reducing the population to lower food demand', 0, NULL),
                (3, 'Relying heavily on neighboring countries for food', 0, NULL),
                (3, 'Encouraging a monoculture farming approach', 0, NULL),
                (3, 'Limiting technological advancements in agriculture', 0, NULL),
                (3, 'Diversifying its food sources and suppliers', 1, 'Diversifying food sources and suppliers is a key component of Singapore''s food security strategy to mitigate risks.'),
                (4, 'Regulating food imports and exports', 0, NULL),
                (4, 'Supporting local food production', 0, NULL),
                (4, 'Ensuring food safety and quality', 0, NULL),
                (4, 'All of the above', 1, 'The Singapore Food Agency (SFA) plays a comprehensive role including regulating imports/exports, supporting local production, and ensuring food safety and quality.'),
                (5, 'Banning all imported food products', 0, NULL),
                (5, 'Increasing public awareness about food waste reduction', 1, 'Increasing public awareness about food waste reduction can help Singapore reduce its reliance on food imports.'),
                (5, 'Closing all restaurants that serve foreign cuisine', 0, NULL),
                (5, 'Restricting the use of fertilizers', 0, NULL);
        `);

        console.log('Sample data inserted successfully.');

    } catch (err) {
        console.error('Error inserting sample data:', err.message);
    } finally {
        await sql.close();
    }
}

module.exports = seedDatabase;