import { Inngest } from "inngest";
import ConnectDB from "./db";
import User from "@/models/User";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "my-app" });

// Create a function to handle the event
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    // Destructure `event` from the argument
    try {
      // Access the nested event data
      const clerkEventData = event.data; // This is the top-level Clerk event data
      if (!clerkEventData) {
        console.error("Clerk event data is undefined:", event);
        return { error: "Clerk event data is missing" };
      }

      // Log the raw event for debugging
      console.log(
        "Received clerk/user.created event:",
        JSON.stringify(event, null, 2)
      );

      // Extract user data from clerkEventData
      const { id, first_name, email_addresses, last_name, image_url } =
        clerkEventData;

      // Validate required fields
      if (!id || !email_addresses || !email_addresses.length) {
        console.error("Missing required user data:", clerkEventData);
        return { error: "Missing required user data" };
      }

      const userData = {
        _id: id,
        name: `${first_name || ""} ${last_name || ""}`.trim() || "Unnamed User",
        email: email_addresses[0].email_address,
        imgUrl: image_url || "", // Use image_url instead of imageUrl
      };

      console.log("Connecting to MongoDB...");
      await ConnectDB();
      console.log("MongoDB connected, processing user...");

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

// Update syncUserUpdate similarly
export const syncUserUpdate = inngest.createFunction(
  { id: "sync-user-update-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    try {
      const clerkEventData = event.data;
      if (!clerkEventData) {
        console.error("Clerk event data is undefined:", event);
        return { error: "Clerk event data is missing" };
      }

      const { id, first_name, email_addresses, last_name, image_url } =
        clerkEventData;
      const userData = {
        _id: id,
        name: `${first_name || ""} ${last_name || ""}`.trim() || "Unnamed User",
        email: email_addresses[0].email_address,
        imgUrl: image_url || "",
      };

      await ConnectDB();
      await User.findByIdAndUpdate(id, userData);
      console.log("User updated:", event);
      return event;
    } catch (error) {
      console.error("Error in syncUserUpdate:", error);
      return { error: error.message };
    }
  }
);

// Update syncUserDeletion similarly
export const syncUserDeletion = inngest.createFunction(
  { id: "sync-user-deletion-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      const clerkEventData = event.data;
      if (!clerkEventData || !clerkEventData.id) {
        console.error("Missing required data in event:", event);
        return { error: "Missing required data" };
      }

      const { id } = clerkEventData;
      await ConnectDB();
      await User.findByIdAndDelete(id);
      console.log("User deleted:", id);
      return { success: true, id };
    } catch (error) {
      console.error("Error in syncUserDeletion:", error);
      return { error: error.message };
    }
  }
);
