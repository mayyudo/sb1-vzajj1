import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Settings, Clock, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase';
import { collection, query, where, getDocs, Timestamp, onSnapshot } from 'firebase/firestore';
import { differenceInSeconds } from 'date-fns';

const Header: React.FC = () => {
  const { currentUser, userRole, userProfile, signOut } = useAuth();
  const { t } = useTranslation();
  const [clockedIn, setClockedIn] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [notifications, setNotifications] = useState<number>(0);

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
          const entry = querySnapshot.docs[0].data();
          const clockInTime = entry.clockInTime.toDate();
          const now = new Date();
          setElapsedTime(differenceInSeconds(now, clockInTime));
        } else {
          setClockedIn(false);
          setElapsedTime(0);
        }
      }
    };

    checkClockStatus();
    const interval = setInterval(checkClockStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (clockedIn) {
      interval = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [clockedIn]);

  useEffect(() => {
    if (currentUser) {
      let q;
      if (userRole === 'admin') {
        q = query(
          collection(db, 'leaveRequests'),
          where('status', '==', 'pending')
        );
      } else {
        q = query(
          collection(db, 'leaveRequests'),
          where('userId', '==', currentUser.uid),
          where('status', 'in', ['approved', 'rejected'])
        );
      }

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setNotifications(querySnapshot.size);
      });

      return () => unsubscribe();
    }
  }, [currentUser, userRole]);

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (seconds: number) => {
    return seconds < 8 * 3600 ? 'text-green-300' : 'text-red-300';
  };

  return (
    <header className="bg-blue-600 text-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold mr-4 kanit-bold">KSR</Link>
          {currentUser && (
            <div className="ml-4 flex items-center">
              {clockedIn ? (
                <div className={`text-lg font-bold ${getTimeColor(elapsedTime)} kanit-medium`}>
                  {t('workingTime')}: {formatElapsedTime(elapsedTime)}
                </div>
              ) : (
                <Link to="/time-tracking" className="text-yellow-300 font-semibold hover:text-yellow-100 transition-colors kanit-medium">
                  {t('pleaseClockIn')}
                </Link>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {currentUser && (
            <div className="relative">
              <Link to={userRole === 'admin' ? "/admin" : "/notifications"} className="text-white hover:text-blue-200">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                    {notifications}
                  </span>
                )}
              </Link>
            </div>
          )}
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span className="kanit-regular">{userProfile?.firstName || currentUser.email}</span>
              <Link to="/profile" className="text-white hover:text-blue-200">
                <Settings className="w-5 h-5" />
              </Link>
              <button onClick={signOut} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded kanit-medium">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded kanit-medium">{t('login')}</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;