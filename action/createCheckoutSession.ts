// app/actions/createCheckoutSession.ts
'use server';

import { randomUUID } from 'crypto';
import { Address } from '@/sanity.types';
import { writeClient } from '@/sanity/lib/writeClient';
import { 
  getXenditServerKey, 
  getXenditAuthHeader,
  formatPhoneForXendit,
  validateXenditAmount 
} from '@/lib/xendit';
import { incrementUserOrderCount } from '@/lib/updateUserOrderCount';

interface CartProduct {
  _id: string;
  name: string;
  price: number;
  category?: string;
  url?: string;
}

interface GroupedItem {
  product: CartProduct;
  quantity: number;
}

export interface Metadata {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  clerkUserId: string;
  address: Address;
  shipperId: string;
}

export async function createCheckoutSession(
  groupedItems: GroupedItem[],
  metadata: Metadata
) {
  try {
    // Validasi input
    if (!groupedItems.length) {
      throw new Error('Keranjang kosong');
    }
    
    if (!metadata.address?._id) {
      throw new Error('Alamat tidak valid');
    }
    
    if (!metadata.shipperId) {
      throw new Error('Jasa pengiriman belum dipilih');
    }

    // Hitung total & validasi minimum amount untuk Xendit
    const subtotal = groupedItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const total = validateXenditAmount(subtotal);

    // Generate unique order number
    const orderNumber = `order_${randomUUID()}`;

    // Prepare customer data untuk Xendit
    const customerData: {
      givenNames: string;
      email: string;
      mobileNumber?: string;
    } = {
      givenNames: metadata.customerName,
      email: metadata.customerEmail,
    };

    // Note: Phone number tidak tersedia di Address schema
    // Jika diperlukan, tambahkan field 'phone' ke Address schema di Sanity

    // Redirect URLs - Gunakan NEXT_PUBLIC_SITE_URL dari .env
    // Fallback ke localhost untuk development
    const redirectBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // Remove trailing slash jika ada
    const baseUrl = redirectBaseUrl.endsWith('/') 
      ? redirectBaseUrl.slice(0, -1) 
      : redirectBaseUrl;
    
    const successRedirectUrl = `${baseUrl}/success?orderNumber=${orderNumber}`;
    const failureRedirectUrl = `${baseUrl}/cart`;
    
    console.log('🌐 Redirect URLs:');
    console.log('📍 Base URL:', baseUrl);
    console.log('✅ Success redirect:', successRedirectUrl);
    console.log('❌ Failure redirect:', failureRedirectUrl);
    console.log('');
    console.log('📡 Webhook URL (untuk Xendit callback):');
    console.log('🔗', process.env.NEXT_PUBLIC_SITE_URL || 'Not configured');

    // Prepare invoice data untuk Xendit
    const invoiceData = {
      externalId: orderNumber,
      amount: total,
      payerEmail: metadata.customerEmail,
      description: `Order dari ${metadata.customerName}`,
      customer: customerData,
      invoiceDuration: 86400, // 24 jam
      successRedirectUrl: successRedirectUrl,
      failureRedirectUrl: failureRedirectUrl,
      currency: 'IDR' as const,
      items: groupedItems.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        category: item.product.category || 'Uncategorized',
        url: item.product.url || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/product/${item.product._id}`
      })),
    };

    console.log('📤 Creating invoice with Xendit SDK:', {
      external_id: invoiceData.externalId,
      amount: invoiceData.amount,
      email: invoiceData.payerEmail,
    });

    // Validasi XENDIT_SERVER_KEY sebelum membuat invoice
    let serverKey: string;
    try {
      serverKey = getXenditServerKey();
      console.log('✅ XENDIT_SERVER_KEY validated');
    } catch (error: any) {
      console.error('❌ XENDIT_SERVER_KEY validation failed:', error.message);
      throw new Error('Konfigurasi payment gateway tidak lengkap. Hubungi administrator.');
    }

    // Create invoice di Xendit menggunakan fetch API (lebih reliable)
    let invoice;
    try {
      console.log('📤 Creating invoice with Xendit API...');
      console.log('🔑 Server key length:', serverKey.length);
      console.log('🔑 Server key prefix:', serverKey.substring(0, 15));
      console.log('📋 Invoice data:', JSON.stringify({
        externalId: invoiceData.externalId,
        amount: invoiceData.amount,
        payerEmail: invoiceData.payerEmail,
        currency: invoiceData.currency,
      }, null, 2));
      
      // Convert camelCase ke snake_case untuk Xendit API
      const xenditPayload = {
        external_id: invoiceData.externalId,
        amount: invoiceData.amount,
        payer_email: invoiceData.payerEmail,
        description: invoiceData.description,
        customer: {
          given_names: invoiceData.customer.givenNames,
          email: invoiceData.customer.email,
          ...(invoiceData.customer.mobileNumber && {
            mobile_number: invoiceData.customer.mobileNumber,
          }),
        },
        invoice_duration: invoiceData.invoiceDuration,
        success_redirect_url: invoiceData.successRedirectUrl,
        failure_redirect_url: invoiceData.failureRedirectUrl,
        currency: invoiceData.currency,
        items: invoiceData.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          category: item.category,
          url: item.url,
        })),
      };

      // Create invoice menggunakan fetch API dengan auth header dari helper
      const response = await fetch('https://api.xendit.co/v2/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getXenditAuthHeader(),
        },
        body: JSON.stringify(xenditPayload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error('❌ Xendit API error:', JSON.stringify(error, null, 2));
        
        // Handle specific Xendit errors
        if (error.error_code === 'DUPLICATE_INVOICE_ERROR' || 
            error.message?.includes('already exists')) {
          throw new Error('Nomor pesanan sudah digunakan. Silakan coba lagi.');
        }
        
        if (response.status === 401 || error.message?.includes('Invalid token')) {
          throw new Error('API Key Xendit tidak valid. Pastikan XENDIT_SERVER_KEY sudah benar di file .env');
        }
        
        throw new Error(
          error.message || 
          `Gagal membuat invoice pembayaran. Status: ${response.status}`
        );
      }

      invoice = await response.json();
      
      console.log('✅ Invoice created successfully:', {
        id: invoice.id,
        status: invoice.status,
        invoice_url: invoice.invoice_url,
      });
    } catch (error: any) {
      console.error('❌ Xendit error details:', {
        message: error?.message,
        status: error?.status,
        statusCode: error?.statusCode,
        fullError: JSON.stringify(error, null, 2),
      });
      
      // Re-throw error dengan pesan yang lebih jelas
      if (error.message && !error.message.includes('Gagal membuat invoice')) {
        throw error;
      }
      
      throw new Error(
        error?.message || 
        'Gagal membuat invoice pembayaran. Silakan coba lagi.'
      );
    }

    // Prepare products data dari cart
    const productsData = groupedItems.map((item) => {
      console.log('🔍 Processing item:', {
        productId: item.product._id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      });
      
      return {
        _key: `product-${item.product._id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        _type: 'object',
        product: { _type: 'reference', _ref: item.product._id },
        quantity: item.quantity,
        priceAtPurchase: item.product.price,
      };
    });

    console.log('🛒 Cart products to save:', {
      count: productsData.length,
      products: productsData.map(p => ({
        productId: p.product._ref,
        quantity: p.quantity,
        price: p.priceAtPurchase
      }))
    });

    // Validasi products data
    if (productsData.length === 0) {
      throw new Error('Tidak ada produk untuk disimpan');
    }

    // Validasi setiap product reference
    const invalidProducts = productsData.filter(p => !p.product._ref);
    if (invalidProducts.length > 0) {
      console.error('❌ Invalid product references:', invalidProducts);
      throw new Error('Beberapa produk tidak memiliki ID yang valid');
    }

    // ============================================
    // REDUCE STOCK - Kurangi stok saat order dibuat
    // ============================================
    console.log('📦 Reducing stock for products...');
    const stockReductions = [];
    
    for (const item of groupedItems) {
      try {
        // Fetch current stock
        const product = await writeClient.fetch(
          `*[_type == "product" && _id == $productId][0]{_id, name, stock}`,
          { productId: item.product._id }
        );
        
        if (!product) {
          console.error(`❌ Product not found: ${item.product._id}`);
          continue;
        }
        
        const currentStock = product.stock || 0;
        const newStock = Math.max(0, currentStock - item.quantity);
        
        console.log(`📦 ${product.name}: ${currentStock} → ${newStock} (qty: ${item.quantity})`);
        
        // Update stock
        await writeClient
          .patch(product._id)
          .set({ stock: newStock })
          .commit();
        
        stockReductions.push({
          productId: product._id,
          productName: product.name,
          oldStock: currentStock,
          newStock: newStock,
          quantity: item.quantity
        });
        
        console.log(`✅ Stock updated for ${product.name}`);
      } catch (error: any) {
        console.error(`❌ Failed to reduce stock for ${item.product._id}:`, error.message);
        // Continue dengan product lainnya
      }
    }
    
    console.log('✅ Stock reduction completed:', stockReductions.length, 'products');

    // Simpan order ke Sanity (minimal schema)
    const orderData = {
      _type: 'order',
      orderNumber: orderNumber,
      clerkUserId: metadata.clerkUserId,
      customerName: metadata.customerName,
      email: metadata.customerEmail,
      products: productsData, // Use validated productsData
      address: { _type: 'reference', _ref: metadata.address._id },
      shipper: { _type: 'reference', _ref: metadata.shipperId },
      status: 'pending',
      orderDate: new Date().toISOString(),
      totalPrice: total,
      paymentUrl: invoice.invoice_url,
      stockReduced: true, // Mark bahwa stock sudah dikurangi
    };

    console.log('📦 Order data to save:', {
      orderNumber: orderData.orderNumber,
      productsCount: orderData.products.length,
      products: orderData.products,
      totalPrice: orderData.totalPrice,
    });

    // Simpan order ke Sanity (opsional - jika gagal, tetap return payment URL dari Xendit)
    // Invoice sudah dibuat di Xendit, jadi user tetap bisa melakukan pembayaran
    if (process.env.NEXT_PUBLIC_SANITY_WRITE_TOKEN) {
      try {
        console.log('💾 Saving order data to Sanity...');
        console.log('📦 Order data:', JSON.stringify({
          orderNumber: orderData.orderNumber,
          clerkUserId: orderData.clerkUserId,
          customerName: orderData.customerName,
          email: orderData.email,
          productsCount: orderData.products.length,
          totalPrice: orderData.totalPrice,
          status: orderData.status,
          addressRef: orderData.address._ref,
          shipperRef: orderData.shipper._ref,
        }, null, 2));
        
        // Validasi products sebelum save
        if (!orderData.products || orderData.products.length === 0) {
          throw new Error('Products array is empty');
        }
        
        // Validasi setiap product
        for (const prod of orderData.products) {
          if (!prod.product?._ref) {
            throw new Error(`Invalid product reference: ${JSON.stringify(prod)}`);
          }
          if (!prod.quantity || prod.quantity < 1) {
            throw new Error(`Invalid quantity for product ${prod.product._ref}: ${prod.quantity}`);
          }
          if (!prod.priceAtPurchase || prod.priceAtPurchase < 0) {
            throw new Error(`Invalid price for product ${prod.product._ref}: ${prod.priceAtPurchase}`);
          }
        }
        
        console.log('✅ Products validation passed');
        
        const savedOrder = await writeClient.create(orderData);
        
        console.log('✅ Order saved to Sanity successfully');
        console.log('📝 Saved order ID:', savedOrder._id);
        console.log('🛒 Products saved:', orderData.products.length);

        // Update user's total order count
        await incrementUserOrderCount(metadata.clerkUserId);
      } catch (sanityError: any) {
        console.error('⚠️ Failed to save order to Sanity:', sanityError?.message || sanityError);
        console.error('📋 Full error:', JSON.stringify(sanityError, null, 2));
        console.error('📦 Order data that failed:', JSON.stringify(orderData, null, 2));
        console.log('📝 Invoice sudah dibuat di Xendit, tetap return payment URL');
        console.log('💡 Order akan tetap bisa di-track via webhook saat pembayaran berhasil');
        // Tetap return payment URL meskipun gagal save ke Sanity
        // Order akan di-update via webhook saat pembayaran berhasil
      }
    } else {
      console.log('⚠️ NEXT_PUBLIC_SANITY_WRITE_TOKEN tidak ditemukan, skip save ke Sanity');
      console.log('📝 Invoice sudah dibuat di Xendit, return payment URL');
    }

    return {
      orderNumber: orderNumber,
      paymentUrl: invoice.invoice_url,
    };
  } catch (error: any) {
    console.error('❌ Error creating checkout session:', error);
    
    // Provide user-friendly error messages
    if (error.message.includes('network')) {
      throw new Error('Koneksi internet bermasalah. Silakan coba lagi.');
    }
    
    if (error.message.includes('timeout')) {
      throw new Error('Request timeout. Silakan coba lagi.');
    }
    
    throw new Error(
      error.message || 
      'Terjadi kesalahan saat membuat invoice pembayaran. Silakan coba lagi.'
    );
  }
}
