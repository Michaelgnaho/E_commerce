import { Inngest } from "inngest";
import { connect } from "mongoose";
import ConnectDB from "./db";
import User from "@/models/User";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "my-app" });

// Create a function to handle the event
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async (event) => {
    // Handle the event here
    const { id, first_name, email_addresses, last_name, imageUrl } = event.data;
    const userData = {
      _id: id,
      name: `${first_name} ${last_name}`,
      email: email_addresses[0].email_address,
      imgUrl: imageUrl,
    };

    await ConnectDB();
    await User.create(userData);
    console.log("Event received:", event);
    return event;
  }
);
