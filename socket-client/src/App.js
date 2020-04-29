import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Home from './components/Home';
import Login from './components/Login';

function App() {

  return (
    <Router>
      <Route exact path='/' component={Home}/>
      <Route path='/Login' component={Login}/>
    </Router>
  );
}

export default App;
