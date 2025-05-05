import mongoose from "mongoose";

const propertiesSchema = new mongoose.Schema(
  {
    seller: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    title: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 100 
    },
    description: { 
      type: String,
      trim: true,
      maxlength: 2000 
    },
    property_type: {
      type: String,
      enum: ['Apartment', 'Villa', 'House', 'Penthouse', 'Commercial', 'Land', 'Farmhouse'],
      required: true,
    },
    property_subtype: {
      type: String,
      enum: ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Other'],
      required: true,
    },
    images: [{ 
      type: String,
      validate: {
        validator: function(array) {
          return array.length <= 20;
        },
        message: 'Cannot have more than 20 images'
      }
    }],
    price: { 
      type: Number, 
      required: true,
      min: 0 
    },
    // price_per_sqft field REMOVED to avoid conflict with virtual
    location: { 
      type: String, 
      required: true,
      trim: true 
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      postal_code: { type: String, trim: true },
      country: { type: String, default: 'India', trim: true }
    },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    area: {
      built_up: { type: Number, required: true }, // in sqft
      carpet: { type: Number }, // in sqft
      plot: { type: Number } // in sqft (for land)
    },
    bedrooms: { type: Number, min: 0 },
    bathrooms: { type: Number, min: 0 },
    balconies: { type: Number, min: 0 },
    floors: { type: Number, min: 0 },
    floor_number: { type: Number },
    facing: {
      type: String,
      enum: ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West']
    },
    age: { type: Number, min: 0 }, // in years
    status: {
      type: String,
      enum: ['Available', 'Sold', 'Rented', 'Under Offer', 'Under Construction', 'Coming Soon'],
      default: 'Available',
    },
    amenities: [{
      type: String,
      enum: [
        'Parking', 'Swimming Pool', 'Gym', 'Lift', 'Security', 'Power Backup',
        'Water Supply', 'Park', 'Clubhouse', 'Play Area', 'Intercom', 'Maintenance Staff',
        'Rain Water Harvesting', 'Shopping Center', 'Hospital', 'School', 'Pet Friendly'
      ]
    }],
    ownership_type: {
      type: String,
      enum: ['Freehold', 'Leasehold', 'Co-operative Society', 'Power of Attorney'],
      required: true
    },
    possession_status: {
      type: String,
      enum: ['Ready to Move', 'Under Construction', 'New Launch']
    },
    approved_by: [{
      type: String,
      enum: ['RERA', 'Local Authority', 'NA']
    }],
    contact_info: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true }
    },
    is_featured: { type: Boolean, default: false },
    is_verified: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ✅ Virtual for price per sqft
propertiesSchema.virtual('price_per_sqft').get(function () {
  if (this.area && this.area.built_up) {
    return Math.round(this.price / this.area.built_up);
  }
  return null;
});

// Indexes
propertiesSchema.index({ location: 'text', title: 'text' });
propertiesSchema.index({ price: 1 });
propertiesSchema.index({ coordinates: '2dsphere' });

// Pre-save hook
propertiesSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

export const propertyModel = mongoose.model('Property', propertiesSchema);

