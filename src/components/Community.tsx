import React from 'react';
import { motion } from 'framer-motion';
import { HoverEffect } from './ui/HoverEffect';
import { Users, Code2, Lightbulb, MessageCircle, Calendar, Award } from 'lucide-react';

const Community = () => {
  const initiatives = [
    {
      title: "Civic Hackathons",
      description: "Monthly events bringing together developers, designers, and community leaders to solve local challenges.",
      link: "#hackathons",
    },
    {
      title: "Mentorship Program",
      description: "Connect with experienced civic tech professionals and guide the next generation of changemakers.",
      link: "#mentorship",
    },
    {
      title: "Code for Good",
      description: "Volunteer coding opportunities for nonprofits and social impact organizations.",
      link: "#volunteer",
    },
    {
      title: "Policy Lab",
      description: "Collaborate with government officials to create technology-informed policy recommendations.",
      link: "#policy",
    },
    {
      title: "Community Forums",
      description: "Discussion spaces for sharing ideas, seeking help, and connecting with like-minded individuals.",
      link: "#forums",
    },
    {
      title: "Impact Showcase",
      description: "Share your projects and celebrate the positive change happening in communities worldwide.",
      link: "#showcase",
    },
  ];

  const stats = [
    { icon: Users, label: 'Active Members', value: '12,500+' },
    { icon: Code2, label: 'Projects Completed', value: '850+' },
    { icon: Calendar, label: 'Events This Year', value: '120+' },
    { icon: Award, label: 'Awards Won', value: '25+' },
  ];

  return (
    <section id="community" className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join Our <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Community</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Connect with passionate individuals who believe technology can create positive social change.
          </p>
        </motion.div>

        {/* Community Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300">
                <stat.icon className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Community Initiatives */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <HoverEffect items={initiatives} />
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 rounded-3xl p-8 max-w-4xl mx-auto">
            <MessageCircle className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Make an Impact?</h3>
            <p className="text-gray-400 mb-6">
              Whether you're a developer, designer, product manager, or passionate citizen, 
              there's a place for you in our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg">
                Join Our Slack
              </button>
              <button className="border border-white/20 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-all duration-200">
                Browse Resources
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Community;