import * as UserModel from "./modules/users/user.model.js";
import * as CampaignModel from "./modules/campaigns/campaign.model.js";
import * as PostModel from "./modules/posts/post.model.js";
import { initTable as initDonationTable } from "./modules/payments/donation.model.js";
import * as CommentModel from "./modules/comments/comment.model.js";
import * as LikeModel from "./modules/likes/like.model.js";
import * as followModel from "./modules/follows/follow.model.js"

export const initializeDatabaseSchema = async () => {
    try {
        // Sequentially boot DB schemas matching explicit foreign key relations
        await UserModel.initializeTable();
        await CampaignModel.initTable();
        await PostModel.initTable();
        await initDonationTable();
        await CommentModel.initTable();
        await LikeModel.initTable();
        await followModel.initTable();
        console.log("🚀 Database schema completely verified and initialized");
    } catch (err) {
        console.error("❌ Critical: Failed to initialize database tables:", err);
        throw err;
    }
};