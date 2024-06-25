const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Book {
    constructor(book_id, title, author, availability) {
      this.book_id = book_id;
      this.title = title;
      this.author = author;
      this.availability = availability;
    }
  
    // get all books
    static async getAllBooks() {
      // connect to SQL database
      const connection = await sql.connect(dbConfig);

      // get all books SQL query
      const sqlQuery = `SELECT * FROM Books`; 

      // plugging query into database
      const request = connection.request();
      const result = await request.query(sqlQuery); // returns array of database data
  
      connection.close();
  
      // map data to array of books and return
      return result.recordset.map(
        (row) => new Book(row.book_id, row.title, row.author, row.availability)
      ); 
    }

    // update book availability
    static async updateBookAvailability(id, newBookData) {
        // connect to SQL database
        const connection = await sql.connect(dbConfig);

        // update availability of book query
        const sqlQuery = `UPDATE Books SET availability = @availability WHERE book_id = @id`;

        // plugging query into database
        const request = connection.request();
        request.input("id", id); // set book_id in query
        request.input("availability", newBookData.availability); // set availability in query
        await request.query(sqlQuery);

        connection.close();

        // get updated book data
        return this.getBookById(id);
    }

    // for checking updated book
    static async getBookById(id) {
      // connect to SQL database
      const connection = await sql.connect(dbConfig);
  
      // find book by book_id query
      const sqlQuery = `SELECT * FROM Books WHERE book_id = @id`; 
  
      // plugging query into database
      const request = connection.request();
      request.input("id", id); // set book_id in query
      const result = await request.query(sqlQuery); // this returns an array of 1
  
      connection.close();
  
      // return the book from array (index 0)
      return result.recordset[0]
        ? new Book(
            result.recordset[0].book_id,
            result.recordset[0].title,
            result.recordset[0].author,
            result.recordset[0].availability
          )
        : null; 
    }
}

module.exports = Book;