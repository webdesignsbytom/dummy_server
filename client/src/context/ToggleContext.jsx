import React from 'react';
import { useState } from 'react';

export const ToggleContext = React.createContext();

const ToggleContextProvider = ({ children }) => {
  const [toggleNavigation, setToggleNavigation] = useState(false);
  const [activeNav, setActiveNav] = useState('/');

  const toggleNavbarOpenClosed = () => {
    setToggleNavigation(!toggleNavigation);
  };


  return (
    <ToggleContext.Provider
      value={{
        toggleNavigation,
        toggleNavbarOpenClosed,
        activeNav,
        setActiveNav,
      }}
    >
      {children}
    </ToggleContext.Provider>
  );
};

export default ToggleContextProvider;
