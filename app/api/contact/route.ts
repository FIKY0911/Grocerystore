// app/api/contact/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2025-10-10',
  token: process.env.SANITY_WRITE_READ_TOKEN!, // token write, aman di server
  useCdn: false,
});

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    const doc = {
      _type: 'contactMessage',
      name,
      email,
      subject,
      message,
      createdAt: new Date().toISOString(),
    };

    await client.create(doc);

    return NextResponse.json({
      success: true,
      message: 'Pesan berhasil dikirim dan disimpan di Sanity!',
    });
  } catch (error) {
    console.error('Sanity Error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan pesan ke Sanity' },
      { status: 500 }
    );
  }
}
