import React from 'react';
import './App.css';
import {Cities} from './Cities';
import {BrowserRouter, Route} from 'react-router-dom';

const App: React.FC = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <Route path="/" component={Cities}/>
      </BrowserRouter>
    </div>
  );
}

export default App;
