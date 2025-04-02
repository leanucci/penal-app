import { useState } from 'react';
import SocketTest from './components/SocketTest';
import GoalTestPage from './components/GoalTestPage';
import GameSessionDebug from './pages/GameSessionDebug';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState('session-debug'); // Default to session debug page
  
  // Navigate between different test pages
  const navigateTo = (page) => {
    setActivePage(page);
  };
  
  // Render the active page
  const renderActivePage = () => {
    switch (activePage) {
      case 'socket':
        return <SocketTest />;
      case 'goal':
        return <GoalTestPage />;
      case 'session-debug':
        return <GameSessionDebug />;
      default:
        return <div>Page not found</div>;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col">
      {/* Navigation */}
      <div className="mx-auto w-full max-w-3xl px-4 mb-6">
        <nav className="flex space-x-4 bg-white rounded-lg shadow p-2">
          <button
            onClick={() => navigateTo('session-debug')}
            className={`px-4 py-2 rounded ${
              activePage === 'session-debug' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Game Session
          </button>
          <button
            onClick={() => navigateTo('goal')}
            className={`px-4 py-2 rounded ${
              activePage === 'goal' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Goal Test
          </button>
          <button
            onClick={() => navigateTo('socket')}
            className={`px-4 py-2 rounded ${
              activePage === 'socket' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Socket Test
          </button>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4">
          {renderActivePage()}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-8 py-4 text-center text-gray-500 text-sm">
        <p>Soccer Penalty Shootout Game - Development Build</p>
      </footer>
    </div>
  );
}

export default App;