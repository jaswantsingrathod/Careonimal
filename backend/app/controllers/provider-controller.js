import Provider from "../models/provider-models.js";
import User from "../models/user-model.js";
import { sendMail } from "../../utils/sendMail.js";
const ProviderController = {};
import { providerValidation, providerUpdateValidation } from "../validations/provider-validation.js";

ProviderController.create = async (req, res) => {
  try {
    const { error, value } = providerValidation.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    const existingProvider = await Provider.findOne({ user: req.userId });
    if (existingProvider) {
      return res
        .status(400)
        .json({ error: "Provider profile already exists for this user." });
    }
    let imageUrl = "";
    if (req.file && req.file.path) {
      imageUrl = req.file.path; // Cloudinary auto adds URL
    }
    const provider = new Provider({
      ...value,
      user: req.userId, // attach user ID from token
      image: imageUrl
    });
    await provider.save();
     await User.findByIdAndUpdate(provider.user, { role: "provider" });

     const user = await User.findById(req.userId);
    //  Send confirmation mail
    await sendMail(
      user.email,
      "Welcome to Careonimal 🐾",
      `
      <h2>Hi ${user.username},</h2>
      <p>Thank you for registering your service <b>${provider.businessName}</b> as a ${provider.serviceType} provider on <b>Careonimal.com</b></p>
      <p>Our team will review and approve your profile soon.</p>
      <br>
      <p>Warm regards,<br>Careonimal Team</p>
      `
    );
    res
      .status(201)
      .json({ message: "Provider registered successfully. Confirmation mail sent.", provider });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

ProviderController.list = async (req, res) => {
  try {
    const { city, serviceType, petType, businessName } = req.query;

    // Role-based filter
    const filters = {};
    if (req.role !== "admin") {
      filters.approvedByAdmin = true;
    }

    // Apply search filters
    if (city) filters.city = { $regex: city, $options: "i" };
    if (serviceType) filters.serviceType = serviceType;
    if (businessName)
      filters.businessName = { $regex: businessName, $options: "i" };
    if (petType)
      filters["servicesOffered.petType"] = { $regex: petType, $options: "i" };

    const providers = await Provider.find(filters)
      .populate("user", "username email")
      .select("-__v")
      .sort({ createdAt: -1 });

    if (!providers.length) {
      return res.status(404).json({ message: "No providers found" });
    }

    res.status(200).json(providers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


ProviderController.approve = async (req, res) => {
  try {
    const id = req.params.id;
    const provider = await Provider.findByIdAndUpdate(
      id,
      { approvedByAdmin: true },
      { new: true }
    );
    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }
    res
      .status(200)
      .json({ message: "Provider approved successfully", provider });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

ProviderController.account = async (req, res) => {
  try {
    const id = req.params.id;
    const provider = await Provider.findById(id).populate(
      "user",
      "username email phone"
    );
    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }
    res.status(200).json(provider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

ProviderController.modify = async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const { error, value } = providerUpdateValidation.validate(body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    const provider = await Provider.findByIdAndUpdate(
      { _id: id, user: req.userId }, // provider can update only their own profile
      value,
      { new: true }
    );
    if (!provider) {
      return res.status(404).json({ error: "Provider not found or unauthorized" });
    }
    if (req.file && req.file.path) {
      provider.image = req.file.path; // Update image if new file is uploaded
    } 
    await provider.save();
    res.status(200).json({ message: "Provider updated successfully", provider });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

ProviderController.remove = async (req, res) => {
  try{
    const id = req.params.id
    const provider = await Provider.findByIdAndDelete(id); // only admin can delete provider accounts
    if(!provider){
      return res.status(404).json({error:  "Provider not found or unauthorized"});
    }
     await User.findByIdAndUpdate(provider.user, { role: "user" });
    res.status(200).json({message: "Provider deleted successfully"});
  }catch(error){
    res.status(500).json({ error: error.message });
  }
}

ProviderController.delete = async (req, res) => {
  try {
    // Find and delete provider by logged-in user ID
    const provider = await Provider.findOneAndDelete({ user: req.userId });
    if (!provider) {
      return res.status(404).json({ error: "No provider profile found for this user" });
    }
    // Change role back to "user"
    await User.findByIdAndUpdate(req.userId, { role: "user" });
    res.status(200).json({ message: "Your provider profile has been deleted successfully" });
  } catch (error) {
    console.error("Error deleting provider profile:", error);
    res.status(500).json({ error: error.message });
  }
};

//  Find nearby providers using Haversine formula
// ProviderController.nearby = async (req, res) => {
//   try {
//     const userLat = parseFloat(req.query.lat);
//     const userLong = parseFloat(req.query.long);
//     const radius = parseFloat(req.query.radius) || 5; // default radius = 5 km

//     if (!userLat || !userLong) {
//       return res.status(400).json({ error: "Latitude and longitude are required" });
//     }

//     // Fetch only approved providers
//     // const providers = await Provider.find({ approvedByAdmin: true });

//     // Earth radius (in km)
//     const R = 6371;

//     // Helper function for distance
//     const calculateDistance = (lat1, lon1, lat2, lon2) => {
//       const toRad = (val) => (val * Math.PI) / 180;
//       const dLat = toRad(lat2 - lat1);
//       const dLon = toRad(lon2 - lon1);
//       const a =
//         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//         Math.cos(toRad(lat1)) *
//           Math.cos(toRad(lat2)) *
//           Math.sin(dLon / 2) *
//           Math.sin(dLon / 2);
//       const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//       return R * c; // distance in km
//     };

//     // Filter nearby providers
//     const nearbyProviders = providers
//       .map((provider) => {
//         const { latitude, longitude } = provider.address;
//         const distance = calculateDistance(userLat, userLong, latitude, longitude);
//         return { ...provider._doc, distance: distance.toFixed(2) };
//       })
//       .filter((p) => p.distance <= radius);

//     res.status(200).json({
//       message: `Providers within ${radius} km`,
//       count: nearbyProviders.length,
//       providers: nearbyProviders,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error.message });
//   }
// };


export default ProviderController;
