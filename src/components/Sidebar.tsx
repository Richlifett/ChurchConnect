import React from 'react';
import { Video, Book, MessageCircle, Calendar, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { ActiveView } from '../App';
import clsx from 'clsx';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const menuItems = [
  { id: 'video' as ActiveView, label: 'Video Conference', icon: Video },
  { id: 'bible' as ActiveView, label: 'Bible Study', icon: Book },
  { id: 'chat' as ActiveView, label: 'Chat & Discussion', icon: MessageCircle },
  { id: 'schedule' as ActiveView, label: 'Schedule', icon: Calendar },
  { id: 'prayer' as ActiveView, label: 'Prayer Wall', icon: Heart },
];

export function Sidebar({ activeView, setActiveView, collapsed, setCollapsed }: SidebarProps) {
  return (
    <div className={clsx(
      'fixed left-0 top-16 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="p-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3 text-gray-600" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-gray-600" />
          )}
        </button>

        <nav className="mt-8 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={clsx(
                  'w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-primary-50 to-purple-50 text-primary-700 border border-primary-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className={clsx('w-5 h-5', isActive && 'text-primary-600')} />
                {!collapsed && (
                  <span className="ml-3 font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}