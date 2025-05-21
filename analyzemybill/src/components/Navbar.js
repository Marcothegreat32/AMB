import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

export default function Navbar() {
  const { user, subscription, logout } = useContext(AuthContext);

  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-600">AnalyzeMyBill</h1>
      <div className="flex items-center space-x-4">
        <Link to="/" className="text-gray-700 hover:text-blue-600">
          Home
        </Link>
        <Link to="/upload" className="text-gray-700 hover:text-blue-600">
          Upload
        </Link>
        <Link to="/upload-policy" className="text-gray-700 hover:text-blue-600">
          Upload Policy
        </Link>
        <Link to="/pricing" className="text-gray-700 hover:text-blue-600">
          Pricing
        </Link>
        <Link to="/chat" className="text-gray-700 hover:text-blue-600">
          Chat
        </Link>
        <Link to="/vault" className="text-gray-700 hover:text-blue-600">
          Vault
        </Link>
        <Link to="/help" className="text-gray-700 hover:text-primary transition">
          Help
        </Link>
        <Link to="/faq" className="text-gray-700 hover:text-primary transition">
          FAQ
        </Link>
        <Link to="/contact" className="text-gray-700 hover:text-primary transition">
          Contact Us
        </Link>

        {user ? (
          <>
            <Link to="/profile" className="text-gray-700 hover:text-blue-600">
              Profile
            </Link>
            {subscription?.active && (
              <Link to="/manage" className="text-gray-700 hover:text-blue-600">
                Manage Subscription
              </Link>
            )}
            <button onClick={logout} className="text-red-600 hover:underline">
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-700 hover:text-blue-600">
              Log In
            </Link>
            <Link to="/register" className="text-gray-700 hover:text-blue-600">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
