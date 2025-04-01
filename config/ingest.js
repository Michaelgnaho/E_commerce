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

// inngest function to handle user update
export const syncUserUpdate = inngest.createFunction(
  { id: "sync-user-update-from-clerk" },
  { event: "clerk/user.updated" },
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
    await User.findByIdAndUpdate(id, userData);
    console.log("Event received:", event);
    return event;
  }
);

// inngest function to handle user deletion
export const syncUserDeletion = inngest.createFunction(
  { id: "sync-user-deletion-from-clerk" },
  { event: "clerk/user.deleted" },
  async (event) => {
    // Handle the event here
    const { id } = event.data;

    await ConnectDB();
    await User.findByIdAndDelete(id);
    console.log("Event received:", event);
    return event;
  }
);
