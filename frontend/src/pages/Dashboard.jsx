import { useState } from 'react';
import PropTypes from 'prop-types';
import Hero from '../components/dashboard/Hero';
import Features from '../components/dashboard/Features';
import ProgressShowcase from '../components/dashboard/ProgressShowcase';
// import Testimonials from '../components/dashboard/Testimonials';
import CTA from '../components/dashboard/CTA';
import Contributing from '../components/dashboard/Contributing';
import Support from '../components/dashboard/Support';
import Footer from '../components/dashboard/Footer';
import LandingNav from '../components/dashboard/LandingNav';
import AuthModal from '../components/auth/AuthModal';

const DashBoard = ({ isLoggedIn, onAuthSuccess }) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signup');

  const handleOpenAuthModal = (mode) => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setAuthModalOpen(false);
  };

  const handleAuthSuccess = (userId) => {
    if (onAuthSuccess) {
      onAuthSuccess(userId);
    }
    handleCloseAuthModal();
  };

  return (
    <>
      {!isLoggedIn && (
        <LandingNav
          onSignInClick={() => handleOpenAuthModal('login')}
          onGetStartedClick={() => handleOpenAuthModal('signup')}
        />
      )}
      <Hero isLoggedIn={isLoggedIn} onGetStartedClick={() => handleOpenAuthModal('signup')} />
      <Features />
      <ProgressShowcase />
      {/* <Testimonials /> */}
      <div id="cta">
        <CTA isLoggedIn={isLoggedIn} onGetStartedClick={() => handleOpenAuthModal('signup')} />
      </div>
      <Contributing />
      <Support />
      <Footer />

      <AuthModal
        open={authModalOpen}
        onClose={handleCloseAuthModal}
        initialMode={authModalMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};

DashBoard.propTypes = {
  isLoggedIn: PropTypes.bool,
  onAuthSuccess: PropTypes.func,
};

export default DashBoard;
