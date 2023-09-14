const express = require("express")
const mongoose = require('mongoose')
const cors = require("cors")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const multer = require('multer')
const path = require('path')
const UserModel = require('./models/UserModel')
const PostModel = require("./models/PostModel")


const app = express()
app.use(express.json())
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}))

app.use(cookieParser())
app.use(express.static('public'))            ///access images from server side

mongoose.connect('mongodb://127.0.0.1:27017/blog');

const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json("The token is missing")
    } else {
        jwt.verify(token, "jwt-secret-key", (err, decoded) => {
            if (err) {
                return res.json("The token is wrong")
            } else {
                req.email = decoded.email;
                req.username = decoded.username;
                next()

            }
        })
    }
}


app.get('/', verifyUser, (req, res) => {
    return res.json({ email: req.email, username: req.username })
})

//////////register

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    bcrypt.hash(password, 10)
        .then(hash => {
            UserModel.create({ username, email, password: hash })
                .then(user => res.json(user))
                .catch(err => res.json(err))
        }).catch(err => console.log(err))

})
////for login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    UserModel.findOne({ email: email })
        .then(user => {
            if (user) {
                bcrypt.compare(password, user.password, (err, response) => {
                    if (response) {
                        const token = jwt.sign({ email: user.email, username: user.username }, "jwt-secret-key", { expiresIn: '1d' })

                        res.cookie('token', token)
                        return res.json("Success")
                    } else {
                        return res.json("Incorrect Password")
                    }
                })
            } else {
                res.json("User not exist")
            }
        })
})
//// for file store
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Public/Images')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
})


/////////PostModel

const upload = multer({
    storage: storage
})

///for images
app.post('/create', verifyUser, upload.single('file'), (req, res) => {
    PostModel.create({
        title: req.body.title,
        description: req.body.description,
        file: req.file.filename, email: req.body.email
    })
        .then(result => res.json("Success"))    /////old .then(result => res.json(result)) //get result

        .catch(err => res.json(err))          ///console.log(req.file) // dtails of image on terminal
})



///for getposts
app.get('/getposts', (req, res) => {
    PostModel.find()
        .then(posts => res.json(posts))
        .catch(err => res.json(err))
})

/////for getpostbyid
app.get('/getpostbyid/:id', (req, res) => {
    const id = req.params.id
    PostModel.findById({ _id: id })
        .then(post => res.json(post))
        .catch(err => console.log(err))
})
////Update 
app.put('/editpost/:id', (req, res) => {
    const id = req.params.id;
    PostModel.findByIdAndUpdate(
        { _id: id }, {
        title: req.body.title,
        description: req.body.description
    })
        .then(result => res.json("Success"))
        .catch(err => res.json(err))
})
//////delete

app.delete('/deletepost/:id', (req, res) => {
    PostModel.findByIdAndDelete({ _id: req.params.id })
        .then(result => res.json("Success"))
        .catch(err => res.json(err))
})

////For logout

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.json("Success")
})

app.listen(4001, () => {
    console.log("Server is running on 4001")
})
