import * as userService from "./user.service.js";

export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const profile = await userService.getUserProfileStats(username);
    if (!profile) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error("Error fetching user profile", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    let avatarUrl = req.body.avatar_url;

    if (req.file) {
      const { uploadToS3 } = await import("../../utils/s3.service.js");
      avatarUrl = await uploadToS3(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        "avatars"
      );
    }

    if (!avatarUrl) {
      return res.status(400).json({ success: false, message: "No avatar image file or URL provided" });
    }

    const updatedUser = await userService.updateUserAvatar(userId, avatarUrl);

    return res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      avatar_url: avatarUrl,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user avatar:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update user avatar",
    });
  }
};

