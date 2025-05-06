import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BulkEmail from './pages/BulkEmail'; // Adjust the import path as necessary
import AgentChat from './pages/Agent';
import AgentsOpus from './pages/AgentOpus';
function App() {
  return (
    <Router>
     <Routes>
          <Route path="/" exact element={<AgentsOpus />} />
          <Route path="/bulk-email" element={<BulkEmail />} />
          <Route path="/agent-opus" element={<AgentChat />} />
        </Routes>
    </Router>
  );
}

export default App;
