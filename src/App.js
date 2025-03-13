import React from 'react';
import { Container } from '@mui/material';
import Calculator from './components/Calculator';
import './App.css';

function App() {
  return (
    <div className="App">
      <Container>
        <Calculator />
      </Container>
    </div>
  );
}

export default App;
