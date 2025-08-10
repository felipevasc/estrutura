import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ipId = parseInt(params.id, 10);

  if (isNaN(ipId)) {
    return NextResponse.json({ error: 'Invalid IP ID' }, { status: 400 });
  }

  try {
    const sambaUsers = await prisma.sambaUser.findMany({
      where: { ipId },
    });

    const sambaShares = await prisma.sambaShare.findMany({
      where: { ipId },
    });

    return NextResponse.json({ users: sambaUsers, shares: sambaShares });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch Samba data' }, { status: 500 });
  }
}
