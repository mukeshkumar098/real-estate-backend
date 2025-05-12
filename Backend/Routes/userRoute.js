import express from 'express';
import { forgetPassword, getUnverifiedSellers, getUserById, getUserProfile, getverifiedSellers, resetPassword , updatePassword, updateUserProfile, userLogin, userRegister,  } from '../Controller/userController.js';
import { adminVerifySeller } from '../Middelware/verifySeller.js';
import { verifyRole } from '../Middelware/isAuthendicate.js';
import upload from '../Middelware/uploadMiddleware.js';
const router = express.Router();

router.put("/admin-verify-seller/:id",verifyRole(["admin"]),adminVerifySeller)
router.post("/register",userRegister)
// router.put("/update", verifyRole(["admin", "buyer"]), updateUserProfile);
router.get("/getUserDetail", verifyRole(["admin","buyer"]), getUserById);
router.post("/login",userLogin);
router.post('/forgot-passward', forgetPassword);
router.patch('/reset-password/:token',resetPassword);
router.get("/getUnverifiedSellers",getUnverifiedSellers)
router.get("/getverifiedSellers",getverifiedSellers)


router.get('/profile', verifyRole(["admin","buyer","seller"]), getUserProfile);
router.put('/profile', verifyRole(["admin","buyer","seller"]), upload.single('profilePicture'), updateUserProfile);
router.put('/password', verifyRole(["admin","buyer","seller"]), updatePassword);

export {router as userRoute }