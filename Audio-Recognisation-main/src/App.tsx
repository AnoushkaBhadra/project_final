import { useState } from 'react';
import TrainingCard from './components/TrainingCard';
import TestingCard from './components/TestingCard';

function App() {
  // Using an array of Blob, typical for storing recorded media in the browser
  const [trainingClips, setTrainingClips] = useState<Blob[]>([]);

  return (
    // Updated background for a deeper, more refined look
    <div className="min-h-screen bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section with enhanced typography and subtle shadows */}
        <header className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 drop-shadow-lg">
            🔊 Speaker Recognition System
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A secure and personalized voice model trainer. Record, train, and test your unique speaker profile.
          </p>
        </header>
        
        {/* Main Content Grid: More balanced gap and card styling assumed in components */}
        <main className="grid lg:grid-cols-2 gap-12">
          
          {/* Training Card - assumed to handle the recording and clip management */}
          <section className="p-6 bg-gray-800 rounded-xl shadow-2xl border border-gray-700/50 hover:border-blue-500 transition duration-300">
            <TrainingCard
              trainingClips={trainingClips}
              setTrainingClips={setTrainingClips}
            />
          </section>

          {/* Testing Card - assumed to handle the recognition logic */}
          <section className="p-6 bg-gray-800 rounded-xl shadow-2xl border border-gray-700/50 hover:border-purple-500 transition duration-300">
            <TestingCard
              trainingClips={trainingClips}
            />
          </section>
        </main>
        
        {/* Footer/Note */}
        <footer className="mt-20 text-center text-sm text-gray-500">
          <p>
            Note: All recordings are processed locally for privacy and security.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;