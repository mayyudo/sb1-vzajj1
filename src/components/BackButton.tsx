import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BackButton: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
    >
      <ArrowLeft className="w-5 h-5 mr-1" />
      {t('back')}
    </button>
  );
};

export default BackButton;