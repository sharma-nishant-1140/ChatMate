import React from 'react';
import { Routes, Route } from 'react-router';
import './App.css';
import Home from './pages/Home.jsx';
import Chatroom from './pages/Chatroom.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chatroom" element={<Chatroom />} />
    </Routes>
  );
}
export default App;
