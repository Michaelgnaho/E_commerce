import ConnectDB from "@/config/db";
import User from "@/models/User";

export async function GET(req) {
  try {
    await ConnectDB();
    const testUser = await User.create({
      _id: "test123",
      name: "Test User",
      email: "test@example.com",
      imgUrl: "",
    });
    return new Response(JSON.stringify({ success: true, user: testUser }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
