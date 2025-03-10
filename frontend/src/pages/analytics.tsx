import React from 'react';
import Layout from '../components/layout/Layout';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import AuthGuard from '../components/security/AuthGuard';

const AnalyticsPage: React.FC = () => {
  return (
    <AuthGuard>
      <Layout>
        <AnalyticsDashboard />
      </Layout>
    </AuthGuard>
  );
};

export default AnalyticsPage;
