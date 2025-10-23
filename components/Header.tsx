import React from 'react'
import Container from './Container';
import HeaderMenu from './HeaderMenu';
import Logo from './Logo';
import CartIcon from './CartIcon';
import FavoriteButton from './FavoriteButton';
import MobileMenu from './MobileMenu';
import { auth, currentUser } from '@clerk/nextjs/server';
// import { ClerkLoaded, SignedIn, UserButton } from '@clerk/nextjs'; // Removed
import ClerkAuthButtons from './ClerkAuthButtons'; // New import
// import SignIn from './SignIn'; // Removed
import SearchBar from './SearchBar';
import { getMyOrders } from '@/sanity/queries';
import Link from 'next/link';
import { Logs } from 'lucide-react';

const Header = async() => {
    const user = await currentUser();
    const { userId } = await auth();
    let orders = null;
    if(userId){
        orders = await getMyOrders(userId);
    }

    return (
            <header className='bg-white/75 py-3.5 sticky top-0 z-50 backdrop-blur-md shadow-sm'>
                <Container className="flex items-center justify-between text-shop_lightColor">
                    <div className='w-auto md:w-1/4 flex items-center gap-2.5 justify-start md:gap-0'>
                        <div className='mt-2 hover:text-shop_lightColor'>
                            <MobileMenu />
                        </div>
                        <Logo />
                    </div>
                    <HeaderMenu />
                    <div className="w-auto md:w-1/5 flex items-center justify-end gap-5">
                        <SearchBar />
                        <CartIcon />
                        <FavoriteButton />
                        <ClerkAuthButtons ordersLength={orders?.length ? orders?.length : 0} />
                    </div>
                </Container>
            </header>
        )
}

export default Header;
