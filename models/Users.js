// import mongoose
const mongoose = require('mongoose');

// create schema (structure of the collection)
const userSchema = new mongoose.Schema({
    firstname:{
        type: String,
        required: true
    },
    lastname:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    weight:{
        type: Number,
        required: true
    },
    height:{
        type: Number,
        required: true
    },
    calories:{
        type: Number,
        required: true
    },
    gender:{
        type: String,
        required: true
    }
})

//create schema object
let user_collection = mongoose.model('Users', userSchema, 'users');

//export so it can be used in other files
module.exports = user_collection;
