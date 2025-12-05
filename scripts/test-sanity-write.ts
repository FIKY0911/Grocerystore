//anity Write Permission
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.NEXT_PUBLIC_SANITY_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  console.error("❌ Missing environment variables:");
  console.error("NEXT_PUBLIC_SANITY_PROJECT_ID:", projectId ? "✅" : "❌");
  console.error("NEXT_PUBLIC_SANITY_DATASET:", dataset ? "✅" : "❌");
  console.error("NEXT_PUBLIC_SANITY_WRITE_TOKEN:", token ? "✅" : "❌");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2025-10-10",
  token,
  useCdn: false,
});

async function testWrite() {
  console.log("🧪 Testing Sanity Write Permission...\n");
  console.log("📋 Configuration:");
  console.log("  Project ID:", projectId);
  console.log("  Dataset:", dataset);
  console.log("  Token length:", token.length);
  console.log("  Token prefix:", token.substring(0, 10) + "...\n");

  try {
    // Test 1: Create a test document
    console.log("📝 Test 1: Creating test document...");
    const testDoc = {
      _type: "order",
      orderNumber: `test_${Date.now()}`,
      clerkUserId: "test_user",
      customerName: "Test User",
      email: "test@example.com",
      products: [],
      totalPrice: 10000,
      currency: "IDR",
      status: "pending",
      orderDate: new Date().toISOString(),
      xenditTransactionId: "test_inv",
      xenditStatus: "PENDING",
      paymentUrl: "https://test.com",
      address: { _type: "reference", _ref: "test_address" },
      shipper: { _type: "reference", _ref: "test_shipper" },
      amountDiscount: 0,
      availableBanks: [],
      availableRetailOutlets: [],
      availableEwallets: [],
      availableQRCodes: [],
      availableDirectDebits: [],
      availablePaylaters: [],
      shouldExcludeCreditCard: false,
      shouldSendEmail: false,
      expiryDate: new Date().toISOString(),
      merchantName: "Test Merchant",
      merchantProfilePictureUrl: "",
      fees: [],
      items: [],
      successRedirectUrl: "https://test.com/success",
      failureRedirectUrl: "https://test.com/failure",
    };

    const result = await client.create(testDoc);
    console.log("✅ Test document created successfully!");
    console.log("📄 Document ID:", result._id);

    // Test 2: Delete the test document
    console.log("\n🗑️  Test 2: Deleting test document...");
    await client.delete(result._id);
    console.log("✅ Test document deleted successfully!");

    console.log("\n🎉 All tests passed! Write permission is working correctly.");
    console.log("\n💡 Your NEXT_PUBLIC_SANITY_WRITE_TOKEN has proper permissions.");
  } catch (error: any) {
    console.error("\n❌ Test failed!");
    console.error("Error:", error.message);
    
    if (error.statusCode === 403) {
      console.error("\n🔒 Permission Error Detected!");
      console.error("\n📝 How to fix:");
      console.error("1. Go to https://sanity.io/manage");
      console.error("2. Select your project:", projectId);
      console.error("3. Go to 'API' → 'Tokens'");
      console.error("4. Create a new token with 'Editor' or 'Administrator' permissions");
      console.error("5. Copy the token");
      console.error("6. Update NEXT_PUBLIC_SANITY_WRITE_TOKEN in your .env file");
      console.error("7. Restart your dev server");
    }
    
    if (error.response) {
      console.error("\nFull error response:", JSON.stringify(error.response.body, null, 2));
    }
    
    process.exit(1);
  }
}

testWrite();

