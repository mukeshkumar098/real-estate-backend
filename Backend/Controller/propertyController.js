
import { userModel } from "../Models/userModel.js";
import { propertyModel } from "../Schemas/propertiesSchema.js";
// import { propertyModel } from "../Schemas/propertiesSchema.js";
import twilio from 'twilio';
import dotenv from 'dotenv';
import axios from "axios";
import transporter from "../Utils/sendMail.js";

dotenv.config();

const addProperties = async (req, res) => {
  try {
    const {
      title,
      description,
      property_type,
      property_subtype,
      bedrooms,
      bathrooms,
      balconies,
      floor_number,
      total_floors,
      price,
      location,
      street,
      city,
      state,
      postal_code,
      country,
      latitude,
      longitude,
      built_up_area,
      carpet_area,
      plot_area,
      facing,
      age,
      ownership_type,
      possession_status,
      amenities,
      approved_by,
      contact_name,
      contact_phone,
      contact_email
    } = req.body;

    // Auth check
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: Please log in' });
    }

    const seller = await userModel.findById(req.user.id);
    if (!seller || seller.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can add properties' });
    }

    if (!seller.isVerified) {
      return res.status(403).json({ message: 'You must be verified by an admin to add properties' });
    }

    // Required fields check
    const requiredFields = [
      'title', 'property_type', 'property_subtype',
      'price', 'location', 'city', 'state',
      'latitude', 'longitude', 'built_up_area', 'ownership_type'
    ];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ message: 'Missing required fields', missingFields });
    }

    // Numeric validations
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }

    if (isNaN(built_up_area) || built_up_area <= 0) {
      return res.status(400).json({ message: 'Built-up area must be a positive number' });
    }

    // Image processing
    const imageUrls = req.files ? req.files.map(file => file.location) : [];
    if (imageUrls.length === 0) {
      return res.status(400).json({ message: 'At least one property image is required' });
    }
    if (imageUrls.length > 20) {
      return res.status(400).json({ message: 'Cannot upload more than 20 images' });
    }

    // Property creation
    const newProperty = new propertyModel({
      seller: req.user.id,
      title,
      description,
      property_type,
      property_subtype,
      images: imageUrls,
      price,
      location,
      address: {
        street,
        city,
        state,
        postal_code,
        country: country || 'India'
      },
      coordinates: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      area: {
        built_up: parseFloat(built_up_area),
        carpet: carpet_area ? parseFloat(carpet_area) : undefined,
        plot: plot_area ? parseFloat(plot_area) : undefined
      },
      bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
      bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
      balconies: balconies ? parseInt(balconies) : undefined,
      floor_number: floor_number ? parseInt(floor_number) : undefined,
      floors: total_floors ? parseInt(total_floors) : undefined,
      facing,
      age: age ? parseInt(age) : undefined,
      status: 'Available',
      amenities: Array.isArray(amenities) ? amenities : (amenities ? amenities.split(',') : []),
      approved_by: Array.isArray(approved_by) ? approved_by : (approved_by ? approved_by.split(',') : ['NA']),
      ownership_type,
      possession_status,
      contact_info: {
        name: contact_name || seller.name,
        phone: contact_phone || seller.phone,
        email: contact_email || seller.email
      }
    });

    await newProperty.save();

    res.status(201).json({
      success: true,
      message: 'Property added successfully',
      property: newProperty
    });

  } catch (error) {
    console.error('Error adding property:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: 'Validation error', errors });
    }

    res.status(500).json({ success: false, message: 'Server error while adding property', error: error.message });
  }
};






  const getAllProperties = async (req, res) => {
    try {
      const properties = await propertyModel.find();
      console.log(properties);
      res.send(properties)
    
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Server error" });
    }
  };


 export  const updateProperty = async (req, res) => {
    try {
      const { id } = req.params;
      const updatedData = req.body;


      console.log(id,updatedData,"id");
      
  
      const property = await propertyModel.findById(id);
      console.log(property,"property");
      
  
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      console.log(req.user.id,"ndsffnnfnkj");
      
  
      if (property.seller.toString() !== req.user.id) {
        return res.status(403).json({ message: "You are not authorized to update this property" });
      }
  
      const updatedProperty = await propertyModel.findByIdAndUpdate(
        id,
        updatedData,
        { new: true }
      );
  
      res.status(200).json({
        message: "Property updated successfully",
        property: updatedProperty,
      });
    } catch (error) {
      console.error("Error updating property:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  


  const deleteProperty = async (req, res) => {
    try {
      const { id } = req.params;
      console.log(id);


      
      const property = await propertyModel.findById(id);
      console.log(property,"property");
      
      if (property.seller.toString() !== req.user.id) {
        return res.status(403).json({ message: "You are not authorized to update this property" });
      }
      
  
      const deletedProperty = await propertyModel.findByIdAndDelete(id);
  
      if (!deletedProperty) {
        return res.status(404).json({ message: "Property not found" });
      }
  
      res.status(200).json({ message: "Property deleted successfully" });
    } catch (error) {
      console.error("Error deleting property:", error);
      res.status(500).json({ message: "Server error" });
    }
  };


 const getPropertyById = async (req, res) => {
    try {
      const { id } = req.params;
      const property = await propertyModel.findById(id);
  
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
  
      res.status(200).json(property);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ message: "Server error" });
    }
  };


  const searchProperties = async (req, res) => {
    try {
      const { location, price, property_type } = req.query;
  
      const filter = {};
  
      if (location) {
        filter.location = { $regex: location, $options: 'i' };
      }
  
      if (property_type) {
        filter.property_type = { $regex: property_type, $options: 'i' }; // Corrected 'type' to 'property_type'
      }
  
      if (price) {
        filter.price = { $lte: Number(price) };
      }
  
      const properties = await propertyModel.find(filter);
      res.status(200).json(properties);
    } catch (error) {
      console.error('Error searching properties:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  
  export const incrementViewCount = async (req, res) => {
  const propertyId = req.params.id;
  console.log(propertyId,"this is a propertey id ");
  

  try {
    const property = await propertyModel.findByIdAndUpdate(
      propertyId,
      { $inc: { views: 1 } }, // Increment by 1
      { new: true } // Return the updated document
    );

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.status(200).json({
      message: 'View count updated',
      views: property.views,
      propertyId: property._id,
    });
  } catch (error) {
    console.error('Error updating views:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const likeProperty = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  try {
    const property = await propertyModel.findById(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.likedBy.includes(userId)) {
      return res.status(400).json({ message: "You have already liked this property" });
    }

    // Use atomic update to avoid validation
    await propertyModel.updateOne(
      { _id: id },
      {
        $inc: { likes: 1 },
        $addToSet: { likedBy: userId },
      }
    );

    res.status(200).json({ message: "Property liked successfully" });
  } catch (error) {
    console.error("Error liking property:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};





// Twilio setup
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Controller: Send OTP via MSG91
export const sendNumberOtpSMS = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    const cleanedNumber = phoneNumber.replace(/\D/g, ''); // digits only
    const formattedPhoneNumber = `91${cleanedNumber}`; // MSG91 needs country code without '+'

    const otp = generateOTP();

    // Save OTP & expiry in DB
    const dbPhone = `+91${cleanedNumber}`;
    let user = await userModel.findOne({ phoneNumber: dbPhone });

    if (!user) {
      user = new userModel({ phoneNumber: dbPhone });
    }

    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    await user.save();

    // Send OTP via MSG91
    const msg91Response = await axios.get('https://api.msg91.com/api/v5/otp', {
      params: {
        authkey: process.env.MSG91_AUTH_KEY,
        mobile: formattedPhoneNumber,
        sender: process.env.MSG91_SENDER_ID,
        otp: otp,
        template_id: process.env.MSG91_TEMPLATE_ID
      }
    });

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      otpLength: otp.length,
      expiresIn: '5 minutes',
      data: msg91Response.data
    });

  } catch (error) {
    console.error('MSG91 OTP error:', error?.response?.data || error.message);

    return res.status(500).json({
      success: false,
      error: 'Failed to send OTP',
      details: error?.response?.data || error.message
    });
  }
};


export const verifyNumberOtpSMS = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and OTP are required'
      });
    }

    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    const dbPhone = `+91${cleanedNumber}`;

    const user = await userModel.findOne({ phoneNumber: dbPhone });

    if (!user || !user.otp || !user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        error: 'OTP not found. Please request a new one.'
      });
    }

    // Check if OTP is expired
    if (user.otpExpiresAt < Date.now()) {
      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please request a new one.'
      });
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP'
      });
    }

    // OTP verified successfully
    user.otp = null;
    user.otpExpiresAt = null;
    user.isVerified = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Phone number verified successfully',
      userId: user._id
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'OTP verification failed',
      details: error.message
    });
  }
};
export const updateBioAndSpecialization = async (req, res) => {
  const { bio, specialization } = req.body;
  const userId = req.user._id;

  try {
    const user = await userModel.findByIdAndUpdate(userId, {
      bio,
      specialization
    }, { new: true });

    res.status(200).json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};






const otpStore = new Map();

const generateEmailOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const sendEmailOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const otp = generateEmailOTP();
  otpStore.set(email, otp);

  try {
    await transporter.sendMail({
      from: "OTP Verification real-estate098@email.com",
      to: email,
      subject: 'Your OTP Code',
      html: `<p>Your OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>`
    });

    setTimeout(() => otpStore.delete(email), 5 * 60 * 1000);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

export const verifyEmailOtp = (req, res) => {
  const { email, otp } = req.body;
  const storedOtp = otpStore.get(email);

  if (!storedOtp) return res.status(400).json({ message: 'OTP expired or not found' });

  if (storedOtp === otp) {
    otpStore.delete(email);
    res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
};




export {addProperties,getAllProperties,getPropertyById,searchProperties,deleteProperty};