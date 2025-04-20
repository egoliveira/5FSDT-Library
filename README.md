# 5FSDT-Library

Simple library REST API project for FIAP's Fullstack Development graduate course that runs on NodeJS. It is intended
to exercise TypeScript programming, so no third-party libraries have been used in this project, except
by [Supabase JS library](https://github.com/supabase/supabase-js) (for database
access) and [Tsyringe](https://github.com/microsoft/tsyringe) (for dependency injection).

## Database

This project uses [Supabase](https://supabase.com/) to store the project data. The database schema can be
found [here](database/database.sql). To configure the database access, edit [di.ts](di/di.ts) file and set the Supabase
URL and key:

    const supabase = createClient<Database>('https://database_url.supabase.co', 'access_key');

## Compiling

To compile the code, just execute `tsc` (supposing you have installed TypeScript transpiler) at project's root path.

## Running

To run the project, just execute `node dist/app.js`. The application will run on port 3000.

## Endpoints

The endpoints' base URL is `http://localhost:3000/api/v1`.

### Author

The endpoint used to handle library authors is located at `http://localhost:3000/api/v1/author`.

### GET methods

Used to retrieve information about authors.

- `http://localhost:3000/api/v1/author`: Returns all authors found on database.
- `http://localhost:3000/api/v1/author/[id]`: Returns an author for the given author id.

### POST method

Used to create authors.

- `http://localhost:3000/api/v1/author`: Creates an author on database. The request must send a JSON object as body,
  passing the author name:

```json
{
  "name": "Author Name"
}
```

### PUT method

Used to update authors.

- `http://localhost:3000/api/v1/author/[id]`: Updates the author for the given author id on database. The request must
  send a
  JSON object as body,
  passing the author name:

```json
{
  "name": "New Author Name"
}
```

### DELETE method

Used to delete authors.

- `http://localhost:3000/api/v1/author/[id]`: Deletes an author for the given author id.

### Publisher

The endpoint used to handle library publishers is located at `http://localhost:3000/api/v1/publisher`.

### GET methods

Used to retrieve information about publishers.

- `http://localhost:3000/api/v1/publisher`: Returns all publishers found on database.
- `http://localhost:3000/api/v1/publisher/[id]`: Returns a publisher for the given publisher id.

### POST method

Used to create publishers.

- `http://localhost:3000/api/v1/publisher`: Creates a publisher on database. The request must send a JSON object as
  body, passing the publisher name:

```json
{
  "name": "Publisher Name"
}
```

### PUT method

Used to update publishers.

- `http://localhost:3000/api/v1/publisher/[id]`: Updates the publisher for the given publisher id on database. The
  request must
  send a JSON object as body, passing the publisher name:

```json
{
  "name": "New Publisher Name"
}
```

### DELETE method

Used to delete publishers.

- `http://localhost:3000/api/v1/publisher/[id]`: Deletes a publisher for the given publisher id.

### Book

The endpoint used to handle library books is located at `http://localhost:3000/api/v1/book`.

### GET methods

Used to retrieve information about books.

- `http://localhost:3000/api/v1/book`: Returns all books found on database.
- `http://localhost:3000/api/v1/book/[id]`: Returns a book for the given book id.

### POST method

Used to create books.

- `http://localhost:3000/api/v1/book`: Creates a book on database. The request must send a JSON object as body,
  passing the book information:

```json
{
  "bookTitle": "Book Title",
  "isbn": "000-0000000000",
  "year": 2000,
  "publisher": "Publisher Name",
  "authors": [
    "Author Name 1",
    "Author Name 2"
  ]
}
```

### PUT method

Used to update books.

- `http://localhost:3000/api/v1/book/[id]`: Updates the book for the given book id on database. The request must send a
  JSON object as body, passing the book information:

```json
{
  "bookTitle": "New Book Title",
  "isbn": "000-0000000001",
  "year": 2001,
  "publisher": "New Publisher Name",
  "authors": [
    "Author Name 3",
    "Author Name 4"
  ]
}
```

### DELETE method

Used to delete books.

- `http://localhost:3000/api/v1/book/[id]`: Deletes a book for the given book id.