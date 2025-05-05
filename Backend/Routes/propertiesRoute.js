import express from 'express'
import { verifyRole } from '../Middelware/isAuthendicate.js';
import {addProperties, deleteProperty, getAllProperties, getPropertyById, searchProperties, updateProperty, } from '../Controller/propertyController.js'
import { upload } from '../Utils/S3.service.js';

const propertiesRoute=express.Router();

propertiesRoute.post("/add-properties",verifyRole(["seller", "admin"]),upload.array('images', 10),addProperties)
propertiesRoute.get("/getProperties",getAllProperties)
propertiesRoute.put("/update-property/:id", verifyRole(["seller", "admin"]),updateProperty)
propertiesRoute.delete("/delete-property/:id",verifyRole(["seller", "admin"]),deleteProperty)
propertiesRoute.get("/getPropertyById/:id",getPropertyById)
propertiesRoute.get("/searchProperties",searchProperties)


  export {propertiesRoute}