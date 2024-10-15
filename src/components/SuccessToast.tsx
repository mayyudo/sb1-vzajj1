import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SuccessToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

const SuccessToast: React.FC<SuccessToastProps> = ({ message, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-green-500 text-white px-6 py-4 rounded-md shadow-lg flex items-center space-x-2">
        <CheckCircle size={24} />
        <span className="text-lg font-semibold">{message || t('success')}</span>
      </div>
    </div>
  );
};

export default SuccessToast;