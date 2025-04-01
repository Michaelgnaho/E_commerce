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
    try {
      // Check if event.data exists before destructuring
      if (!event.data) {
        console.error("Event data is undefined:", event);
        return { error: "Event data is missing" };
      }

      // Log the raw event for debugging
      console.log("Received clerk/user.created event:", JSON.stringify(event));

      const { id, first_name, email_addresses, last_name, imageUrl } =
        event.data;

      // Validate required fields
      if (!id || !email_addresses || !email_addresses.length) {
        console.error("Missing required user data in event:", event.data);
        return { error: "Missing required user data" };
      }

      const userData = {
        _id: id,
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        email: email_addresses[0].email_address,
        imgUrl: imageUrl || "",
      };

      await ConnectDB();

      // Check if user already exists
      const existingUser = await User.findById(id);
      if (existingUser) {
        console.log(`User ${id} already exists, updating...`);
        await User.findByIdAndUpdate(id, userData);
        return { status: "updated", userId: id };
      }

      // Create the new user
      const newUser = await User.create(userData);
      console.log("User created successfully:", newUser._id);

      return {
        status: "created",
        userId: id,
        email: userData.email,
      };
    } catch (error) {
      console.error("Error processing clerk/user.created event:", error);
      return { error: error.message, stack: error.stack };
    }
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
    try {
      // Check if we have the expected data
      if (!event.data || !event.data.id) {
        console.error("Missing required data in event:", event);
        return { error: "Missing required data" };
      }

      const { id } = event.data;
      await ConnectDB();
      await User.findByIdAndDelete(id);
      return { success: true, id };
    } catch (error) {
      console.error("Error in syncUserDeletion:", error);
      return { error: error.message };
    }
  }
);
