import { Router } from "express";
import { loginController, meController } from "../controllers/authController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema } from "../schemas/authSchema.js";
import { cookieOptions } from "../config.js";
export const authRoutes = Router();
authRoutes.post("/login", validate({ body: loginSchema }), loginController);
authRoutes.get("/me", authenticate, meController);
authRoutes.post("/logout", (_request, response) => {
  response.clearCookie("access_token", cookieOptions);
  response.status(204).end();
});
