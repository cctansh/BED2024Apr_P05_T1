A mock website about Singapore's Food Security. Allows users to interact on a discussion forum and take a short quiz testing their knowledge. 

Go to /api-docs for in-depth documentation of available routes/input output

To setup:
- run sqlquery.sql in an sql server app
- see .env for database user details
- npm install bcryptjs body-parser dotenv express joi jsonwebtoken mssql swagger-autogen swagger-ui-express nodemon
- run with "node app.js" or "npm run devStart"
- bootstrap files have not been included. download from links below and add them to the tree
    - bootstrap CSS and icon folders go under public/css, bootstrap js folder goes under public/js

bootstrap downloads:
- https://getbootstrap.com/docs/5.3/getting-started/download/ (css & js)
- https://github.com/twbs/icons/releases/tag/v1.11.3 (!! RENAME FOLDER TO 'bootstrap-icons' !!)

tree should look like:
```
BED/
    controllers/
        #controllers go here     
    middlewares/
        #middlewares go here
    models/
        #models go here   
    node_modules/
        ...
    public/
        css/
            bootstrap/
                ...
            bootstrap-icons/
                ...
            #css files go here
        js/
            bootstrap/
                ...
            #js files go here
        #html files go here
    #app.js, dbConfig.js, package.json, sql files, etc go here
```

### credits
Discussion forum posts and replies generated with chatGPT
- prompt: "create 4 posts for a mock discussion forum on singapore's food security
posts should include a post title and post text
create 2-4 replies for each post"

index.html based on gignite generation