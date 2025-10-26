import React from 'react';
import { Dumbbell, User } from 'lucide-react';
import SearchBar from '../ui/SearchBar';
import NotificationDropdown from '../ui/NotificationDropdown';

const Header = ({ searchTerm, setSearchTerm, notifications, showNotifications, setShowNotifications }) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Dumbbell className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">GymManager Pro</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <NotificationDropdown 
              notifications={notifications} 
              showNotifications={showNotifications} 
              setShowNotifications={setShowNotifications} 
            />
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">Administrador</p>
                <p className="text-xs text-gray-500">Modo Admin</p>
              </div>
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
