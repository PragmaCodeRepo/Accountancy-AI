import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layout/AppLayout.jsx';
import { Dashboard, Engagements, EngagementDetail, TrialBalance, Schedules, GSTReview, StandardsReview, AIAssistant, CompilationReport, Reports, Settings } from './pages/Pages.jsx';

export default function App() {
  return <Routes><Route element={<AppLayout />}>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/engagements" element={<Engagements />} />
    <Route path="/engagements/:id" element={<EngagementDetail />} />
    <Route path="/trial-balance" element={<TrialBalance />} />
    <Route path="/schedules" element={<Schedules />} />
    <Route path="/gst-review" element={<GSTReview />} />
    <Route path="/standards-review" element={<StandardsReview />} />
    <Route path="/ai-assistant" element={<AIAssistant />} />
    <Route path="/compilation-report" element={<CompilationReport />} />
    <Route path="/reports" element={<Reports />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Route></Routes>;
}
