import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, startAt, endAt, Timestamp } from 'firebase/firestore';
import { format, differenceInMinutes, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import BackButton from '../components/BackButton';

interface TimeEntry {
  id: string;
  clockInTime: Date;
  clockOutTime: Date | null;
  dailyReport: string;
}

const TimeReport: React.FC = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const entriesPerPage = 10;

  useEffect(() => {
    const fetchTimeEntries = async () => {
      if (currentUser) {
        try {
          setLoading(true);
          setError(null);
          const selectedDate = parseISO(selectedMonth + '-01');
          const monthStart = startOfMonth(selectedDate);
          const monthEnd = endOfMonth(selectedDate);

          const q = query(
            collection(db, 'timeEntries'),
            where('userId', '==', currentUser.uid),
            where('clockInTime', '>=', Timestamp.fromDate(monthStart)),
            where('clockInTime', '<=', Timestamp.fromDate(monthEnd)),
            orderBy('clockInTime', 'desc')
          );
          const querySnapshot = await getDocs(q);
          const entries = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            clockInTime: doc.data().clockInTime.toDate(),
            clockOutTime: doc.data().clockOutTime?.toDate() || null,
          })) as TimeEntry[];
          setTimeEntries(entries);
          setCurrentPage(1);
        } catch (err) {
          console.error('Error fetching time entries:', err);
          setError(t('fetchTimeEntriesError'));
        } finally {
          setLoading(false);
        }
      }
    };
    fetchTimeEntries();
  }, [currentUser, selectedMonth, t]);

  const calculateWorkTime = (clockIn: Date, clockOut: Date | null): string => {
    if (!clockOut) return '-';
    const diffMinutes = differenceInMinutes(clockOut, clockIn);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(event.target.value);
  };

  const pageCount = Math.ceil(timeEntries.length / entriesPerPage);
  const paginatedEntries = timeEntries.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  if (loading) {
    return <div className="text-center">{t('loading')}</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <BackButton />
      <h1 className="text-3xl font-bold mb-6">{t('timeReport')}</h1>
      <div className="mb-4">
        <label htmlFor="month-select" className="mr-2">{t('selectMonth')}:</label>
        <select
          id="month-select"
          value={selectedMonth}
          onChange={handleMonthChange}
          className="border rounded px-2 py-1"
        >
          {[...Array(12)].map((_, i) => {
            const date = subMonths(new Date(), i);
            const value = format(date, 'yyyy-MM');
            return (
              <option key={value} value={value}>
                {format(date, 'MMMM yyyy')}
              </option>
            );
          })}
        </select>
      </div>
      {paginatedEntries.length === 0 ? (
        <p className="text-center">{t('noTimeEntries')}</p>
      ) : (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-hidden overflow-x-auto mb-4">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('date')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('clockIn')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('clockOut')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('totalWorkTime')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dailyReport')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(entry.clockInTime, 'yyyy-MM-dd')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(entry.clockInTime, 'HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entry.clockOutTime ? format(entry.clockOutTime, 'HH:mm:ss') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {calculateWorkTime(entry.clockInTime, entry.clockOutTime)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs overflow-hidden overflow-ellipsis">
                        {entry.dailyReport || '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center">
            <div>
              {t('showing')} {(currentPage - 1) * entriesPerPage + 1} - {Math.min(currentPage * entriesPerPage, timeEntries.length)} {t('of')} {timeEntries.length} {t('entries')}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                {t('previous')}
              </button>
              <button
                onClick={() => setCurrentPage(page => Math.min(page + 1, pageCount))}
                disabled={currentPage === pageCount}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                {t('next')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TimeReport;