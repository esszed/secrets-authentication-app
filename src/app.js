//modules
require('dotenv').config()

const path = require('path')
const express = require('express')
const ejs = require('ejs')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const port = 3000

const app = express()

//paths
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')

//view  engine
app.set('view engine', 'ejs')
app.set('views', viewsPath)

//database coonnect
mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})

//express settings
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(publicDirectoryPath))

//schema

const userSchema = new mongoose.Schema({
  email: String,
  password: String
})

const saltRounds = 10

const User = mongoose.model('User', userSchema)

app.get('/', (req, res) => {
  res.render('home')
})

app.get('/login', (req, res) => {
  res.render('login')
})

app
  .route('/register')
  .get((req, res) => {
    res.render('register')
  })
  .post((req, res) => {
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
      const user = new User({
        email: req.body.username,
        password: hash
      })

      user.save(err => (err ? console.log(err) : res.render('secrets')))
    })
  })

app.post('/login', (req, res) => {
  const username = req.body.username
  const password = req.body.password

  User.findOne({ email: username }, (err, user) => {
    err
      ? console.log(err)
      : user
      ? bcrypt.compare(password, user.password, (err, result) => {
          result ? res.render('secrets') : res.send('Wrong Password')
        })
      : res.send('No user found')
  })
})

app.listen(port, () => {
  console.log(`App is running on port:${port}`)
})
