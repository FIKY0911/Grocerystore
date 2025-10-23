import React from 'react'
import { Title } from './text'
import Link from 'next/link'
import Image from 'next/image'
import { banner_1 } from '@/images'


const HomeBanner = () => {
  return (
    <div className='py-16 md:py-3.5 bg-shop_light_orange rounded-lg px-10 lg:px-20 flex items-center justify-between'>
      <div className="space-y-5">
        <Title>Dapatkan diskon hingga 65% pada<br/>
        Bahan Makanan Pilihan
        </Title>
        <Link href={'/shop'} className='mt-6 inline-block  text-shop_darkColor px-6 py-3 rounded-md font-semibold bg-shop_btn_dark_green hover:bg-shop_dark_green hover:text-shop_lighter_bg hoverEffect transition'>
          Beli Sekarang
        </Link>
      </div>
      <div>
        <Image src={banner_1} alt="ALL Product" className='hidden md:inline-flex w-96' width={384} height={384} priority/>
      </div>
    </div>
  )
}

export default HomeBanner
