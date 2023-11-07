import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Context
import { UserContext } from '../../context/UserContext';
import { ToggleContext } from '../../context/ToggleContext';
// Images
import LogoImage from '../../assets/images/logos/wdbt-black.svg';

function Navbar() {
  const { user, setUser } = useContext(UserContext);
  const { toggleNavbarOpenClosed, toggleNavigation, activeNav, setActiveNav } =
    useContext(ToggleContext);

  let navigate = useNavigate();

  const logoutUser = (event) => {
    event.preventDefault();
    setActiveNav('/');
    toggleNavbarOpenClosed();
    setUser({});
    localStorage.removeItem(process.env.REACT_APP_USER_TOKEN);

    navigate('/', { replace: true });
  };

  return (
    <nav className='h-full relative z-30 grid grid-cols-reg bg-yellow-400 py-2 border-b-2 border-solid border-black'>
      <section className='grid items-center justify-center pl-4'>
        <Link className='no__highlights' to='/'>
          <img
            className='w-10 no__highlights h-10'
            src={LogoImage}
            alt='Logo'
          />
        </Link>
      </section>

      {/* Phone Nav */}
      <nav
        onClick={() => {
          toggleNavbarOpenClosed();
        }}
        className='grid items-center justify-end lg:hidden no__highlights pr-4'
      >
        <span className='cursor-pointer text-black hover:text-hover-grey'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth='1.5'
            stroke='currentColor'
            className='w-10 h-10 transition no__highlights duration-200 ease-in-out select-none focus:scale-125 active:scale-125'
            data-te-animation-init
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
            />
          </svg>
        </span>
      </nav>

      {/* Navigation */}
      <section className='hidden lg:grid justify-end'>
        <div className='grid items-center pr-4'>
          <ul className='grid grid-flow-col w-fit justify-end gap-4 font-semibold'>
            <li className={activeNav === '/' ? 'text-gray-600 hover:text-gray-700 active:scale-95' : 'hover:text-gray-700 active:scale-95'}>
              <Link className='w-full' to='/'>
                Home
              </Link>
            </li>
            <li className={activeNav === '/design' ? 'text-gray-600 hover:text-gray-700 active:scale-95' : 'hover:text-gray-700 active:scale-95'}>
              <Link className='w-full' to='/design'>
                Design
              </Link>
            </li>
            {!user.email && (
              <>
                <li className={activeNav === '/login' ? 'text-gray-600 hover:text-gray-700 active:scale-95' : 'hover:text-gray-700 active:scale-95'}>
                  <Link className='w-full' to='/Login'>
                    Login
                  </Link>
                </li>
                <li className={activeNav === '/sign-up' ? 'text-gray-600 hover:text-gray-700 active:scale-95' : 'hover:text-gray-700 active:scale-95'}>
                  <Link className='w-full' to='/sign-up'>
                    Sign Up
                  </Link>
                </li>
              </>
            )}
            {(user.role === 'ADMIN' || user.role === 'DEVELOPER') && (
              <li className={activeNav === '/admin' ? 'text-gray-600 hover:text-gray-700 active:scale-95' : 'hover:text-gray-700 active:scale-95'}>
                <Link className='w-full' to='/admin'>
                  Admin
                </Link>
              </li>
            )}
            {user.email && (
              <button className='' onClick={logoutUser}>
                Logout
              </button>
            )}
          </ul>
        </div>
      </section>

      {toggleNavigation && (
        <nav className='absolute lg:hidden w-full left-0 top-24 py-2 px-4'>
          <div className='bg-black nav__bg p-2 rounded'>
            <ul className='text-center grid bg-black h-fit w-full text-xl'>
              <li
                className={
                  activeNav === '/'
                    ? 'w-full no__highlights nav__bg hover:bg-green-500 active:scale-95 grid py-2 outline-2 outline outline-black bg-yellow-700 text-gray-800 font-semibold'
                    : 'w-full no__highlights nav__bg hover:bg-blue-500 active:scale-95 grid py-2 outline-2 outline outline-black bg-yellow-500 text-gray-800 font-semibold'
                }
              >
                <Link className='w-full' to='/'>
                  Home
                </Link>
              </li>
              <li
                className={
                  activeNav === '/design'
                    ? 'w-full no__highlights nav__bg hover:bg-green-500 active:scale-95 grid py-2 outline-2 outline outline-black bg-yellow-700 text-gray-800 font-semibold'
                    : 'w-full no__highlights nav__bg hover:bg-blue-500 active:scale-95 grid py-2 outline-2 outline outline-black bg-yellow-500 text-gray-800 font-semibold'
                }
              >
                <Link className='w-full' to='/design'>
                  Design
                </Link>
              </li>

              {!user.email && (
                <>
                  <li
                    className={
                      activeNav === '/login'
                        ? 'w-full no__highlights nav__bg hover:bg-green-500 active:scale-95 grid py-2 outline-2 outline outline-black bg-yellow-700 text-gray-800 font-semibold'
                        : 'w-full no__highlights nav__bg hover:bg-blue-500 active:scale-95 grid py-2 outline-2 outline outline-black bg-yellow-500 text-gray-800 font-semibold'
                    }
                  >
                    <Link className='w-full' to='/Login'>
                      Login
                    </Link>
                  </li>
                  <li
                    className={
                      activeNav === '/sign-up'
                        ? 'w-full no__highlights nav__bg hover:bg-green-500 active:scale-95 grid py-2 outline-2 outline outline-black bg-yellow-700 text-gray-800 font-semibold'
                        : 'w-full no__highlights nav__bg hover:bg-blue-500 active:scale-95 grid py-2 outline-2 outline outline-black bg-yellow-500 text-gray-800 font-semibold'
                    }
                  >
                    <Link className='w-full' to='/sign-up'>
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
              {(user.role === 'ADMIN' || user.role === 'DEVELOPER') && (
                <li
                  className={
                    activeNav === '/admin'
                      ? 'w-full no__highlights nav__bg hover:bg-green-500 active:scale-95 grid py-2 outline-2 outline outline-black bg-yellow-700 text-gray-800 font-semibold'
                      : 'w-full no__highlights nav__bg hover:bg-blue-500 active:scale-95 grid py-2 outline-2 outline outline-black bg-yellow-500 text-gray-800 font-semibold'
                  }
                >
                  <Link className='w-full' to='/admin'>
                    Admin
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </nav>
      )}
    </nav>
  );
}

export default Navbar;
