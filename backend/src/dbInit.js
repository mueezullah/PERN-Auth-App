import * as UserModel from "./modules/users/user.model.js";
import * as CampaignModel from "./modules/campaigns/campaign.model.js";
import * as PostModel from "./modules/posts/post.model.js";
import { initTable as initDonationTable } from "./modules/payments/donation.model.js";

export const initializeDatabaseSchema = async () => {
    try {
        // Sequentially boot DB schemas matching explicit foreign key relations
        await UserModel.initializeTable();
        await CampaignModel.initTable();
        await PostModel.initTable();
        await initDonationTable();
        console.log("🚀 Database schema completely verified and initialized");
    } catch (err) {
        console.error("❌ Critical: Failed to initialize database tables:", err);
        throw err;
    }
};