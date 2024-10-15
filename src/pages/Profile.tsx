import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import BackButton from '../components/BackButton';
import { updatePassword } from 'firebase/auth';
import SuccessToast from '../components/SuccessToast';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { userProfile, updateUserProfile, currentUser, signOut } = useAuth();
  const [firstName, setFirstName] = useState(userProfile?.firstName || '');
  const [lastName, setLastName] = useState(userProfile?.lastName || '');
  const [birthDate, setBirthDate] = useState(userProfile?.birthDate || '');
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phoneNumber || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || '');
      setLastName(userProfile.lastName || '');
      setBirthDate(userProfile.birthDate || '');
      setPhoneNumber(userProfile.phoneNumber || '');
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await updateUserProfile({ firstName, lastName, birthDate, phoneNumber });
      
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          setError(t('passwordMismatch'));
          return;
        }
        if (currentUser) {
          await updatePassword(currentUser, newPassword);
          setShowSuccessToast(true);
          setTimeout(() => {
            signOut();
            navigate('/login');
          }, 3000);
        }
      } else {
        setShowSuccessToast(true);
      }
      
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(t('profileUpdateError'));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <BackButton />
      <h2 className="text-2xl font-bold mb-5">{t('editProfile')}</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block mb-1">{t('firstName')}</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block mb-1">{t('lastName')}</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="birthDate" className="block mb-1">{t('birthDate')}</label>
          <input
            type="date"
            id="birthDate"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="phoneNumber" className="block mb-1">{t('phoneNumber')}</label>
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="newPassword" className="block mb-1">{t('newPassword')}</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block mb-1">{t('confirmPassword')}</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          {t('save')}
        </button>
      </form>
      {showSuccessToast && (
        <SuccessToast
          message={t('profileUpdateSuccess')}
          onClose={() => setShowSuccessToast(false)}
        />
      )}
    </div>
  );
};

export default Profile;