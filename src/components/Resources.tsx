import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Download, ExternalLink, FileText, Video, Code } from 'lucide-react';

const Resources = () => {
  const [downloading, setDownloading] = useState(false);
  const resourceCategories = [
    {
      icon: Code,
      title: "Development Tools",
      items: [
        "Open Source Starter Kits",
        "API Documentation",
        "Code Templates",
        "Testing Frameworks"
      ],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: BookOpen,
      title: "Learning Materials",
      items: [
        "Civic Tech 101 Course",
        "Best Practices Guide",
        "Case Study Library",
        "Research Papers"
      ],
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: FileText,
      title: "Policy & Legal",
      items: [
        "Privacy Guidelines",
        "Accessibility Standards",
        "Government APIs",
        "Compliance Checklists"
      ],
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Video,
      title: "Training Videos",
      items: [
        "Project Planning",
        "Community Engagement",
        "Technical Workshops",
        "Success Stories"
      ],
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section id="resources" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Resource <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Library</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Everything you need to build impactful civic technology solutions, from code to community engagement strategies.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {resourceCategories.map((category, index) => (
            <motion.div
              key={category.title}
              className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:border-white/20 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className={`bg-gradient-to-r ${category.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                <category.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{category.title}</h3>
              <ul className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-gray-400 text-sm flex items-center">
                    <ExternalLink className="h-3 w-3 mr-2 text-blue-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Featured Downloads */}
        <motion.div
          className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 rounded-3xl p-8 text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <Download className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-4">Civic Tech Toolkit</h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Download our comprehensive toolkit including project templates, best practices, 
            and community engagement strategies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={async () => {
                setDownloading(true);
                try {
                  // Simulate download (replace with actual file URL when available)
                  const link = document.createElement('a');
                  link.href = '/civic-tech-toolkit.pdf'; // Replace with actual file path
                  link.download = 'civic-tech-toolkit.pdf';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  
                  // Show success message
                  setTimeout(() => {
                    alert('✅ Toolkit download started! Check your downloads folder.');
                    setDownloading(false);
                  }, 1000);
                } catch (error) {
                  alert('❌ Download failed. Please try again or contact support.');
                  setDownloading(false);
                }
              }}
              disabled={downloading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2 mx-auto sm:mx-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  <span>Download Toolkit</span>
                </>
              )}
            </button>
            <button 
              onClick={() => {
                // Scroll to resources section or open documentation
                const resourcesSection = document.getElementById('resources');
                if (resourcesSection) {
                  resourcesSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                  // Alternative: Open external documentation
                  window.open('https://docs.civictech.org', '_blank');
                }
              }}
              className="border border-white/20 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>View Documentation</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Resources;