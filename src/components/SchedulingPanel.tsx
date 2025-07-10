import React, { useState } from 'react';
import { Calendar, Clock, Users, Plus, Video, Book, Heart, Settings } from 'lucide-react';
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  addWeeks,
  startOfMonth,
  endOfMonth,
  addMonths,
} from 'date-fns';
import { useApp } from '../context/AppContext';

interface Meeting {
  id: string;
  title: string;
  date: Date;
  participants: number;
  type: 'service' | 'study' | 'prayer' | 'meeting';
}

const meetingTypes = [
  { id: 'service', name: 'Sunday Service', icon: Video, color: 'bg-blue-500' },
  { id: 'study', name: 'Bible Study', icon: Book, color: 'bg-green-500' },
  { id: 'prayer', name: 'Prayer Meeting', icon: Heart, color: 'bg-purple-500' },
  { id: 'meeting', name: 'General Meeting', icon: Users, color: 'bg-orange-500' }
];

export function SchedulingPanel() {
  const { state, dispatch } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewMeeting, setShowNewMeeting] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  const weekStart = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const monthStartDate = startOfWeek(monthStart);
  const monthEndDate = endOfWeek(monthEnd);
  const monthDays: Date[] = [];
  for (let d = monthStartDate; d <= monthEndDate; d = addDays(d, 1)) {
    monthDays.push(d);
  }

  const getMeetingsForDate = (date: Date) => {
    return state.meetings.filter(meeting =>
      format(meeting.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const NewMeetingForm = () => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<'service' | 'study' | 'prayer' | 'meeting'>('service');
    const [date, setDate] = useState(format(selectedDate, 'yyyy-MM-dd'));
    const [time, setTime] = useState(format(selectedDate, 'HH:mm'));

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const [y, m, d] = date.split('-').map(Number);
      const [h, min] = time.split(':').map(Number);
      const meetingDate = new Date(y, m - 1, d, h, min);

      const meeting: Meeting = {
        id: Date.now().toString(),
        title,
        date: meetingDate,
        participants: 0,
        type,
      };

      dispatch({ type: 'ADD_MEETING', payload: meeting });
      setShowNewMeeting(false);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Schedule New Meeting</h3>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter meeting title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Meeting['type'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {meetingTypes.map(mt => (
                  <option key={mt.id} value={mt.id}>{mt.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              placeholder="Meeting description..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="recurring"
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="recurring" className="ml-2 text-sm text-gray-700">
              Recurring meeting
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowNewMeeting(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Schedule Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  };

  return (
    <div className="h-full bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6" />
            <h2 className="text-xl font-bold">Meeting Schedule</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (viewMode === 'week') {
                  setViewMode('month');
                  setSelectedDate(startOfMonth(selectedDate));
                } else {
                  setViewMode('week');
                  setSelectedDate(startOfWeek(selectedDate));
                }
              }}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm"
            >
              {viewMode === 'week' ? 'Month View' : 'Week View'}
            </button>
            <button
              onClick={() => setShowNewMeeting(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Meeting</span>
            </button>
          </div>
        </div>

        {/* Date Navigation */}
        {viewMode === 'week' ? (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedDate(addWeeks(selectedDate, -1))}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              ←
            </button>
            <h3 className="text-lg font-semibold">
              {format(weekStart, 'MMM dd')} - {format(addDays(weekStart, 6), 'MMM dd, yyyy')}
            </h3>
            <button
              onClick={() => setSelectedDate(addWeeks(selectedDate, 1))}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              →
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedDate(addMonths(selectedDate, -1))}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              ←
            </button>
            <h3 className="text-lg font-semibold">
              {format(selectedDate, 'MMMM yyyy')}
            </h3>
            <button
              onClick={() => setSelectedDate(addMonths(selectedDate, 1))}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-gray-50 p-3 text-center font-medium text-gray-700">
              {day}
            </div>
          ))}
          
          {(viewMode === 'week' ? weekDays : monthDays).map(day => {
            const meetings = getMeetingsForDate(day);
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            const isCurrentMonth = viewMode === 'month' ? day.getMonth() === selectedDate.getMonth() : true;
            
            return (
              <div key={day.toISOString()} className="bg-white min-h-32 p-2">
                <div
                  className={`text-sm font-medium mb-2 ${
                    isToday
                      ? 'text-primary-600'
                      : isCurrentMonth
                      ? 'text-gray-700'
                      : 'text-gray-400'
                  }`}
                >
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {meetings.map(meeting => {
                    const typeInfo = meetingTypes.find(t => t.id === meeting.type);
                    const Icon = typeInfo?.icon || Video;
                    
                    return (
                      <div
                        key={meeting.id}
                        className={`p-2 rounded text-xs text-white ${
                          typeInfo?.color || 'bg-gray-500'
                        } cursor-pointer hover:opacity-80 transition-opacity`}
                      >
                        <div className="flex items-center space-x-1">
                          <Icon className="w-3 h-3" />
                          <span className="truncate">{meeting.title}</span>
                        </div>
                        <div className="text-white/80 mt-1">
                          {format(meeting.date, 'HH:mm')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Meetings */}
      <div className="border-t border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Upcoming Meetings</h3>
        <div className="space-y-2">
          {state.meetings.slice(0, 3).map(meeting => {
            const typeInfo = meetingTypes.find(t => t.id === meeting.type);
            const Icon = typeInfo?.icon || Video;
            
            return (
              <div key={meeting.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`p-2 rounded-lg ${typeInfo?.color || 'bg-gray-500'}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{meeting.title}</div>
                  <div className="text-sm text-gray-500">
                    {format(meeting.date, 'MMM dd, yyyy • HH:mm')}
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>{meeting.participants}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showNewMeeting && <NewMeetingForm />}
    </div>
  );
}