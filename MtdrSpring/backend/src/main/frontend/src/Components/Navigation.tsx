import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline'
import { Link, useLocation, useNavigate } from 'react-router-dom';

const navigation = [
  { name: 'Tareas', href: '/tasks' },
  { name: 'Proyectos', href: '/projects' },
  { name: 'Equipo', href: '/team' },
  { name: 'Perfil', href: '/profile' },
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
    <Disclosure as="nav" className="relative bg-red-200">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-20 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-white-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-black-500">
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
                <div className="flex shrink-0 items-center">
                  <span className="text-2xl font-bold">TaskTuner</span>
                </div>
                <div className="hidden sm:ml-10 sm:block">
                  <div className="flex space-x-6">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        aria-current={location.pathname === item.href ? 'page' : undefined}
                        className={classNames(
                          location.pathname === item.href ? 'bg-red-900 text-white' : 'text-white-300 hover:bg-white/5 hover:text-white',
                          'rounded-md px-4 py-2.5 text-base font-medium',
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
                  className="flex items-center gap-2 rounded-md px-4 py-2.5 text-base font-medium text-white-300 hover:bg-white/5 hover:text-white"
                >
                  <ArrowRightStartOnRectangleIcon aria-hidden="true" className="size-6" />
                  Cerrar Sesión
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
                    location.pathname === item.href ? 'bg-red-900 text-white' : 'text-white-300 hover:bg-white/5 hover:text-white',
                    'block rounded-md px-3 py-2 text-base font-medium',
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