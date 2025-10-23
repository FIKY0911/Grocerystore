import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Logo = () => {
  return (
      <Link href="/" className="inline-flex items-center">
        <div className="overflow-hidden rounded-xl relative h-full w-full"> {/* efek melingkar */}
          <Image
            src="/logo/GroceryStore.webp" // dari folder public/images/logo
            alt="Logo"
            fill // Use fill to make image fill parent
            className="object-cover transition-transform duration-300 hover:scale-100"
            priority
          />
        </div>
      </Link>
  )
}

export default Logo
