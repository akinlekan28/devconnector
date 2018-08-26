const express = require('express');
const mongoose = require('mongoose');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/post');

const app = express();

//DB Config
const db = require('./config/keys').mongoURI;

//Mongodb connection
mongoose.connect(db, {useNewUrlParser: true})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

app.get('/', (req, res)=> res.send("Hello!"));

//Use routes
app.use('/api/users', users);
app.use('/api/posts', posts);
app.use('/api/profile', profile);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`))