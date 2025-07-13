import React, { useState } from 'react';
import { Calendar, Users, Plus, Video, Book, Heart } from 'lucide-react';
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
  description?: string;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: number[];
    endDate?: Date;
    occurrences?: number;
  };
  recurringSeriesId?: string;
  originalDate?: Date;
}

const meetingTypes = new Map([
  [
    'service',
    { id: 'service', name: 'Sunday Service', icon: Video, color: 'bg-blue-500' },
  ],
  [
    'study',
    { id: 'study', name: 'Bible Study', icon: Book, color: 'bg-green-500' },
  ],
  [
    'prayer',
    { id: 'prayer', name: 'Prayer Meeting', icon: Heart, color: 'bg-purple-500' },
  ],
  [
    'meeting',
    {
      id: 'meeting',
      name: 'General Meeting',
      icon: Users,
      color: 'bg-orange-500',
    },
  ],
]);

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
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'service' | 'study' | 'prayer' | 'meeting'>('service');
    const [date, setDate] = useState(format(selectedDate, 'yyyy-MM-dd'));
    const [time, setTime] = useState(format(selectedDate, 'HH:mm'));
    const [isRecurring, setIsRecurring] = useState(false);
    const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
    const [interval, setInterval] = useState(1);
    const [selectedDays, setSelectedDays] = useState<number[]>([0]); // Default to Sunday
    const [endType, setEndType] = useState<'never' | 'date' | 'occurrences'>('never');
    const [endDate, setEndDate] = useState('');
    const [occurrences, setOccurrences] = useState(10);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!title.trim()) {
        alert('Please enter a meeting title');
        return;
      }
      
      const [y, m, d] = date.split('-').map(Number);
      const [h, min] = time.split(':').map(Number);
      const meetingDate = new Date(y, m - 1, d, h, min);

      if (isRecurring) {
        // Generate recurring meetings
        const recurringSeriesId = Date.now().toString();
        const meetings = generateRecurringMeetings({
          title,
          description,
          type,
          startDate: meetingDate,
          frequency,
          interval,
          daysOfWeek: frequency === 'weekly' ? selectedDays : undefined,
          endType,
          endDate: endType === 'date' ? new Date(endDate) : undefined,
          occurrences: endType === 'occurrences' ? occurrences : undefined,
          recurringSeriesId
        });
        
        meetings.forEach(meeting => {
          dispatch({ type: 'ADD_MEETING', payload: meeting });
        });
      } else {
        // Single meeting
        const meeting: Meeting = {
          id: Date.now().toString(),
          title,
          description,
          date: meetingDate,
          participants: 0,
          type,
          isRecurring: false
        };
        
        dispatch({ type: 'ADD_MEETING', payload: meeting });
      }

      setShowNewMeeting(false);
      
      // Reset form
      setTitle('');
      setDescription('');
      setType('service');
      setIsRecurring(false);
      setFrequency('weekly');
      setInterval(1);
      setSelectedDays([0]);
      setEndType('never');
      setEndDate('');
      setOccurrences(10);
    };

    const generateRecurringMeetings = (config: {
      title: string;
      description: string;
      type: Meeting['type'];
      startDate: Date;
      frequency: 'daily' | 'weekly' | 'monthly';
      interval: number;
      daysOfWeek?: number[];
      endType: 'never' | 'date' | 'occurrences';
      endDate?: Date;
      occurrences?: number;
      recurringSeriesId: string;
    }): Meeting[] => {
      const meetings: Meeting[] = [];
      const currentDate = new Date(config.startDate);
      let count = 0;
      const maxOccurrences = config.endType === 'occurrences' ? config.occurrences! : 100; // Limit to 100 if no end
      
      while (count < maxOccurrences) {
        // Check if we've reached the end date
        if (config.endType === 'date' && config.endDate && currentDate > config.endDate) {
          break;
        }
        
        // For weekly recurring, check if current day is in selected days
        if (config.frequency === 'weekly' && config.daysOfWeek) {
          const dayOfWeek = currentDate.getDay();
          if (config.daysOfWeek.includes(dayOfWeek)) {
            meetings.push({
              id: `${config.recurringSeriesId}-${count}`,
              title: config.title,
              description: config.description,
              date: new Date(currentDate),
              participants: 0,
              type: config.type,
              isRecurring: true,
              recurringSeriesId: config.recurringSeriesId,
              originalDate: config.startDate,
              recurringPattern: {
                frequency: config.frequency,
                interval: config.interval,
                daysOfWeek: config.daysOfWeek,
                endDate: config.endDate,
                occurrences: config.occurrences
              }
            });
            count++;
          }
          // Move to next day for weekly check
          currentDate.setDate(currentDate.getDate() + 1);
        } else {
          // For daily and monthly
          meetings.push({
            id: `${config.recurringSeriesId}-${count}`,
            title: config.title,
            description: config.description,
            date: new Date(currentDate),
            participants: 0,
            type: config.type,
            isRecurring: true,
            recurringSeriesId: config.recurringSeriesId,
            originalDate: config.startDate,
            recurringPattern: {
              frequency: config.frequency,
              interval: config.interval,
              endDate: config.endDate,
              occurrences: config.occurrences
            }
          });
          count++;
          
          // Move to next occurrence
          if (config.frequency === 'daily') {
            currentDate.setDate(currentDate.getDate() + config.interval);
          } else if (config.frequency === 'monthly') {
            currentDate.setMonth(currentDate.getMonth() + config.interval);
          }
        }
        
        // Safety check to prevent infinite loops
        if (count > 1000) break;
      }
      
      return meetings;
    };

    const handleDayToggle = (day: number) => {
      setSelectedDays(prev => 
        prev.includes(day) 
          ? prev.filter(d => d !== day)
          : [...prev, day].sort()
      );
    };

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
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
                required
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
                {Array.from(meetingTypes.values()).map((mt) => (
                  <option key={mt.id} value={mt.id}>
                    {mt.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                placeholder="Meeting description (optional)..."
              />
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

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="recurring" className="ml-2 text-sm font-medium text-gray-700">
                  Make this a recurring meeting
                </label>
              </div>

              {isRecurring && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Repeat every
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={interval}
                          onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                        />
                        <select
                          value={frequency}
                          onChange={(e) =>
                            setFrequency(
                              e.target.value as 'daily' | 'weekly' | 'monthly'
                            )
                          }
                          className="flex-1 px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="daily">Day(s)</option>
                          <option value="weekly">Week(s)</option>
                          <option value="monthly">Month(s)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {frequency === 'weekly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Repeat on
                      </label>
                      <div className="flex space-x-1">
                        {dayNames.map((day, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleDayToggle(index)}
                            className={`w-8 h-8 text-xs rounded-full border transition-colors ${
                              selectedDays.includes(index)
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="endType"
                          value="never"
                          checked={endType === 'never'}
                          onChange={(e) =>
                            setEndType(
                              e.target.value as 'never' | 'date' | 'occurrences'
                            )
                          }
                          className="mr-2"
                        />
                        <span className="text-sm">Never</span>
                      </label>
                      
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="endType"
                          value="date"
                          checked={endType === 'date'}
                          onChange={(e) =>
                            setEndType(
                              e.target.value as 'never' | 'date' | 'occurrences'
                            )
                          }
                          className="mr-2"
                        />
                        <span className="text-sm">On</span>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          disabled={endType !== 'date'}
                          className="px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                        />
                      </label>
                      
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="endType"
                          value="occurrences"
                          checked={endType === 'occurrences'}
                          onChange={(e) =>
                            setEndType(
                              e.target.value as 'never' | 'date' | 'occurrences'
                            )
                          }
                          className="mr-2"
                        />
                        <span className="text-sm">After</span>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={occurrences}
                          onChange={(e) => setOccurrences(parseInt(e.target.value) || 1)}
                          disabled={endType !== 'occurrences'}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm disabled:bg-gray-100"
                        />
                        <span className="text-sm">occurrences</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
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
                  {meetings.map((meeting) => {
                    const typeInfo = meetingTypes.get(meeting.type);
                    const Icon = typeInfo?.icon || Video;
                    
                    return (
                      <div
                        key={meeting.id}
                        className={`p-2 rounded text-xs text-white ${
                          typeInfo?.color || 'bg-gray-500'
                        } cursor-pointer hover:opacity-80 transition-opacity`}
                        title={meeting.description || meeting.title}
                      >
                        <div className="flex items-center space-x-1">
                          <Icon className="w-3 h-3" />
                          <span className="truncate">
                            {meeting.title}
                            {meeting.isRecurring && ' ↻'}
                          </span>
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
          {state.meetings.slice(0, 3).map((meeting) => {
            const typeInfo = meetingTypes.get(meeting.type);
            const Icon = typeInfo?.icon || Video;
            
            return (
              <div key={meeting.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`p-2 rounded-lg ${typeInfo?.color || 'bg-gray-500'}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {meeting.title}
                    {meeting.isRecurring && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        Recurring
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(meeting.date, 'MMM dd, yyyy • HH:mm')}
                  </div>
                  {meeting.description && (
                    <div className="text-xs text-gray-400 mt-1 truncate">
                      {meeting.description}
                    </div>
                  )}
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