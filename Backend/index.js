import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { dbConnected } from './Config/db.js';
import { userRoute } from './Routes/userRoute.js';
import { propertiesRoute } from './Routes/propertiesRoute.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
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
