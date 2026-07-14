import React from 'react';
import { createRoot } from 'react-dom/client';
import CallButton from '../components/CallButton';

function handleClick() {
  // Replace this with the function you want to call on click
  console.log('Button clicked — handleClick called');
  // Example: call an API helper
  // apiPost('/query', { student: 'Demo', question: 'Hello' }).then(...)
}

function App() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Click Button Example</h2>
      <CallButton onClick={handleClick}>Call Function</CallButton>
    </div>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = createRoot(rootEl);
  root.render(<App />);
}

export default App;
