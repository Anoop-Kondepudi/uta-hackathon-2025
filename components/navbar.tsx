"use client";

import { useState } from "react";
import Link from "next/link";
import { Leaf, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Leaf className="w-8 h-8 text-green-600" />
            <span className="text-xl font-bold">MangoAI</span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-6">
            {/* Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setServicesOpen(!servicesOpen)}
              >
                Services
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    servicesOpen && "rotate-180"
                  )}
                />
              </button>

              {servicesOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-popover border rounded-md shadow-lg py-1 animate-in fade-in-80 slide-in-from-top-1">
                  <Link
                    href="/detector"
                    className="block px-4 py-2 text-sm hover:bg-accent transition-colors"
                    onClick={() => setServicesOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="font-medium">Mango Disease Detector</div>
                        <div className="text-xs text-muted-foreground">AI-powered leaf analysis</div>
                      </div>
                    </div>
                  </Link>
                  <Link
                    href="/live-mango"
                    className="block px-4 py-2 text-sm hover:bg-accent transition-colors"
                    onClick={() => setServicesOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-orange-600" />
                      <div>
                        <div className="font-medium">Live Mango</div>
                        <div className="text-xs text-muted-foreground">Real-time monitoring</div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
