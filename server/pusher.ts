import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || "2141471",
  key: process.env.PUSHER_KEY || "5df650ad7b1c47693739",
  secret: process.env.PUSHER_SECRET || "d764c1b0017b28533212",
  cluster: process.env.PUSHER_CLUSTER || "us2",
  useTLS: true,
});

export default pusher;
