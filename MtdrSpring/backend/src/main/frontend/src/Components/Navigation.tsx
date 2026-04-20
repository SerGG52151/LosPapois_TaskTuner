import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline'
import { Link, useLocation, useNavigate } from 'react-router-dom';

const navigation = [
  { name: 'Tasks', href: '/tasks' },
  { name: 'Projects', href: '/projects' },
  { name: 'Team', href: '/team' },
  { name: 'Profile', href: '/profile' },
]

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    navigate('/login');
  }

  return (
    <Disclosure as="nav" className="relative bg-brand-dark shadow-xl shadow-brand-dark/40 border-b border-brand-dark/40">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-20 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-lg p-2 text-brand-lighter hover:bg-white/10 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-white/30">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon aria-hidden="true" className="block size-6" />
                  ) : (
                    <Bars3Icon aria-hidden="true" className="block size-6" />
                  )}
                </Disclosure.Button>
              </div>

              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex shrink-0 items-center gap-2">
                  <svg
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-8 w-8 text-white drop-shadow-md"
                    aria-hidden="true"
                  >
                    <line x1="12" y1="4" x2="12" y2="8" />
                    <line x1="20" y1="4" x2="20" y2="8" />
                    <rect x="6" y="8" width="20" height="17" rx="5" />
                    <rect x="9.5" y="12" width="13" height="9" rx="3" />
                    <circle cx="13" cy="16.5" r="1.2" fill="currentColor" />
                    <circle cx="19" cy="16.5" r="1.2" fill="currentColor" />
                    <rect x="2.5" y="14" width="3.5" height="6" rx="1.2" />
                    <rect x="26" y="14" width="3.5" height="6" rx="1.2" />
                  </svg>
                  <span className="text-2xl font-bold text-white tracking-wide drop-shadow-md">TaskTuner</span>
                </div>
                <div className="hidden sm:ml-10 sm:block">
                  <div className="flex space-x-6">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        aria-current={location.pathname === item.href ? 'page' : undefined}
                        className={classNames(
                          location.pathname === item.href
                            ? 'bg-white/20 text-white shadow-inner shadow-brand-dark/30 border border-white/10'
                            : 'text-brand-lighter hover:bg-white/10 hover:text-white hover:shadow-md hover:shadow-brand-dark/20',
                          'rounded-lg px-4 py-2.5 text-base font-medium backdrop-blur-sm',
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-base font-medium text-brand-lighter hover:bg-white/10 hover:text-white hover:shadow-md hover:shadow-brand-dark/20 backdrop-blur-sm"
                >
                  <ArrowRightStartOnRectangleIcon aria-hidden="true" className="size-6" />
                  Log Out
                </button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  aria-current={location.pathname === item.href ? 'page' : undefined}
                  className={classNames(
                    location.pathname === item.href
                      ? 'bg-white/20 text-white shadow-inner shadow-brand-dark/30 border border-white/10'
                      : 'text-brand-lighter hover:bg-white/10 hover:text-white',
                    'block rounded-lg px-3 py-2 text-base font-medium',
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
