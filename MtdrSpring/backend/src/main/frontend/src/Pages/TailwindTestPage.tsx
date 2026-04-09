import React from 'react';

const TailwindTestPage: React.FC = () => {
  return (
    <div className="font-sans min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500">
          <h1 className="text-3xl font-bold text-gray-800">Tailwind CSS Test Page</h1>
          <p className="text-gray-600 mt-2">Use this page to verify your Tailwind classes are rendering correctly.</p>
        </header>

        {/* Colors & Typography */}
        <section className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Colors & Typography</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-red-500 font-bold">Red Text (Bold)</p>
              <p className="text-blue-500 italic">Blue Text (Italic)</p>
              <p className="text-green-500 underline">Green Text (Underline)</p>
              <p className="text-yellow-600 uppercase tracking-widest mt-2">Uppercase tracking</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium font-bold">Badge Red</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium font-bold">Badge Green</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium font-bold">Badge Blue</span>
            </div>
          </div>
        </section>

        {/* Flexbox & Buttons */}
        <section className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Flexbox & Buttons</h2>
          <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
            <span className="font-medium text-gray-700 mb-4 sm:mb-0">Action Center</span>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200">
                Primary
              </button>
              <button className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border border-gray-300 shadow-sm transition-colors duration-200">
                Secondary
              </button>
            </div>
          </div>
        </section>

        {/* Grid System */}
        <section className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Grid System</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-indigo-100 p-4 rounded-lg text-indigo-800 text-center font-bold shadow-inner">Grid 1</div>
            <div className="bg-purple-100 p-4 rounded-lg text-purple-800 text-center font-bold shadow-inner">Grid 2</div>
            <div className="bg-pink-100 p-4 rounded-lg text-pink-800 text-center font-bold shadow-inner">Grid 3</div>
            <div className="bg-rose-100 p-4 rounded-lg text-rose-800 text-center font-bold shadow-inner">Grid 4</div>
            <div className="bg-orange-100 p-4 rounded-lg text-orange-800 text-center font-bold shadow-inner col-span-1 md:col-span-2">Grid 5 (col-span-2)</div>
          </div>
        </section>

        {/* Alerts */}
        <section className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Status Alerts</h2>
          <div className="space-y-3">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 text-green-700 rounded-r-md">
              <p className="font-bold">Success</p>
              <p>Everything is rendering perfectly.</p>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 text-yellow-700 rounded-r-md">
              <p className="font-bold">Warning</p>
              <p>Just checking a warning alert styling.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default TailwindTestPage;