import * as dotenv from 'dotenv'
dotenv.config()
import cors from 'cors'
import express from 'express'
import { connectToDatabase } from './database'

//Routers
import{userRouter} from './users/user.routes'    

const URL = process.env.DB_URL
if (!URL) {
    console.error('No DB Connection available')
    process.exit(1);
}

connectToDatabase(URL)
    .then(() => {
        const app = express();
        app.use(cors())
        app.use('/users', userRouter)

        const port = process.env.PORT
        app.listen(port, () => { console.log(`Server is running on port ${port}`) })
    })
    .catch(error => console.error(error))