import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, DollarSign, TrendingUp, FileText } from 'lucide-react';

const Transparency: React.FC = () => {
  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Transparency Dashboard</h1>
        <p className="text-gray-400">Track public spending, project progress, and government performance</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <DollarSign className="h-6 w-6 mr-2 text-green-400" />
            Public Spending
          </h3>
          <div className="bg-white/5 rounded-lg p-8 text-center">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Budget visualization and spending analytics coming soon</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="h-6 w-6 mr-2 text-blue-400" />
            Project Progress
          </h3>
          <div className="bg-white/5 rounded-lg p-8 text-center">
            <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Real-time project tracking and milestones coming soon</p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
        <FileText className="h-24 w-24 text-gray-400 mx-auto mb-6" />
        <h3 className="text-2xl font-semibold text-white mb-4">Transparency Features Coming Soon</h3>
        <p className="text-gray-400 mb-6 max-w-3xl mx-auto">
          Access comprehensive data about government spending, project timelines, performance metrics, and public records. 
          Our transparency dashboard will provide interactive charts, downloadable reports, and real-time updates.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/5 rounded-lg p-4">
            <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <h4 className="text-white font-medium mb-2">Budget Tracking</h4>
            <p className="text-gray-400 text-sm">Monitor how public funds are allocated and spent</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <BarChart3 className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <h4 className="text-white font-medium mb-2">Performance Metrics</h4>
            <p className="text-gray-400 text-sm">View key performance indicators and service quality</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <h4 className="text-white font-medium mb-2">Project Status</h4>
            <p className="text-gray-400 text-sm">Track progress of public works and initiatives</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <FileText className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <h4 className="text-white font-medium mb-2">Public Records</h4>
            <p className="text-gray-400 text-sm">Access meeting minutes, reports, and documents</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transparency;
