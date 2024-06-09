DO NOT COMMIT NODE AND BOOTSTRAP FILES

remember to run the sqlquery file in your sql server app. check the dbConfig file, and set up the same user/password permissions, referring to wk4 tutorial. alternatively, change the dbConfig to match ur user and password, but DO NOT EVER COMMIT IT

footer and quiz pages have been taken directly from previous assignment, please remember to update them to fit

everyone does their functions/pages as indicated in checkpoint 1

bootstrap downloads:
- https://getbootstrap.com/docs/5.3/getting-started/download/
- https://github.com/twbs/icons/releases/tag/v1.11.3 (!! RENAME FOLDER TO 'bootstrap-icons' !!)
- place inside css & js folders respectively

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
    #app.js, dbConfig.js, package.json, sql files go here
```
