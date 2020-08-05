//modules
require('dotenv').config()
const path = require('path')
const express = require('express')
const ejs = require('ejs')
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const findOrCreate = require('mongoose-findorcreate')

const port = 3000

const app = express()

//paths
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')

//express settings
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(publicDirectoryPath))

//view  engine
app.set('view engine', 'ejs')
app.set('views', viewsPath)

//passportJS
app.use(
  session({
    secret: 'This is a secret',
    resave: false,
    saveUninitialized: false
  })
)

app.use(passport.initialize())
app.use(passport.session())

//database coonnect
mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
mongoose.set('useCreateIndex', true) //to stop deprication warning

//schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String, 
  googleId:String
})

//plugins
userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)

//model
const User = mongoose.model('User', userSchema)
passport.use(User.createStrategy())
passport.serializeUser((user, done) => {
  done(null, user.id)
})
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user)
  })
})

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/secrets',
      userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
    },
    (accessToken, refreshToken, profile, cb) => {
      User.findOrCreate({ googleId: profile.id }, (err, user) => {
        return cb(err, user)
      })
    }
  )
)

app.get('/', (req, res) => {
  req.isAuthenticated() ? res.redirect('/secrets') : res.render('home')
})

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }))

app.get(
  '/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/secrets')
  }
)

app.get('/secrets', (req, res) => {
  req.isAuthenticated() ? res.render('secrets') : res.redirect('/login')
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
    User.register(
      { username: req.body.username },
      req.body.password,
      (err, user) => {
        err
          ? (console.log(err), res.redirect('/register'))
          : passport.authenticate('local')(req, res, () => {
              res.redirect('/secrets')
            })
      }
    )
  })

app.post('/login', (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  })
  req.login(user, err => {
    err
      ? console.log(err)
      : passport.authenticate('local')(req, res, () => {
          res.redirect('/secrets')
        })
  })
})

app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

app.listen(port, () => {
  console.log(`App is running on port:${port}`)
})
