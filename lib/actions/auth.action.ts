//this contains auth actions for login and registration
"use server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { cookies } from "next/headers";
import { SessionResult } from "@/types";
import { userSchema } from "../validators";
export const loginAction = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const sessionId = uuid();
    const cookieStore = await cookies();
    const normalizeEmail = email.toLowerCase().trim();
    const checkUser = await prisma.user.findFirst({
      where: { email: normalizeEmail },
      select: { id: true, name: true, email: true, password: true },
    });
    if (!checkUser) {
      return { message: "invalid credentials" };
    }
    const matchPassword = await bcrypt.compare(password, checkUser.password);
    if (!matchPassword) {
      return { message: "invalid credentials" };
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await prisma.session.create({
      data: {
        id: sessionId,
        userId: checkUser.id,
        expiresAt,
      },
    });

    cookieStore.set({
      name: "SessionId",
      value: sessionId,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: expiresAt,
      sameSite: "lax",
    });

    return {
      data: { name: checkUser.name, email: checkUser.email },
      message: "User Logged in successfully",
    };
  } catch (error) {
    console.error("[loginAction] login failure", error);
    return { message: "Something went wrong. Please try again." };
  }
};

export const registerAction = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  try {
    const normalizeEmail = email.toLowerCase().trim();
    const checkUser = await prisma.user.findFirst({
      where: { email: normalizeEmail },
    });
    if (checkUser)
      return { message: "An account with this email already exists" };
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email: normalizeEmail,
        password: hashPassword,
      },
    });

    const result = await loginAction({ email: newUser.email, password });
    return result;
  } catch (error) {
    console.error("[registerAction] error:", error);
    return { message: "Failed to create account. Please try again." };
  }
};

export const logoutAction = async () => {
  const cookiesStore = await cookies();
  const sessionId = cookiesStore.get("SessionId")?.value ?? null;
  if (sessionId !== null) {
    await prisma.session.delete({
      where: { id: sessionId },
    });
    cookiesStore.delete("SessionId");
    cookiesStore.delete("CartSessionId");
    return { success: true };
  }
  return { success: false };
};

export const getSessionAction = async (): Promise<SessionResult | null> => {
  try {
    const cookiesStore = await cookies();
    const sessionId = cookiesStore.get("SessionId")?.value ?? null;
    if (!sessionId) return null;
    const userSession = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });
    if (!userSession) return null;
    if (userSession.expiresAt < new Date()) {
      cookiesStore.delete("SessionId");
      await prisma.session.delete({ where: { id: sessionId } });
      return { success: false, message: "Please login again" };
    }
const { password, ...safeUser } = userSession.user;
return { success: true, user: safeUser };
  } catch (error) {
    console.error("[getSessionAction]: cant get session", error);
    return { success: false, message: "Failed to get session" };
  }
};
