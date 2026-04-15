import { NextRequest, NextResponse } from "next/server";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || "2141471",
  key: process.env.PUSHER_KEY || "5df650ad7b1c47693739",
  secret: process.env.PUSHER_SECRET || "d764c1b0017b28533212",
  cluster: process.env.PUSHER_CLUSTER || "us2",
  useTLS: true,
});

export async function POST(req: NextRequest) {
  try {
    const { event, room, data } = await req.json();

    if (!event || !room) {
      return NextResponse.json({ error: "Missing event or room" }, { status: 400 });
    }

    // Trigger event to the specified room channel
    await pusher.trigger(`room-${room}`, event, data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Pusher trigger error:", error);
    return NextResponse.json({ error: "Trigger failed" }, { status: 500 });
  }
}
