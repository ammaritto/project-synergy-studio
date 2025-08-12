import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import BookingApp from './components/BookingApp';

const App: React.FC = () => {
  const location = useLocation();
  
  // Extract studio filter from pathname
  const getStudioFilterFromPath = (pathname: string): 'ALL' | 'Studio Plus' | 'Studio' => {
    if (pathname === '/Studio-Plus') {
      return 'Studio Plus';
    }
    if (pathname === '/Studio') {
      return 'Studio';
    }
    return 'ALL';
  };

  const studioFilter = getStudioFilterFromPath(location.pathname);

  return (
    <Routes>
      <Route path="/" element={<BookingApp studioFilter="ALL" />} />
      <Route path="/Studio-Plus" element={<BookingApp studioFilter="Studio Plus" />} />
      <Route path="/Studio" element={<BookingApp studioFilter="Studio" />} />
    </Routes>
  );
};

export default App;