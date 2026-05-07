import Image from 'next/image';
import { RegisterForm } from '@/components/features/auth/RegisterForm';
import { LoginForm } from '@/components/features/auth/LoginForm';

/**
 * The landing page for Americans in Alsace.
 * Displays the branding and entry points for the community (Register/Login).
 * 
 * @description Renders the main entrance of the application with branded elements and professional layout.
 * @returns {JSX.Element} The rendered home page.
 */
export default function HomePage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-12">
        <div className="flex justify-center mb-8">
          <div className="relative w-32 h-32 p-1 bg-white rounded-full shadow-lg border-2 border-[var(--color-primary-red)] overflow-hidden">
            <Image 
              src="/AIA.png" 
              alt="Americans in Alsace Logo" 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: 'contain' }}
              priority
              className="p-2"
            />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text-main)] mb-4 font-serif tracking-tight">
          Americans in Alsace
        </h1>
        <p className="text-xl text-[var(--color-text-muted)] max-w-sm mx-auto leading-relaxed">
          The premier association for North Americans residing in eastern France.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
          {/* Registration Section */}
          <div className="card-branded flex flex-col h-full hover:border-[var(--color-primary-red)] transition-colors duration-300">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-[var(--color-text-main)] mb-3 font-serif">
                Join the Community
              </h2>
              <p className="text-[var(--color-text-muted)] text-sm">
                Create your account to connect with fellow expats.
              </p>
            </div>
            <div className="flex-grow">
              <RegisterForm />
            </div>
          </div>

          {/* Login Section */}
          <div className="card-branded flex flex-col h-full hover:border-[var(--color-primary-blue)] transition-colors duration-300">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-[var(--color-text-main)] mb-3 font-serif">
                Welcome Back
              </h2>
              <p className="text-[var(--color-text-muted)] text-sm">
                Log in to access members-only content and events.
              </p>
            </div>
            <div className="flex-grow">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-20 text-center text-[var(--color-text-muted)]">
        <div className="flex justify-center items-center gap-6 mb-6">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--color-primary-red)]"></div>
          <div className="flex gap-2">
            <span className="w-3 h-3 bg-[var(--color-primary-red)] rounded-full"></span>
            <span className="w-3 h-3 bg-white border border-gray-200 rounded-full"></span>
            <span className="w-3 h-3 bg-[var(--color-primary-blue)] rounded-full"></span>
          </div>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--color-primary-blue)]"></div>
        </div>
        <p className="text-sm font-medium uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Americans in Alsace
        </p>
        <p className="mt-2 text-xs italic">
          Proudly serving the USA and Canadian community in the Grand Est.
        </p>
      </footer>
    </div>
  );
}
