import express from "express";
import { signup, login ,checkAuth,updateProfile} from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.get("/check", protectRoute, checkAuth);
// Add other user routes here (e.g., checkAuth)

export default userRouter;
