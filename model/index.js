var mongoose = require('mongoose');
var schemas = {
    bookSchema: {
        name: String,
        author: String,
        genre: String,
        count: Number,
        issuedTo: [String]
    },
    userSchema: {
        username: String,
        password: String,
        email: String,
        isAdmin: Boolean
    }
};
var Schema = mongoose.Schema;
console.log(schemas.bookSchema);
console.log(schemas.userSchema);
var bookSchema = new Schema(schemas.bookSchema);
var books = mongoose.model('books',bookSchema);
var userSchema = new Schema(schemas.userSchema);
var users = mongoose.model('users',userSchema);
module.exports.books = books;
module.exports.users = users;