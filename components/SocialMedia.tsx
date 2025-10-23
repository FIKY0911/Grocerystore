"use client"

import { Github, Instagram, Linkedin } from 'lucide-react'
import React from 'react'
import { cn } from '@/lib/utils' // pastikan path sesuai
import { TooltipContent } from '@radix-ui/react-tooltip'
import { Tooltip, TooltipProvider, TooltipTrigger } from './ui/tooltip'

interface Props {
  className?: string
  iconClassName?: string
  tooltipClassName?: string
}

const socialLink = [
  {
    title: "Github",
    href: "https://github.com/FIKY0911/",
    icon: <Github className="w-5 h-5"/>
  },
  {
    title: "Linkedin",
    href: "https://www.linkedin.com/in/mohamad-fiky/",
    icon: <Linkedin className="w-5 h-5"/>
  },
  {
    title: "Instagram",
    href: "https://www.instagram.com/filas756",
    icon: <Instagram className="w-5 h-5"/>
  },
]

const SocialMedia: React.FC<Props> = ({ className, iconClassName, tooltipClassName }) => {
  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-3.5", className)}>
        {socialLink.map((item) => (
          <Tooltip key={item?.title}>
            <TooltipTrigger asChild>
              <a
                key={item?.title}
                target="_blank"
                rel="noopener noreferrer"
                href={item.href}
                className={cn(
                  "p-2 border rounded-full hover:text-white hover:border-shop_light_green hoverEffect",
                  iconClassName
                )}
              >
                {item.icon}
              </a>
            </TooltipTrigger>
            <TooltipContent className={cn("p-1 bg-white/35 text-shop_btn_dark_green font-semibold rounded-2xl text-xs", tooltipClassName)}>
                {item?.title}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}

export default SocialMedia
