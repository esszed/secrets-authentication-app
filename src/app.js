
//modules
const path = require('path')
const express = require('express')
const ejs = require('ejs')

const port = 3000

const app = express()

//paths
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')

//view  engine
app.set('view engine', 'ejs')
app.set('views', viewsPath)

//express settings
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(publicDirectoryPath))

app.get('/', (req, res)=>{
    res.render('home')
})

app.get('/login', (req, res)=>{
    res.render('login')
})

app.get('/register', (req, res)=>{
    res.render('register')
})





app.listen(port, () => {
    console.log(`App is running on port:${port}`)
  })
