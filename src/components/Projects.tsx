import React from 'react';
import { motion } from 'framer-motion';
import { BentoGrid, BentoGridItem } from './ui/BentoGrid';
import { 
  Globe, 
  Vote, 
  TreePine, 
  GraduationCap, 
  Shield, 
  Heart,
  Users,
  Zap,
  ArrowRight
} from 'lucide-react';

const Projects = () => {
  const projects = [
    {
      title: "VoteSecure",
      description: "Blockchain-based voting platform ensuring transparent and secure democratic processes for local elections.",
      header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
          <Vote className="h-12 w-12 text-white" />
        </div>
      ),
      icon: <Vote className="h-4 w-4 text-blue-500" />,
    },
    {
      title: "EcoTracker",
      description: "Community-driven environmental monitoring system tracking air quality, water pollution, and climate data.",
      header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center">
          <TreePine className="h-12 w-12 text-white" />
        </div>
      ),
      icon: <TreePine className="h-4 w-4 text-green-500" />,
    },
    {
      title: "EduConnect",
      description: "Connecting underserved students with mentors and educational resources through AI-powered matching.",
      header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-purple-500 to-pink-700 flex items-center justify-center">
          <GraduationCap className="h-12 w-12 text-white" />
        </div>
      ),
      icon: <GraduationCap className="h-4 w-4 text-purple-500" />,
    },
    {
      title: "SafeSpace",
      description: "Anonymous reporting platform for workplace harassment and discrimination with built-in support resources.",
      header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-red-500 to-orange-700 flex items-center justify-center">
          <Shield className="h-12 w-12 text-white" />
        </div>
      ),
      icon: <Shield className="h-4 w-4 text-red-500" />,
    },
    {
      title: "HealthHub",
      description: "Telemedicine platform providing free healthcare consultations to rural and underserved communities.",
      header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-teal-500 to-cyan-700 flex items-center justify-center">
          <Heart className="h-12 w-12 text-white" />
        </div>
      ),
      icon: <Heart className="h-4 w-4 text-teal-500" />,
    },
    {
      title: "CommunityLink",
      description: "Hyperlocal social network helping neighbors connect, share resources, and organize community events.",
      header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center">
          <Users className="h-12 w-12 text-white" />
        </div>
      ),
      icon: <Users className="h-4 w-4 text-indigo-500" />,
    },
  ];

  return (
    <section id="projects" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Featured <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Projects</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Discover innovative solutions addressing real-world challenges through technology and community collaboration.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <BentoGrid className="max-w-4xl mx-auto">
            {projects.map((project, i) => (
              <BentoGridItem
                key={i}
                title={project.title}
                description={project.description}
                header={project.header}
                icon={project.icon}
                className={i === 3 || i === 6 ? "md:col-span-2" : ""}
              />
            ))}
          </BentoGrid>
        </motion.div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg flex items-center space-x-2 mx-auto">
            <span>View All Projects</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;