import React from 'react';
import Layout from '../components/layout/Layout';
import TradingBotManagement from '../components/bots/TradingBotManagement';
import AuthGuard from '../components/security/AuthGuard';

const BotsPage: React.FC = () => {
  return (
    <AuthGuard>
      <Layout>
        <TradingBotManagement />
      </Layout>
    </AuthGuard>
  );
};

export default BotsPage;
