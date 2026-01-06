import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/writeClient";
import { client } from "@/sanity/lib/client";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { addressId, formData } = body;

    console.log("🔄 API: Updating address:", addressId);
    console.log("📝 API: Form data:", formData);

    if (!addressId || !formData) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Jika set default, unset semua address lain dulu
    if (formData.default) {
      console.log("⚙️ API: Setting as default, unsetting others...");
      const allAddresses = await client.fetch(
        `*[_type=="address" && _id != $id]`,
        { id: addressId }
      );
      
      for (const addr of allAddresses) {
        await writeClient.patch(addr._id).set({ default: false }).commit();
      }
    }

    // Update address
    const updateData = {
      name: formData.name.trim(),
      email: formData.email || "",
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state,
      shipper: {
        _type: "reference",
        _ref: formData.shipper,
      },
      zip: formData.zip.trim(),
      default: formData.default,
    };

    console.log("💾 API: Updating with data:", updateData);

    const result = await writeClient
      .patch(addressId)
      .set(updateData)
      .commit();

    console.log("✅ API: Update successful:", result);

    return NextResponse.json({
      success: true,
      message: "Address updated successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("❌ API: Error updating address:", error);
    console.error("❌ API: Error details:", {
      message: error.message,
      statusCode: error.statusCode,
      response: error.response,
    });

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update address",
        error: error.toString(),
      },
      { status: error.statusCode || 500 }
    );
  }
}
