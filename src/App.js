import React from 'react';
import './assets/App.scss';
import Router from './routes';

const App = () => {
  return (
    <div className="App">
      <Router /> {/* in route component all layout and routing defined */}
    </div>
  );
};

export default App;
