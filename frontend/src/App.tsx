import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Scripts from './pages/Scripts';
import Runs from './pages/Runs';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-brand">
            <h1>Overwatch CICD</h1>
          </div>
          <div className="nav-links">
            <Link to="/scripts">Scripts</Link>
            <Link to="/runs">Runs</Link>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Scripts />} />
            <Route path="/scripts" element={<Scripts />} />
            <Route path="/runs" element={<Runs />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;