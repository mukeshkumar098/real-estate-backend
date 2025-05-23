import express from 'express'
import { verifyRole } from '../Middelware/isAuthendicate.js';
import {addProperties, deleteProperty, getAllProperties, getPropertyById,verifyEmailOtp,updateUserToSeller, checkVerifiedSeller,sendEmailOtp,incrementViewCount, likeProperty, verifyNumberOtpSMS,searchProperties, sendNumberOtpSMS, updateBioAndSpecialization, updateProperty, } from '../Controller/propertyController.js'
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
propertiesRoute.put('/update-Seller', verifyRole(["admin","buyer","seller"]), updateUserToSeller);
propertiesRoute.get(
  '/check_Verified_Seller',
  verifyRole(["admin", "buyer", "seller"]),
  checkVerifiedSeller,
  (req, res) => {
    const user = req.verifiedSeller;
    res.json({
      message: "User is a verified seller",
      isVerified: true,
      verificationStatus: "approved",
      phoneVerified: true,       // Replace with real values if available
      emailVerified: true,       // Replace with real values if available
      seller: {
        name: user.name,
        email: user.email,
        specialization: user.specialization,
        profilePicture: user.profilePicture,
      },
    });
  }
);



  export {propertiesRoute}