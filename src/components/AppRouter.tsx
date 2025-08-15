import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from '../App';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Default route - shows all inventory types */}
      <Route path="/" element={<App />} />
      
      {/* Filtered routes for specific inventory types */}
      <Route path="/:inventoryTypeId" element={<App />} />
    </Routes>
  );
};

export default AppRouter;