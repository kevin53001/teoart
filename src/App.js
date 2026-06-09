import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Connexion from './Connexion';
import Inscription from './Inscription';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
