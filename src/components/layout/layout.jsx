import React from 'react';
import Navbar from './navbar';
import { Outlet } from 'react-router-dom';
import Chatbot from '../chat/Chatbot';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Navbar />
      <main className="flex-1 flex flex-col w-full">
        <Outlet />
      </main>
      <Chatbot />
    </div>
  );
}
