"use client"

import Image from "next/image"

export default function DeveloperFooter() {
  return (
    <div className="mt-auto border-t border-border/30 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-3 group">
            <div className="relative transition-transform group-hover:scale-105">
              <Image
                src="/images/developer/logo.png"
                alt="KesiaDev"
                width={900}
                height={225}
                className="h-40 w-auto opacity-90 group-hover:opacity-100 transition-all duration-300"
                style={{
                  backgroundColor: 'transparent',
                  background: 'transparent'
                }}
                unoptimized
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-2">
            Web & App Developer
          </p>
        </div>
      </div>
    </div>
  )
}

