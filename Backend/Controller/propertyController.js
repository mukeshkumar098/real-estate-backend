
import { userModel } from "../Models/userModel.js";
import { propertyModel } from "../Schemas/propertiesSchema.js";
// import { propertyModel } from "../Schemas/propertiesSchema.js";


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
  
  






export {addProperties,getAllProperties,getPropertyById,searchProperties,deleteProperty};