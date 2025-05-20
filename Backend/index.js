import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { dbConnected } from './Config/db.js';
import { userRoute } from './Routes/userRoute.js';
import { propertiesRoute } from './Routes/propertiesRoute.js';
import path from "path"
dotenv.config();

const app = express();
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(cors({
  origin: ("https://realestate-delta-ecru.vercel.app")
  // credentials: true
}));
app.get("/",(req,res)=>{
  res.send("this is home page")
})

app.use(express.json());

app.use("/user", userRoute);
app.use("/properties",propertiesRoute)

app.listen(process.env.PORT, () => {
  dbConnected();
  console.log(`server running on port ${process.env.PORT}`);
});
