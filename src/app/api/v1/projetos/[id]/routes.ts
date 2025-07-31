import prisma from "@/database";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query
  res.json({ slug })
}
