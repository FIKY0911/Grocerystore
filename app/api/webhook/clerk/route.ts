import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/writeClient";
import { NextResponse } from "next/server";

/**
 * Clerk Webhook Handler
 *
 * Endpoint ini menerima notifikasi dari Clerk saat:
 * - User baru mendaftar (user.created)
 * - User update profile (user.updated)
 * - User dihapus (user.deleted)
 * - User sign in (session.created)
 *
 * Setup di Clerk Dashboard:
 * 1. Buka https://dashboard.clerk.com
 * 2. Pilih aplikasi Anda
 * 3. Pergi ke Webhooks
 * 4. Tambah endpoint: https://yourdomain.com/api/webhook/clerk
 * 5. Pilih events: user.created, user.updated, user.deleted,ession.created
 * 6. Copy Signing Secret ke CLERK_WEBHOOK_SECRET di .env
 */

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("❌ Clerk Webhook: Missing svix headers");
    return NextResponse.json(
      { success: false, message: "Missing svix headers" },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Get webhook secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("❌ Clerk Webhook: CLERK_WEBHOOK_SECRET not set");
    return NextResponse.json(
      { success: false, message: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  // Create a new Svix instance with your secret
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("❌ Clerk Webhook: Verification failed", err);
    return NextResponse.json(
      { success: false, message: "Webhook verification failed" },
      { status: 400 }
    );
  }

  // Handle the webhook
  const eventType = evt.type;
  console.log(`📨 Clerk Webhook: Received ${eventType} event`);

  try {
    switch (eventType) {
      case "user.created":
        await handleUserCreated(evt.data);
        break;

      case "user.updated":
        await handleUserUpdated(evt.data);
        break;

      case "user.deleted":
        await handleUserDeleted(evt.data);
        break;

      case "session.created":
        await handleSessionCreated(evt.data);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (error: any) {
    console.error("❌ Clerk Webhook: Error processing event", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Handle user.created event
async function handleUserCreated(data: any) {
  console.log("👤 Creating new user in Sanity:", data.id);

  const primaryEmail = data.email_addresses?.find(
    (email: any) => email.id === data.primary_email_address_id
  );

  const userData = {
    _type: "user",
    clerkUserId: data.id,
    email: primaryEmail?.email_address || "",
    firstName: data.first_name || "",
    lastName: data.last_name || "",
    fullName:
      `${data.first_name || ""} ${data.last_name || ""}`.trim() || "User",
    imageUrl: data.image_url || "",
    phone: data.phone_numbers?.[0]?.phone_number || "",
    createdAt: new Date(data.created_at).toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    totalOrders: 0,
  };

  const result = await writeClient.create(userData);
  console.log("✅ User created in Sanity:", result._id);
}

// Handle user.updated event
async function handleUserUpdated(data: any) {
  console.log("👤 Updating user in Sanity:", data.id);

  // Find existing user
  const existingUser = await writeClient.fetch(
    `*[_type == "user" && clerkUserId == $clerkUserId][0]`,
    { clerkUserId: data.id }
  );

  if (!existingUser) {
    console.log("ℹ️ User not found, creating new user");
    await handleUserCreated(data);
    return;
  }

  const primaryEmail = data.email_addresses?.find(
    (email: any) => email.id === data.primary_email_address_id
  );

  const updateData = {
    email: primaryEmail?.email_address || existingUser.email,
    firstName: data.first_name || existingUser.firstName,
    lastName: data.last_name || existingUser.lastName,
    fullName:
      `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
      existingUser.fullName,
    imageUrl: data.image_url || existingUser.imageUrl,
    phone: data.phone_numbers?.[0]?.phone_number || existingUser.phone,
    updatedAt: new Date().toISOString(),
  };

  await writeClient.patch(existingUser._id).set(updateData).commit();
  console.log("✅ User updated in Sanity:", existingUser._id);
}

// Handle user.deleted event
async function handleUserDeleted(data: any) {
  console.log("👤 Marking user as inactive in Sanity:", data.id);

  const existingUser = await writeClient.fetch(
    `*[_type == "user" && clerkUserId == $clerkUserId][0]`,
    { clerkUserId: data.id }
  );

  if (!existingUser) {
    console.log("ℹ️ User not found in Sanity");
    return;
  }

  // Soft delete - mark as inactive instead of deleting
  await writeClient
    .patch(existingUser._id)
    .set({
      isActive: false,
      updatedAt: new Date().toISOString(),
    })
    .commit();

  console.log("✅ User marked as inactive in Sanity:", existingUser._id);
}

// Handle session.created event (user sign in)
async function handleSessionCreated(data: any) {
  const userId = data.user_id;
  console.log("🔐 User signed in:", userId);

  const existingUser = await writeClient.fetch(
    `*[_type == "user" && clerkUserId == $clerkUserId][0]`,
    { clerkUserId: userId }
  );

  if (!existingUser) {
    console.log("ℹ️ User not found in Sanity, skipping sign-in update");
    return;
  }

  // Update last sign in time
  await writeClient
    .patch(existingUser._id)
    .set({
      lastSignInAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .commit();

  console.log("✅ User sign-in recorded in Sanity:", existingUser._id);
}

