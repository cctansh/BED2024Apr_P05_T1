node modules and bootstrap folders should not be committed

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
              #css files go here
          js/
              bootstrap/
                  ...
              #js files go here
        #html files go here
  #app.js, dbConfig.js, package.json, sql files go here
```
