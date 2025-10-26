// "use client";

// import React from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import toast from "react-hot-toast";

// const formSchema = z.object({
//   name: z.string().min(2, { message: "Nama harus minimal 2 karakter." }),
//   email: z.string().email({ message: "Email tidak valid." }),
//   message: z.string().min(10, { message: "Pesan harus minimal 10 karakter." }),
// });

// type ContactFormValues = z.infer<typeof formSchema>;

// const ContactForm = () => {
//   const form = useForm<ContactFormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       name: "",
//       email: "",
//       message: "",
//     },
//   });

//   const onSubmit = async (values: ContactFormValues) => {
//     try {
//       const response = await fetch("/api/contact", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(values),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         toast.success(data.message);
//         form.reset();
//       } else {
//         toast.error(data.message || "Gagal mengirim pesan.");
//       }
//     } catch (error) {
//       console.error("Error submitting form:", error);
//       toast.error("Terjadi kesalahan jaringan.");
//     }
//   };

//   return (
//     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//       <div>
//         <Label htmlFor="name">Nama Anda</Label>
//         <Input id="name" {...form.register("name")} />
//         {form.formState.errors.name && (
//           <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
//         )}
//       </div>
//       <div>
//         <Label htmlFor="email">Email Anda</Label>
//         <Input id="email" type="email" {...form.register("email")} />
//         {form.formState.errors.email && (
//           <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
//         )}
//       </div>
//       <div>
//         <Label htmlFor="message">Pesan Anda</Label>
//         <Textarea id="message" rows={5} {...form.register("message")} />
//         {form.formState.errors.message && (
//           <p className="text-red-500 text-sm mt-1">{form.formState.errors.message.message}</p>
//         )}
//       </div>
//       <Button type="submit" className="w-full bg-shop_btn_dark_green hover:bg-shop_dark_green text-white">
//         Kirim Pesan
//       </Button>
//     </form>
//   );
// };

// export default ContactForm;
