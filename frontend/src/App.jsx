import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BulkEmail from './pages/BulkEmail'; // Adjust the import path as necessary

function App() {
  return (
    <Router>
     <Routes>
          <Route path="/" exact element={<BulkEmail />} />
          <Route path="/bulk-email" element={<BulkEmail />} />
        </Routes>
    </Router>
  );
}

export default App;
