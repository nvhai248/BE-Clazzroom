# Back-end for Final Project Web Advanced Course - Clazzroom

## Author

- Name: Nguyen Van Hai
- GH: [nvhai248](https://github.com/nvhai248)

## Introductions

This project serves as a straightforward back-end solution for the Web Advanced Course's final project. Its primary function is to offer APIs that enable users, whether they are students or teachers, to create new classes, courses, and more.

## Technologies Utilized

- `NodeJS` with `ExpressJS`: The application is built using the Express framework within NodeJS.

- `MongoDB` with `Mongoose`: Utilized as the primary database for storage purposes.

- `Passport` with `JWT`: Implemented for authentication and authorization functionalities, including OAuth integrations with Google and Facebook.

- `AWS S3`: Integrated for storing uploaded files securely.

- `Nodemailer`: Employed to facilitate the sending of verified emails within the system.

## APIs

- `POST api/user/login`: Sign in to the application.
  
- `POST api/user/register`: Sign up to the application
  
- `DELETE api/user/logout`: Log out from the application
  
- `GET api/user/profile`: Get the user's profile.
  
- `PATCH api/user/profile`: Update the user's profile.
  
- `POST api/upload/image`: Upload the image with key `file`.