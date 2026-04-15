import { NextRequest, NextResponse } from "next/server";
import Pusher from "pusher";

// Initialize Pusher server-side
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || "2141471",
  key: process.env.PUSHER_KEY || "5df650ad7b1c47693739",
  secret: process.env.PUSHER_SECRET || "d764c1b0017b28533212",
  cluster: process.env.PUSHER_CLUSTER || "us2",
  useTLS: true,
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const socketId = data.get("socket_id") as string;
    const channel = data.get("channel_name") as string;

    if (!socketId || !channel) {
      return NextResponse.json({ error: "Missing socket_id or channel_name" }, { status: 400 });
    }

    // For public channels, no auth needed
    if (!channel.startsWith("private-") && !channel.startsWith("presence-")) {
      return NextResponse.json({ message: "Public channel - no auth needed" });
    }

    // Authorize private/presence channels
    const auth = pusher.authorizeChannel(socketId, channel);
    return NextResponse.json(auth);
  } catch (error) {
    console.error("Pusher auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
