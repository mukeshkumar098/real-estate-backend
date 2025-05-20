import express from 'express'
import { verifyRole } from '../Middelware/isAuthendicate.js';
import {addProperties, deleteProperty, getAllProperties, getPropertyById,verifyEmailOtp, sendEmailOtp,incrementViewCount, likeProperty, verifyNumberOtpSMS,searchProperties, sendNumberOtpSMS, updateBioAndSpecialization, updateProperty, } from '../Controller/propertyController.js'
import { upload } from '../Utils/S3.service.js';

const propertiesRoute=express.Router();

propertiesRoute.post("/add-properties",verifyRole(["seller", "admin"]),upload.array('images', 10),addProperties)
propertiesRoute.get("/getProperties",getAllProperties)
propertiesRoute.put("/update-property/:id", verifyRole(["seller", "admin"]),updateProperty)
propertiesRoute.delete("/delete-property/:id",verifyRole(["seller", "admin"]),deleteProperty)
propertiesRoute.get("/getPropertyById/:id",getPropertyById)
propertiesRoute.get("/searchProperties",searchProperties)
propertiesRoute.put("/views/:id",verifyRole(["seller", "admin","buyer"]),incrementViewCount)
propertiesRoute.put("/like/:id", verifyRole(["seller", "admin","buyer"]), likeProperty);


propertiesRoute.put('/update-phone', verifyRole(["seller", "admin","buyer"]), sendNumberOtpSMS);
propertiesRoute.post('/verify-otp', verifyRole(["seller", "admin","buyer"]), verifyNumberOtpSMS);
propertiesRoute.post('/emailOTP', verifyRole(["seller", "admin","buyer"]), sendEmailOtp);
propertiesRoute.post('/verify-email', verifyRole(["seller", "admin","buyer"]), verifyEmailOtp);
propertiesRoute.put('/update-profile', verifyRole(["seller", "admin","buyer"]), updateBioAndSpecialization);


  export {propertiesRoute}