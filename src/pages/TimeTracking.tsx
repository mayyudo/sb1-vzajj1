import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, Timestamp, updateDoc, doc, GeoPoint } from 'firebase/firestore';
import { format, differenceInSeconds } from 'date-fns';
import { Clock, MapPin, FileText, X } from 'lucide-react';
import BackButton from '../components/BackButton';
import { useTranslation } from 'react-i18next';
import SuccessToast from '../components/SuccessToast';
import { useNavigate } from 'react-router-dom';

const TimeTracking: React.FC = () => {
  const { currentUser } = useAuth();
  const [clockedIn, setClockedIn] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<any>(null);
  const [dailyReport, setDailyReport] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [totalWorkTime, setTotalWorkTime] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [reportError, setReportError] = useState('');
  const { t } = useTranslation();
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkClockStatus = async () => {
      if (currentUser) {
        const q = query(
          collection(db, 'timeEntries'),
          where('userId', '==', currentUser.uid),
          where('clockOutTime', '==', null)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setClockedIn(true);
          setCurrentEntry({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
        }
      }
    };
    checkClockStatus();
  }, [currentUser]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (clockedIn && currentEntry) {
      interval = setInterval(() => {
        const now = new Date();
        const clockInTime = currentEntry.clockInTime.toDate();
        const diff = differenceInSeconds(now, clockInTime);
        setElapsedTime(diff);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [clockedIn, currentEntry]);

  const handleClockIn = async () => {
    if (currentUser) {
      try {
        const position = await getCurrentPosition();
        const newEntry = {
          userId: currentUser.uid,
          clockInTime: Timestamp.now(),
          clockOutTime: null,
          locationIn: new GeoPoint(position.coords.latitude, position.coords.longitude),
          locationOut: null,
        };
        const docRef = await addDoc(collection(db, 'timeEntries'), newEntry);
        setClockedIn(true);
        setCurrentEntry({ id: docRef.id, ...newEntry });
        setShowSuccessToast(true);
        setTimeout(() => {
          setShowSuccessToast(false);
          window.location.reload();
        }, 3000);
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการบันทึกเวลาเข้างาน:', error);
        alert(t('clockInError'));
      }
    }
  };

  const handleClockOut = async () => {
    if (currentUser && currentEntry) {
      try {
        const position = await getCurrentPosition();
        const clockOutTime = Timestamp.now();
        const entryRef = doc(db, 'timeEntries', currentEntry.id);
        await updateDoc(entryRef, {
          clockOutTime: clockOutTime,
          locationOut: new GeoPoint(position.coords.latitude, position.coords.longitude),
        });
        
        const clockInDate = currentEntry.clockInTime.toDate();
        const clockOutDate = clockOutTime.toDate();
        const totalSeconds = differenceInSeconds(clockOutDate, clockInDate);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        setTotalWorkTime(`${hours} ${t('hours')} ${minutes} ${t('minutes')}`);
        
        setShowReportModal(true);
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการบันทึกเวลาออกงาน:', error);
        alert(t('clockOutError'));
      }
    }
  };

  const handleSubmitReport = async () => {
    if (dailyReport.trim() === '') {
      setReportError(t('dailyReportRequired'));
      return;
    }

    if (currentUser && currentEntry) {
      try {
        const entryRef = doc(db, 'timeEntries', currentEntry.id);
        await updateDoc(entryRef, {
          dailyReport: dailyReport,
        });
        setReportError('');
        setShowReportModal(false);
        setCurrentEntry(null);
        setDailyReport('');
        setClockedIn(false);
        setShowSuccessToast(true);
        setTimeout(() => {
          setShowSuccessToast(false);
          window.location.reload();
        }, 3000);
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการบันทึกรายงาน:', error);
        alert(t('reportSubmitError'));
      }
    }
  };

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  };

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <BackButton />
      <h1 className="text-3xl font-bold mb-6">{t('timeTracking')}</h1>
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Clock className="w-6 h-6 mr-2 text-blue-500" />
            <span className="text-xl font-semibold">
              {clockedIn ? t('clockedIn') : t('clockedOut')}
            </span>
          </div>
          <button
            onClick={clockedIn ? handleClockOut : handleClockIn}
            className={`px-4 py-2 rounded-md ${
              clockedIn
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {clockedIn ? t('clockOut') : t('clockIn')}
          </button>
        </div>
        {currentEntry && (
          <div className="text-gray-600">
            <p>
              {t('clockInTime')}: {format(currentEntry.clockInTime.toDate(), 'yyyy-MM-dd HH:mm:ss')}
            </p>
            {currentEntry.locationIn && (
              <div className="flex items-center mt-2">
                <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                <span>
                  {t('location')}: {currentEntry.locationIn.latitude.toFixed(6)},{' '}
                  {currentEntry.locationIn.longitude.toFixed(6)}
                </span>
              </div>
            )}
            <p className="mt-2">
              {t('workingTime')}: {formatElapsedTime(elapsedTime)}
            </p>
          </div>
        )}
      </div>

      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{t('dailyReport')}</h2>
              <button onClick={() => setShowReportModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <p>{t('clockInTime')}: {format(currentEntry.clockInTime.toDate(), 'HH:mm:ss')}</p>
            <p>{t('clockOutTime')}: {format(new Date(), 'HH:mm:ss')}</p>
            <p>{t('totalWorkTime')}: {totalWorkTime}</p>
            <textarea
              value={dailyReport}
              onChange={(e) => setDailyReport(e.target.value)}
              className="w-full h-32 p-2 border rounded-md mt-4"
              placeholder={t('enterDailyReport')}
            />
            {reportError && <p className="text-red-500 mt-2">{reportError}</p>}
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSubmitReport}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessToast && (
        <SuccessToast
          message={t('success')}
          onClose={() => {
            setShowSuccessToast(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default TimeTracking;