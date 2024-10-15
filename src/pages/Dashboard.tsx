import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Clock, ClipboardList, Calendar, Settings } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { userProfile, userRole } = useAuth();
  const { t } = useTranslation();

  const menuItems = [
    { icon: <Clock size={24} className="text-blue-500" />, title: t('timeTracking'), link: '/time-tracking', bgColor: 'bg-blue-100' },
    { icon: <ClipboardList size={24} className="text-green-500" />, title: t('timeReport'), link: '/time-report', bgColor: 'bg-green-100' },
    { icon: <Calendar size={24} className="text-purple-500" />, title: t('leaveRequest'), link: '/leave-request', bgColor: 'bg-purple-100' },
  ];

  if (userRole === 'admin') {
    menuItems.push({ icon: <Settings size={24} className="text-red-500" />, title: t('adminMenu'), link: '/admin', bgColor: 'bg-red-100' });
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t('dashboard')}</h1>
      <p className="mb-8 text-xl">
        {t('welcomeMessage', { name: userProfile?.firstName || t('user') })}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item, index) => (
          <Link key={index} to={item.link} className="block">
            <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-300 transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-center">
                <div className={`${item.bgColor} rounded-full p-4 mb-4`}>
                  {item.icon}
                </div>
              </div>
              <h2 className="text-xl font-semibold text-center">{item.title}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;