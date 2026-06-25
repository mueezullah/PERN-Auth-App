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
