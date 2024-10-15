import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFound: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">{t('404')}</h1>
      <p className="mb-4">{t('pageNotFound')}</p>
      <Link to="/" className="text-blue-500 hover:underline">
        {t('backToHome')}
      </Link>
    </div>
  );
};

export default NotFound;