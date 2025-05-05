import { userModel } from "../Models/userModel.js";



export const adminVerifySeller = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id, "seller");
        if (!id) {
            return res.status(400).json({ message: "Seller ID is required" });
        }
        const seller = await userModel.findById(id);
        if (!seller || seller.role !== "seller") {
            return res.status(404).json({ message: "Seller not found or not a seller" });
        }
        if (seller.isVerified) {
            return res.status(400).json({ message: "Seller is already verified" });
        }
        seller.isVerified = true;
        await seller.save();

        return res.status(200).json({
            message: "Seller verified successfully",
            seller
        });
    } catch (error) {
        console.error("Error verifying seller:", error);
        return res.status(500).json({ message: "Error verifying seller", error });
    }
};

