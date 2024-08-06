import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './Signup';
import Login from './Login';
import { useState } from 'react';

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup setLoggedIn={setLoggedIn} />} />
        <Route path="/login" element={<Login setLoggedIn={setLoggedIn} />} />
        
        {/* Conditionally render a component or element when loggedIn is true */}
        {loggedIn && <Route path="/" element={<div>You're logged in</div>} />}
        
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
