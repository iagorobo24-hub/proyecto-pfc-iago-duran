import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HeroContainer from '../components/HeroSection/HeroContainer';
import useDocumentTitle from '../hooks/useDocumentTitle';

const LandingPage = () => {
  useDocumentTitle('Proyectos PFC — Suite de Herramientas Eléctricas');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/app', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="landing-page">
      <HeroContainer />
    </div>
  );
};

export default LandingPage;
