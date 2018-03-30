![CF](https://camo.githubusercontent.com/70edab54bba80edb7493cad3135e9606781cbb6b/687474703a2f2f692e696d6775722e636f6d2f377635415363382e706e67) 14: REST & APIs
===

## Lab 14 Submission Instructions (please read carefully!)

- One partner will fork and clone this lab, and duplicate/rename the starter code, check out a new branch, etc., as you did during the first two weeks of the course. If you need a refresher on the process or more detailed instructions, refer to the instructions that are in Lab 01.
- There is no requirement that you swap partners today, so feel free to do all of the work on a single machine. Let's keep it simple and put the focus on the learning.
- There are 18 comment items in the starter code, which is a finished version of the book app. The primary goal is to trace exectuion of the code and understand how it all fits together.
- You do not need to get the code up and running today to complete this lab, but you can seek to do so after completing the comment items. It is more important to finish the commenting, so do that first.
- The User Stories and Feature Tasks have been left intact in this document as if they had not been completed; this is so you can see the connection between how these things were described and how they were implemented. You do not need to follow all of those steps to complete the comments in this lab, but you will need some of the details in those tasks to get the code up and running if you choose to do that after finishing the comments.
- Where you identify differences between the starter code and how you and your partner built things next week, dig into those spots and learn from them.
- When you have completed the comments, make a pull request back to your fork, merge to master, then make a PR from your fork back to the lab repo as you did during the first two weeks with the pull request template.

## Resources

- [Google Books API Library](https://console.developers.google.com/apis/library)
- [REST Wiki](https://en.wikipedia.org/wiki/Representational_state_transfer)
- [A Beginner's Guide to HTTP and REST](https://code.tutsplus.com/tutorials/a-beginners-guide-to-http-and-rest--net-16340)
- [API Wiki](https://en.wikipedia.org/wiki/Application_programming_interface)
- [Superagent](https://visionmedia.github.io/superagent/)
- [Book Store Wireframe](./wireframes)

## Configuration

- `ENV VARS` - Paste the following code snippet into your terminal window:
  * _Reminder: these will be temporary while the current shell session (window) is open_

```
export PORT=3000
export CLIENT_URL=http://localhost:8080
export TOKEN=1234 # Please make your own PIN
export GOOGLE_API_KEY=your google books api key
Mac:     export DATABASE_URL=postgres://localhost:5432/books_app
Windows: export DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/books_app
```

```sh
book_app_week_3/
├── book-list-client
│   ├── data
│   │   └── books.json
|   ├── .eslintrc.json
|   ├── .gitignore
│   ├── index.html
|   ├── README.md
│   ├── scripts
│   │   ├── models
│   │   │   └── book.js
│   │   └── views
│   │       ├── admin-view.js
│   │       ├── book-view.js
│   │       ├── error-view.js
│   │       └── routes.js
│   └── styles
│       ├── base.css
│       ├── fonts
│       │   ├── icomoon.eot
│       │   ├── icomoon.svg
│       │   ├── icomoon.ttf
│       │   └── icomoon.woff
│       ├── icons.css
│       ├── layout.css
│       ├── modules
│       │   ├── admin-main.css
│       │   ├── book-main.css
│       │   ├── detail-main.css
│       │   ├── error.css
│       │   ├── footer.css
│       │   ├── form-main.css
│       │   └── header.css
│       └── reset.css
└── book-list-server
  ├── .eslintrc.json
  ├── .gitignore
  ├── package-lock.json
  ├── package.json
  ├── README.md
  └── server.js
```

## User Stories & Feature Tasks

#### Overview

Today's refactor will implement the use of a 3rd party API, Google Books, which will give users the ability to search by author, title, or ISBN. If the user finds the book they want they will be able to add that book to their persistence layer (database).

*1. As a user, I want to access an external API so that I can incorporate additional information into my app, enhancing its functionality.*

- Login to [Google's API Developer Console](https://console.developers.google.com/) using your Google username and password.
- From the Credentials screen, create a new set of credentials for a web application, specifically giving yourself access to the Google Books API.
- This will provide you with an API Key which you can use for making API calls through your server. You will need to set this as an environment variable in your system and in your deployment application on Heroku (described below).

*2. As a user, I want to use the Google Books API so that I can search for books and add new books to my list.*

- Install and require the `superagent` package from NPM; validate that it's listed as a dependency in your `package.json`.
- Create a global variable reference to the `GOOGLE_API_KEY` that you set as an env variable for use in your new endpoints.
- Add an endpoint for a `GET` request to `/api/v1/books/find` which will proxy a `superagent` request from the client to the Google Books API and return a list of ten books that match the search query.
  - Map over the array of results to build an array of objects that match the `book` model in your database.
  - Send the newly constructed array of objects to your client in the response.
- Add an endpoint for a `GET` request to `/api/v1/books/find/:isbn` which will proxy a `superagent` request from the client to the Google Books API and return a single book by the ISBN.
  - Map over the array's single object and return a new object that matches the `book` model in your database.
  - Send the newly constructed book to your client in the response.

*3. As a user, I want a form and designated space for output so that I can search for books and see the results in a single view.*

- Add a new View to `index.html` with a class of `search-view` which contains a form for searching the Google Books API by author, title, or ISBN.
  - The form should contain three individual inputs.
  - Include a button to click when your want to trigger your search.
- Add a new View to `index.html` with a class of `search-results`, which contains a section and unordered list tag.
  - Your `<ul></ul>` should include an `id` attribute for targeting and insertion of dynamic content.

*4. As a user, I want my app to respond when I submit the form so that I can search the Google Books API and receive my results in my app.*

- Add a new view method to `book-view.js` called `bookView.initSearchFormPage` which will show the search form view and attach an event listener to the form.
- Add a new client-side route to your `routes.js` file which will listen for `/books/search`, and invoke `bookView.initSearchFormPage`.
  - The event listener will trigger on `submit`, capturing the form data as an object literal. It will pass the object to `Book.find` as the `book` argument and `bookView.initSearchResultsPage` as the `callback` argument.
  - `Book.find` will populate the `Book.all` array with the book objects returned from Google Books API for rendering later.
- Add a new view method to `book-view.js` called `bookView.initSearchResultsPage` which will show the search results view and attach an event listener to the `.detail-button`.
  - This view method will also map over the `Book.all` array and append each of the books from your search using your `toHtml` method created earlier in the week.
  - The event listener will trigger on `click`, capturing the `data-bookid` value (ISBN) from the great grandparent of the button; use jQuery to traverse the DOM and select the button's ancestor.

*5. As a user, I want to select a single book from my search results so that I can add it to my list.*

- Create a new static method on the Book constructor named `find`, which accepts `book` and `callback` as arguments.
  - This method will make a `GET` request to `/api/v1/books/find`, including the `book` argument.
  - On success, the results will be passed to `Book.loadall`, and then the `callback` should be invoked.
  - On failure, invoke your error callback.
- Create a new static method on the Book constructor named `findOne`, which accepts `isbn` as an argument.
  - This method will make a `GET` request to `/api/v1/books/find/:isbn`, including the `isbn` argument.
  - On success, the results will be passed to `Book.create`.
  - On failure, invoke your error callback.

## Documentation

_Your README.md must include:_
```md
# Project Name

**Author**: Your Name Goes Here
**Version**: 1.1.0 (increment the patch/fix version number up if you make more commits past your first submission)

## Overview
<!-- Provide a high level overview of what this application is and why you are building it, beyond the fact that it's an assignment for a Code Fellows 301 class. (i.e. What's your problem domain?) -->

## Getting Started
<!-- What are the steps that a user must take in order to build this app on their own machine and get it running? -->

## Architecture
<!-- Provide a detailed description of the application design. What technologies (languages, libraries, etc) you're using, and any other relevant design information. -->

## Change Log
<!-- Use this are to document the iterative changes made to your application as each feature is successfully implemented. Use time stamps. Here's an examples:

01-01-2001 4:59pm - Application now has a fully-functional express server, with GET and POST routes for the book resource.
-->
```
