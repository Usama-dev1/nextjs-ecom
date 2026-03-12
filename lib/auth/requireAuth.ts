//lib/auth/requireAuth.ts
import { redirect } from "next/navigation";
import { getSessionAction } from "../actions/auth.action";
export const checkSession = async () => {
  const session = await getSessionAction();
  if (!session || !session.success) {
    redirect("/login");
  }
  return session.user;
};

export const adminOnly = async () => {
  const session = await getSessionAction();
  if (!session || !session.success) {
    redirect("/login");
  }
  const { user } = session;
  if (user.role !== "ADMIN") {
    redirect("/dash");
  }

  return session.user
};
