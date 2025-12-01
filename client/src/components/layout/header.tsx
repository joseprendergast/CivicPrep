import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-primary text-white py-4 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="mr-2">
              <svg 
                className="h-10 w-auto" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V4l-8-2-8 2v8c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">US Citizenship Test Practice</h1>
              <p className="text-sm text-blue-100">USCIS Civics Test Simulator</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <ThemeToggle />
            
            <nav className="hidden md:block ml-6">
              <ul className="flex space-x-6">
                <li>
                  <Link href="/" className={`hover:text-blue-100 transition ${location === '/' ? 'font-bold' : ''}`}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/practice" className={`hover:text-blue-100 transition ${location === '/practice' ? 'font-bold' : ''}`}>
                    Practice
                  </Link>
                </li>
                <li>
                  <Link href="/test" className={`hover:text-blue-100 transition ${location === '/test' ? 'font-bold' : ''}`}>
                    Test Simulation
                  </Link>
                </li>
              </ul>
            </nav>
            
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-primary-foreground/20 ml-2"
              onClick={toggleMobileMenu}
              aria-label="Menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-primary-foreground text-white border-t border-blue-800 mt-2">
          <nav className="container mx-auto px-4 py-3">
            <ul className="space-y-3">
              <li>
                <Link href="/" className={`block py-2 hover:bg-primary px-3 rounded ${location === '/' ? 'font-bold' : ''}`}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/practice" className={`block py-2 hover:bg-primary px-3 rounded ${location === '/practice' ? 'font-bold' : ''}`}>
                  Practice
                </Link>
              </li>
              <li>
                <Link href="/test" className={`block py-2 hover:bg-primary px-3 rounded ${location === '/test' ? 'font-bold' : ''}`}>
                  Test Simulation
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
