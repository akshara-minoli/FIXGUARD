import { getUser, listUsers } from "../services/admin.service.js";
import { userIdParamsSchema } from "../validators/admin.validator.js";

export function testAccess(_request, response) {
  response.status(200).json({
    success: true,
    message: "Admin access granted",
  });
}

export async function getUsers(_request, response) {
  const users = await listUsers();
  response.status(200).json({ success: true, users });
}

export async function getUserById(request, response) {
  const { id } = userIdParamsSchema.parse(request.params);
  const user = await getUser(id);
  response.status(200).json({ success: true, user });
}
