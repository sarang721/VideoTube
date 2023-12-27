import dotenv from "dotenv"
import connectDB from "./db/index.js"
import {app} from './app.js'

dotenv.config({
    path:'.env'
})

connectDB()

app.listen(5000,()=>{
    console.log("Server started on port 5000")
})



