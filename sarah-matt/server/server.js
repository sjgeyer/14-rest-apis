'use strict'

// Application dependencies
const express = require('express');
const cors = require('cors');
const pg = require('pg');
const superagent = require('superagent');
const bodyparser = require('body-parser');

// Application Setup
const app = express();
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;
const TOKEN = process.env.TOKEN;

// DONE: Explain the following line of code. What is the API_KEY? Where did it come from?
//The API_KEY is a specific hash that allows you to access the api as a verified user. It comes from Google.
const API_KEY = process.env.GOOGLE_API_KEY;

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// Application Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// API Endpoints
app.get('/api/v1/admin', (req, res) => res.send(TOKEN === parseInt(req.query.token)))

app.get('/api/v1/books/find', (req, res) => {
  let url = 'https://www.googleapis.com/books/v1/volumes';

  // DONE: Explain the following four lines of code. How is the query built out? What information will be used to create the query?
  // These lines of code are building the query that will be sent to the api. It is first testing if those values are valid ('' is not a valid value), then if they are, it is building a query using the title, author, and/or isbn from the ajax request in Book.find.
  let query = ''
  if(req.query.title) query += `+intitle:${req.query.title}`;
  if(req.query.author) query += `+inauthor:${req.query.author}`;
  if(req.query.isbn) query += `+isbn:${req.query.isbn}`;

  // DONE: What is superagent? How is it being used here? What other libraries are available that could be used for the same purpose?
  // Superagent is an ajax API run through Node. It is being used here to query the Google Api using the query built above and the API_KEY that was saved in the environment variables earlier. 
  superagent.get(url)
    .query({'q': query})
    .query({'key': API_KEY})
    .then(response => response.body.items.map((book, idx) => {

      // DONE: The line below is an example of destructuring. Explain destructuring in your own words.
      // Destructuring allows you to access individual items in an array by giving each item its own variable name.
      let { title, authors, industryIdentifiers, imageLinks, description } = book.volumeInfo;

      // DONE: What is the purpose of the following placeholder image?
      // This image will be the image_url if no image is stored in the book.volumeInfo.
      let placeholderImage = 'http://www.newyorkpaddy.com/images/covers/NoCoverAvailable.jpg';

      // DONE: Explain how ternary operators are being used below.
      // If the book has an entry for the specified field, that entry will be set to its corresponding key. Otherwise, a placeholder or alternative text will be displayed so that there are no null values.
      return {
        title: title ? title : 'No title available',
        author: authors ? authors[0] : 'No authors available',
        isbn: industryIdentifiers ? `ISBN_13 ${industryIdentifiers[0].identifier}` : 'No ISBN available',
        image_url: imageLinks ? imageLinks.smallThumbnail : placeholderImage,
        description: description ? description : 'No description available',
        book_id: industryIdentifiers ? `${industryIdentifiers[0].identifier}` : '',
      }
    }))
    .then(arr => res.send(arr))
    .catch(console.error)
})

// DONE: How does this route differ from the route above? What does ':isbn' refer to in the code below?
// This route finds a specific book based on its isbn, whereas the above route found all books within the API that matched the input values. :isbn is the isbn number of the selected book.
app.get('/api/v1/books/find/:isbn', (req, res) => {
  let url = 'https://www.googleapis.com/books/v1/volumes';
  superagent.get(url)
    .query({ 'q': `+isbn:${req.params.isbn}`})
    .query({ 'key': API_KEY })
    .then(response => response.body.items.map((book, idx) => {
      let { title, authors, industryIdentifiers, imageLinks, description } = book.volumeInfo;
      let placeholderImage = 'http://www.newyorkpaddy.com/images/covers/NoCoverAvailable.jpg';

      return {
        title: title ? title : 'No title available',
        author: authors ? authors[0] : 'No authors available',
        isbn: industryIdentifiers ? `ISBN_13 ${industryIdentifiers[0].identifier}` : 'No ISBN available',
        image_url: imageLinks ? imageLinks.smallThumbnail : placeholderImage,
        description: description ? description : 'No description available',
      }
    }))
    .then(book => res.send(book[0]))
    .catch(console.error)
})

app.get('/api/v1/books', (req, res) => {
  client.query(`SELECT book_id, title, author, image_url, isbn FROM books;`)
    .then(results => res.send(results.rows))
    .catch(console.error);
});

app.get('/api/v1/books/:id', (req, res) => {
  client.query(`SELECT * FROM books WHERE book_id=${req.params.id}`)
    .then(results => res.send(results.rows))
    .catch(console.error);
});

app.post('/api/v1/books', (req, res) => {
  let {title, author, isbn, image_url, description} = req.body;
  client.query(`
    INSERT INTO books(title, author, isbn, image_url, description) VALUES($1, $2, $3, $4, $5)`,
    [title, author, isbn, image_url, description]
  )
  .then(results => res.sendStatus(201))
  .catch(console.error);
});

app.put('/api/v1/books/:id', (req, res) => {
  let {title, author, isbn, image_url, description} = req.body;
  client.query(`
    UPDATE books
    SET title=$1, author=$2, isbn=$3, image_url=$4, description=$5
    WHERE book_id=$6`,
    [title, author, isbn, image_url, description, req.params.id]
  )
  .then(() => res.sendStatus(204))
  .catch(console.error)
})

app.delete('/api/v1/books/:id', (req, res) => {
  client.query('DELETE FROM books WHERE book_id=$1', [req.params.id])
  .then(() => res.sendStatus(204))
  .catch(console.error);
});

app.get('*', (req, res) => res.redirect(CLIENT_URL));
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
