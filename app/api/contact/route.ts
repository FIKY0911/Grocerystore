// // app/api/contact/route.ts
// import { NextResponse } from 'next/server'
// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY as string);

// export async function POST(request: Request) {
//   try {
//     const { name, email, message } = await request.json()

//     await resend.emails.send({
//       from: email, // Ganti dengan email domain Anda
//       to: 'fiky0911@gmail.com', // email kamu
//       subject: `Pesan dari ${name}`,
//       reply_to: email,
//       text: `Dari: ${email}\n\n${message}`,
//       html: `<p><strong>Dari:</strong> ${email}</p><p>${message}</p>`,
//     })

//     return NextResponse.json({ success: true, message: "Pesan berhasil dikirim!" })
//   } catch (error) {
//     return NextResponse.json({ success: false, error: 'Gagal kirim email' }, { status: 500 })
//   }
// }
