const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { User } = require('./models');
const { DBConnection } = require('./dbConnection');

const PORT = 3500;
const JWT_SECRET = 'LOGIN_SECRET';

DBConnection();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:4200'],
    credentials: true,
    methods: ['GET','POST','PUT','DELETE']
}));

app.listen(PORT, () => {
    console.log(`Express server listening on port: ${PORT}`);
});

/**
 * ROUTES
 */
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    const checkExistingEmail = await User.findOne({ email: email });

    if(checkExistingEmail){
        res.send({ success: false, message: 'Email address already in use' });
    }else {
        const hash = await bcrypt.hash(password, 10);

        const newUser = new User({
            username: username,
            email: email,
            password: hash
        });
        newUser.save();
        res.status(200).send({ success: true, message: 'New user details registered'});
    }
});
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if(!user){
        res.send({ success: false, message: 'No user found'});
    }else{
        const validPassword = await bcrypt.compare(password, user.password);
        if(!validPassword){
            res.send({ success: false, message: 'Invalid password' });
        }else{
            const token = jwt.sign(
                { id: user._id },
                JWT_SECRET
            );
            res.cookie(
                'jwt', 
                token, 
                { 
                    httpOnly: true, 
                    maxAge: 24 * 60 * 60 * 1000 // 1 day
                }
            );
            const { password, ...data } = user.toJSON();
            res.send({ success: true, data });
        }
    }
});
app.get('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.status(200).send({ success: true, message: 'Logout Successful' });
});
app.get('/verify-token', async (req, res) => {
    const token = req.cookies.jwt;
    if(!token){
        res.send({ success: false, error: 'No token available' });
    }else{
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById({ _id: Object(decoded.id) });
        const { password, _id, ...data } = user.toJSON();
        res.send({ success: true, decoded, data });
    }
});