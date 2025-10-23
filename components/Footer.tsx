import React from 'react'
import { SubText, SubTitle } from './text'
import { categoriesData, quickLinksData } from '@/constants/data';
import Link from 'next/link';
import { Input } from './ui/input';
import { Button } from './ui/button';
import Container from './Container';
import FooterTop from './FooterTop';
import Logo from './Logo';
import SocialMedia from './SocialMedia';


const Footer = () => {
    return (
        <footer className='bg-white text-black/70 border-t'>
            <Container>
                <FooterTop />
                <div className='py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
                    <div className="space-y-4">
                        <Logo />
                        <SubText>
                            Temukan bahan makanan yang Anda butuhkan di Grocerystoreyt, dengan berbagai macam bahan makanan berkualitas dan sehat.
                        </SubText>
                        <SocialMedia className="flex gap-4 text-shop_darkColor/60" iconClassName="border-darkColor/60 hover:border-shop_light_green hover:text-shop_dark_green"
                        tooltipClassName="bg-shop_darkColor text-white/80" />
                    </div>
                    <div>
                        <SubTitle>Tautan Cepat</SubTitle>
                        <ul className=' space-y-3 mt-4'>
                            {quickLinksData?.map((item, index) => (
                                <li key={item?.title} className='mt-3'>
                                    <Link href={item?.href} className='hover:text-shop_dark_green hover:underline hoverEffect transition'>{item?.title}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <SubTitle>Categori Sayuran</SubTitle>
                        <ul className=' space-y-3 mt-4'>
                            {categoriesData?.map((item, index) => (
                                <li key={item?.title} className='mt-3'>
                                    <Link href={`/category/${item?.href}`} className='hover:text-shop_dark_green hover:underline hoverEffect transition'>{item?.title}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className='space-y-4'>
                        <SubTitle>Berita terkini</SubTitle>
                        <SubText className='mt-4'>Subcribe ke berita terbaru kami untuk mendapatkan informasi dan penawaran terkini.</SubText>
                        <form className='space-y-3'>
                            <Input placeholder='Masukkan email Anda' type='email' required/>
                            <Button className='w-full bg-shop_btn_dark_green hover:bg-shop_dark_green text-shop_darkColor/75 hover:text-shop_light_bg font-bold text-xl'>Subscribe</Button>
                        </form>
                    </div>
                </div>
                <div className="py-3 border-t text-center text-sm text-gray-600">
                    <div className="flex items-center justify-center gap-2">
                        <span>© {new Date().getFullYear()}</span>
                        <Logo className="w-4 h-4 object-contain" />
                        <span>All rights reserved.</span>
                    </div>
                </div>
            </Container>
        </footer>
    )
}

export default Footer;
