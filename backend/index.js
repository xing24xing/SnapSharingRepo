import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import con from "./utils/db.js";
import userRoute from './routes/userRoute.js'
import postRoute from './routes/postRoute.js'
import messageRoute from './routes/messageRoute.js'
dotenv.config({});
const PORT = process.env.PORT || 3000;
const app = express();
const corOptions ={
    origin:'http://localhost:5173',
    credentials:true
}
// app.get("/",(req,res)=>{
//     return res.status(200).json({
//         message:"i am making insta",
//         success:true
//     })
// })

app.use(cors(corOptions))
app.use(cookieParser())
app.use(express.urlencoded({extended:true}));
app.use(express.json())
app.use("/api/v1/user",userRoute);
app.use("/api/v1/post",postRoute);
app.use("/api/v1/message",messageRoute);
app.listen((PORT),()=>{
    con();
    console.log(`Server listen at ${PORT}`);
    
})
