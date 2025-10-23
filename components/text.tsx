import {cn} from '@/lib/utils'
import { Children } from 'react'

const Title = ({ 
    children, 
    className 
}: { 
    children: React.ReactNode, 
    className?: string 
}) => {
    return <h2 className={cn(`text-2xl font-bold text-gray-800 capitalize
    tracking-wide font-sans${className}`)}>{children}</h2>
}

const SubTitle = ({ 
    children, 
    className 
}: { 
    children: React.ReactNode, 
    className?: string 
}) => {
    return <h3 className={cn(`font-semibold text-gray-900 font-sans${className}`)}>{children}</h3>
}

const SubText = ({ 
    children, 
    className 
}: { 
    children: React.ReactNode, 
    className?: string 
})=>{
    return <p className={cn(`text-sm text-gray-600 ${className}`)}>{children}</p>
}

export { Title, SubTitle, SubText }
