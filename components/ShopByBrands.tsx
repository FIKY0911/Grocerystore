import React from 'react'
import Link from 'next/link'
import { getAllBrands } from '@/sanity/queries';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import { Truck } from 'lucide-react';
import { FaRegQuestionCircle } from 'react-icons/fa';
import { FiShare2 } from 'react-icons/fi';
import { RxBorderSplit } from 'react-icons/rx';
import { Title } from './text';

const extraData = [
    {title: "Pengiriman Gratis", description: "Untuk semua barang yang melebihi harga Rp250.000", icon: <Truck size={45}/>},
    {title: "Pengembalian 24 Jam", description: "Jika barang bermasalah", icon: <FaRegQuestionCircle size={45}/>},
    {title: "Pembayaran Aman", description: "Pembayaran 100% aman", icon: <FiShare2 size={45}/>},
    {title: "Dukungan 24/7", description: "Dukungan yang didedikasikan", icon: <RxBorderSplit size={45}/>},
]

const ShopByBrands = async () => {
    const brands = await getAllBrands();
    return (
      <div className="mb-10 lg:pb-20 bg-shop_lighter_bg p-5 lg:p-7 rounded-md">
        <div className="flex items-center gap-5 justify-between mb-10">
        <Title>Kerja Sama</Title>
        <Link href={"/brand"} className="text-sm font-semibold tracking-wide hover:text-shop_btn_dark_green hoverEffect">Lihat semua
        </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-3 mt-5">
            {brands?.map((brand) => (
                <Link key={brand._id} href={{ pathname: "/shop", query: { brand: brand?.slug?.current} }} className="bg-white w-32 h-24 flex items-center justify-center rounded-md overflow-hidden hover:shadow-lg shadow-shop_darkColor/10 border border-shop_light_green/20 hoverEffect">
                    {brand?.image && (
                        <div className="image">
                            <Image src={urlFor(brand?.image).url()} 
                            alt="brandImage"
                            width={250} 
                            height={250} 
                            className='w-32 h-20 object-contain'/>
                        </div>
                    )}
                </Link>
            ))}
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16 p-2 shadow-sm hover:shadow-shop_light_green/20 py-5 rounded-md'>
            {extraData?.map((item, index) => (
                <div key={index} className="flex items-center gap-3 group text-shop_lightColor  cursor-pointer">
                    <span className="inline-flex scale-100 group-hover:scale-90 group-hover:text-shop_light_green hoverEffect">
                        {item?.icon}
                        </span>
                    <div className="text-sm">
                        <p className="text-darkColor/80 font-bold capitalize">{item?.title}</p>
                        <p className="text-shop_lightColor">{item?.description}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    )
}

export default ShopByBrands
