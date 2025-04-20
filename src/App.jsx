import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LikedProducts from './pages/LikedProducts';
import { LikedProductsProvider } from './contexts/LikedProductsContext';
import { CartProvider } from './contexts/CartContext';

function App() {
  return (
    <Router>
      <LikedProductsProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/liked-products" element={<LikedProducts />} />
          </Routes>
        </CartProvider>
      </LikedProductsProvider>
    </Router>
  );
}

export default App;
