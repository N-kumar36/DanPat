"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Services', href: '/services' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Contact', href: '/contact' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const currentPath = usePathname();

  const isActive = (href) => {
    // Check for exact match for Home
    if (href === '/') {
      return currentPath === '/';
    }
    // Check if path starts with link href for nested routes (e.g., /services/design)
    return currentPath.startsWith(href);
  };

  return (
    // Wrapper for sticky positioning and the background effect
    //  FIX: Changed w-[100vw] to w-full for better compatibility
    <div className="sticky top-0 z-40 w-full"> 
      
      {/* Background Div (Covers only the navbar area, providing the dark gradient) */}
      <div className="absolute top-0 w-full h-full bg-neutral-950 
                     bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] z-[-1]">
      </div>

      {/* Navbar Content: Dark, semi-transparent, frosted glass effect */}
      <nav className="bg-neutral-900/70 backdrop-blur-sm shadow-xl relative z-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* 1. Logo Section (Text is white for contrast) */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-white hover:text-indigo-400 transition">
                MyBrand
              </Link>
            </div>

            {/* 2. Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigation.map((item) => {
                  const isCurrent = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        ${isCurrent ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-neutral-800 hover:text-white'}
                        px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out
                      `}
                      aria-current={isCurrent ? 'page' : undefined}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 3. Action Button */}
            <div className="hidden md:flex">
              <Link href={"/log-in"} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition duration-150 ease-in-out">
                Get Started
              </Link>
            </div>

            {/* 4. Mobile Menu Button (Icon is light gray/white for contrast) */}
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>

          </div>
        </div>

        {/* 5. Mobile Menu Panel */}
        <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => {
              const isCurrent = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    ${isCurrent ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-neutral-800 hover:text-white'}
                    block px-3 py-2 rounded-md text-base font-medium transition duration-150 ease-in-out
                  `}
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
            {/* Mobile action button */}
            <Link href={"/log-in"} className="w-full text-left mt-2 px-3 py-2 block text-base font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition duration-150 ease-in-out">
              Get Started
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;