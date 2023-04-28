import * as express from 'express'
import * as mongodb from 'mongodb'
import * as bcrypt from 'bcrypt'
import jwt, { TokenExpiredError } from 'jsonwebtoken';

import { collections } from '../database'

export const userRouter = express.Router()
userRouter.use(express.json())

userRouter.get('/', async (req, res) => {
    try {
        const user = await collections.users.find({}).toArray();
        res.status(200).send(user)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

//login function
userRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email && !password) { return res.status(400).json({ message: 'Please fill the required fields' }); }

        const user = await collections.users.findOne({ email: email });
        //if not found
        if (!user) { return res.status(401).json({ message: 'Invalid Email' }) }

        const passwordMatches = await bcrypt.compare(password, user.password);
        //pass incorrect
        if (!passwordMatches) { return res.status(401).json({ message: 'Invalid Password' }) }

        //if all valid create a jwt token
        const tokenjwt = process.env.TOKEN
        const token = jwt.sign({ user: user }, tokenjwt);
        res.status(200).json({ token: token })
    } catch (error) {
        res.status(500).send(error.message);
    }
})

//signup function
userRouter.post('/signup', async (req, res) => {
    const { email, password, role } = req.body
    try {
        //check if user with same email exists
        const existuser = await collections.users.findOne({ email })
        if (existuser) { return res.status(409).json({ message: 'Email already exists' }) };

        //password hasing before storing in the db
        const hashedpass = await bcrypt.hash(password, 10)
        //new user object
        const newUser = {       
            email,
            password: hashedpass,
            role: 'user',
        }
        //inserts user to db
        const result = await collections.users.insertOne(newUser);
        res.status(201).json({ message: 'New user created' })
    } catch (error) {
        res.status(500).send('Server error')
    }
}) 