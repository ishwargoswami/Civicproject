import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, MapPin, Zap, Users } from 'lucide-react';

const Impact = () => {
  const impactMetrics = [
    {
      icon: Users,
      title: "Communities Served",
      value: "2,500+",
      description: "Across 85 countries worldwide",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Zap,
      title: "Issues Resolved",
      value: "15,000+",
      description: "Through technology solutions",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: TrendingUp,
      title: "Government Partnerships",
      value: "200+",
      description: "Working directly with public sector",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: MapPin,
      title: "Local Projects",
      value: "1,200+",
      description: "Grassroots initiatives launched",
      color: "from-orange-500 to-red-500"
    }
  ];

  const caseStudies = [
    {
      title: "Smart Traffic Management - São Paulo",
      description: "Reduced traffic congestion by 30% using AI-powered traffic light optimization",
      impact: "2.5M citizens affected",
      image: "https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg"
    },
    {
      title: "Digital Literacy Program - Kenya",
      description: "Trained 50,000 rural residents in digital skills and online safety",
      impact: "85% employment increase",
      image: "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg"
    },
    {
      title: "Disaster Response App - Philippines",
      description: "Real-time disaster alerts and resource coordination during typhoon season",
      impact: "300+ lives saved",
      image: "https://images.pexels.com/photos/1089549/pexels-photo-1089549.jpeg"
    }
  ];

  return (
    <section id="impact" className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Measuring Our <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Impact</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Real results from our community-driven technology initiatives around the world.
          </p>
        </motion.div>

        {/* Impact Metrics */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {impactMetrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:border-white/20 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className={`bg-gradient-to-r ${metric.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                <metric.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">{metric.value}</h3>
              <h4 className="text-lg font-semibold text-gray-300 mb-1">{metric.title}</h4>
              <p className="text-gray-500 text-sm">{metric.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Case Studies */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-bold text-white text-center mb-12">Success Stories</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => (
              <motion.div
                key={study.title}
                className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-white/20 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -10 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div 
                  className="h-48 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${study.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {study.impact}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-bold text-white mb-3">{study.title}</h4>
                  <p className="text-gray-400">{study.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Impact;