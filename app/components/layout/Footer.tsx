'use client'

import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 py-4 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 max-w-3xl">
            <p className="italic">
              "Whāia te iti kahurangi, ki te tuohu koe, me he maunga teitei" - 
              <span className="block sm:inline"> Provérbio da língua Māori</span>
            </p>
            <p className="mt-1 text-xs">
              Tradução: "Busque o tesouro que você mais valoriza, se você inclinar a cabeça, que seja para uma montanha elevada."
            </p>
          </div>
          
          <Link 
            href="https://github.com/cvaraujo12/stayfocus"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            aria-label="GitHub repository"
          >
            <div className="flex items-center space-x-2">
              <Image
                src="/images/cat-icon.svg"
                alt="GitHub"
                width={24}
                height={24}
                className="text-current"
              />
              <span className="text-xs">StayFocus GitHub</span>
            </div>
          </Link>
        </div>
      </div>
    </footer>
  )
}
