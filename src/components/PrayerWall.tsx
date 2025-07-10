import React, { useState } from 'react';
import { Heart, Plus, MessageCircle, Calendar, User, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';
import clsx from 'clsx';

export function PrayerWall() {
  const { state } = useApp();
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'urgent' | 'thanksgiving'>('all');

  const filteredRequests = state.prayerRequests.filter(request =>
    request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const NewRequestForm = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Share Prayer Request</h3>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prayer Title
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="What can we pray for?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={4}
              placeholder="Share details about your prayer request..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="general">General Prayer</option>
              <option value="healing">Healing</option>
              <option value="guidance">Guidance</option>
              <option value="thanksgiving">Thanksgiving</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="anonymous"
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
              Submit anonymously
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowNewRequest(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Share Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Heart className="w-6 h-6" />
            <h2 className="text-xl font-bold">Prayer Wall</h2>
          </div>
          <button
            onClick={() => setShowNewRequest(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Request</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search prayer requests..."
              className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-2">
            {['all', 'urgent', 'thanksgiving'].map(filter => (
              <button
                key={filter}
                onClick={() => setFilterType(filter as any)}
                className={clsx(
                  'px-3 py-1 rounded-lg text-sm transition-colors capitalize',
                  filterType === filter
                    ? 'bg-white/30 text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Prayer Requests */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {filteredRequests.map(request => (
            <div key={request.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{request.author}</div>
                    <div className="text-sm text-gray-500">
                      {format(request.date, 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-purple-600">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm font-medium">{request.prayers}</span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {request.title}
              </h3>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                {request.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-purple-200">
                <button className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors">
                  <Heart className="w-5 h-5" />
                  <span className="font-medium">Pray for this</span>
                </button>
                
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-700 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span>Encourage</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No prayer requests found
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms.' : 'Be the first to share a prayer request.'}
            </p>
          </div>
        )}
      </div>

      {showNewRequest && <NewRequestForm />}
    </div>
  );
}