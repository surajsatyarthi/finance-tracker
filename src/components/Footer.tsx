'use client'

export default function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur-lg border-t border-white/20 mt-8 sm:mt-12 lg:mt-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        <div className="text-center">
          <p className="text-sm sm:text-base text-gray-600 font-medium">
            © {new Date().getFullYear()} Suraj Satyarthi. All rights reserved.
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
            Personal Finance Tracker - Manage your finances with confidence
          </p>
        </div>
      </div>
    </footer>
  )
}