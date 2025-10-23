import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import React from 'react'

interface ContactItemData {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const data: ContactItemData[] = [
  {
    title: "Kunjungi Kami",
    subtitle: "Jakarta, Indonesia",
    icon: (
      <MapPin className="h-6 w-6 text-gray-600 group-hover:text-primary transition-colors" />
    ),
  },
  {
    title: "Hubungi Kami",
    subtitle: "+62 8574 0944 838",
    icon: (
      <Phone className="h-6 w-6 text-gray-600 group-hover:text-primary transition-colors" />
    ),
  },
  {
    title: "Jam Kerja",
    subtitle: "Sen - Sab: 10:00 AM - 7:00 PM",
    icon: (
      <Clock className="h-6 w-6 text-gray-600 group-hover:text-primary transition-colors" />
    ),
  },
  {
    title: "Email Kami",
    subtitle: "Grocerystore@gmail.com",
    icon: (
      <Mail className="h-6 w-6 text-gray-600 group-hover:text-primary transition-colors" />
    ),
  },
];

const FooterTop = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 py-5 border-b">
      {data?.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-3 group bg-white hover:bg-gray-50 p-2 transition-colors hoverEffect cursor-pointer"
        >
          {item?.icon}
          <div>
            <h3 className="font-semibold group-hover:text-shop_light_text text-black hoverEffect">
              {item?.title}
            </h3>
            <p className="text-gray-600 text-sm mt-1 group-hover:text-gray-900 hoverEffect">
              {item?.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default FooterTop
