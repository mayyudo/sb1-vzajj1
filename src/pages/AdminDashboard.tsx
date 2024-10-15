import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import BackButton from '../components/BackButton';

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();

  // ... (ส่วนที่เหลือของโค้ดยังคงเหมือนเดิม)

  return (
    <div className="max-w-4xl mx-auto">
      <BackButton />
      <h1 className="text-3xl font-bold mb-6">{t('adminDashboard')}</h1>
      <p>หน้านี้อยู่ระหว่างการพัฒนา</p>
    </div>
  );
};

export default AdminDashboard;