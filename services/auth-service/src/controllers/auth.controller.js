import {
  getUserById,
  loginUser,
  registerUser,
  updateUserProfile,
} from "../services/auth.service.js";
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from "../validators/auth.validator.js";

export async function register(request, response) {
  const input = registerSchema.parse(request.body);
  const user = await registerUser(input);

  response.status(201).json({
    success: true,
    message: "User registered successfully",
    user,
  });
}

export async function login(request, response) {
  const input = loginSchema.parse(request.body);
  const result = await loginUser(input);

  response.status(200).json({
    success: true,
    message: "Login successful",
    ...result,
  });
}

export async function me(request, response) {
  const user = await getUserById(request.auth.userId);

  response.status(200).json({ success: true, user });
}

export async function updateMe(request, response) {
  const input = updateProfileSchema.parse(request.body);
  const user = await updateUserProfile(request.auth.userId, input);

  response.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
}
