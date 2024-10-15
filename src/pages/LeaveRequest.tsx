import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import BackButton from '../components/BackButton';
import SuccessToast from '../components/SuccessToast';

const LeaveRequest: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [reason, setReason] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      try {
        await addDoc(collection(db, 'leaveRequests'), {
          userId: currentUser.uid,
          startDate,
          endDate,
          leaveType,
          reason,
          status: 'pending',
          createdAt: serverTimestamp(),
        });
        setShowSuccessToast(true);
        // Reset form
        setStartDate('');
        setEndDate('');
        setLeaveType('');
        setReason('');
      } catch (error) {
        console.error('Error submitting leave request:', error);
        alert(t('leaveRequestError'));
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <BackButton />
      <h1 className="text-3xl font-bold mb-6">{t('leaveRequest')}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="startDate" className="block mb-1">{t('startDate')}</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block mb-1">{t('endDate')}</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="leaveType" className="block mb-1">{t('leaveType')}</label>
          <select
            id="leaveType"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">{t('selectLeaveType')}</option>
            <option value="personal">{t('personalLeave')}</option>
            <option value="sick">{t('sickLeave')}</option>
          </select>
        </div>
        <div>
          <label htmlFor="reason" className="block mb-1">{t('leaveReason')}</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
            rows={4}
          ></textarea>
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          {t('submitLeaveRequest')}
        </button>
      </form>
      {showSuccessToast && (
        <SuccessToast
          message={t('leaveRequestSubmitted')}
          onClose={() => setShowSuccessToast(false)}
        />
      )}
    </div>
  );
};

export default LeaveRequest;