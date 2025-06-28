import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Loader, ExternalLink } from 'lucide-react';
import axios from 'axios';

const PublicProjectPage = () => {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProject();
  }, [slug]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/projects/slug/${slug}`);

      if (response.data.success) {
        setProject(response.data.data.project);
        
        // Update page title and meta
        document.title = response.data.data.project.title || 'Oxdel Project';
        
        // Add meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', response.data.data.project.description || 'Created with Oxdel');
        }
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Error loading project:', error);
      if (error.response?.status === 404) {
        setError('Project not found or not published');
      } else {
        setError('Failed to load project');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderBlock = (block) => {
    if (!block.visible) return null;

    const { type, content } = block;
    
    switch (type) {
      case 'hero':
        return (
          <section 
            key={block.id}
            className="relative min-h-screen bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white"
            style={{ 
              backgroundImage: content.backgroundImage ? `url(${content.backgroundImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="relative text-center space-y-6 px-4 max-w-4xl mx-auto">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
              >
                {content.title || 'Welcome to Our Website'}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl md:text-2xl opacity-90 leading-relaxed"
              >
                {content.subtitle || 'Create amazing experiences with our platform'}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <button className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                  {content.buttonText || 'Get Started'}
                </button>
              </motion.div>
            </div>
          </section>
        );
      
      case 'about':
        return (
          <section key={block.id} className="py-20 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    {content.title || 'About Us'}
                  </h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {content.description || 'We are passionate about creating amazing digital experiences that help businesses grow and succeed in the modern world.'}
                  </p>
                </motion.div>
                {content.image && (
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                  >
                    <img 
                      src={content.image} 
                      alt="About" 
                      className="rounded-2xl shadow-2xl w-full h-auto"
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </section>
        );
      
      case 'services':
        return (
          <section key={block.id} className="py-20 px-4 bg-gray-50">
            <div className="max-w-6xl mx-auto text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-16"
              >
                {content.title || 'Our Services'}
              </motion.h2>
              <div className="grid md:grid-cols-3 gap-8">
                {(content.services || []).map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="text-4xl mb-4">⚡</div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        );
      
      case 'gallery':
        return (
          <section key={block.id} className="py-20 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-16 text-center"
              >
                {content.title || 'Gallery'}
              </motion.h2>
              <div className="grid md:grid-cols-3 gap-6">
                {(content.images || []).map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <img 
                      src={image.url} 
                      alt={image.alt || `Gallery image ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        );
      
      case 'contact':
        return (
          <section key={block.id} className="py-20 px-4 bg-gray-900 text-white">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold mb-16"
              >
                {content.title || 'Contact Us'}
              </motion.h2>
              <div className="grid md:grid-cols-3 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl mb-4">📧</div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p className="text-gray-300">{content.email || 'hello@example.com'}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <div className="text-4xl mb-4">📞</div>
                  <h3 className="font-semibold mb-2">Phone</h3>
                  <p className="text-gray-300">{content.phone || '+1 (555) 123-4567'}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <div className="text-4xl mb-4">📍</div>
                  <h3 className="font-semibold mb-2">Address</h3>
                  <p className="text-gray-300">{content.address || '123 Main St, City, State'}</p>
                </motion.div>
              </div>
            </div>
          </section>
        );
      
      case 'footer':
        return (
          <footer key={block.id} className="bg-gray-900 text-white py-12 px-4">
            <div className="max-w-6xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-bold mb-4">
                  {content.companyName || project?.title || 'Your Company'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {content.description || 'Building amazing digital experiences'}
                </p>
                <div className="border-t border-gray-800 pt-6">
                  <p className="text-gray-500 text-sm">
                    © 2024 {content.companyName || project?.title || 'Your Company'}. All rights reserved.
                  </p>
                </div>
              </motion.div>
            </div>
          </footer>
        );
      
      default:
        return (
          <section key={block.id} className="py-16 px-4 bg-gray-100 text-center">
            <h3 className="text-xl font-semibold text-gray-700">{block.name}</h3>
            <p className="text-gray-500">Preview for {type} section</p>
          </section>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a 
            href="/"
            className="inline-flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <span>Go to Oxdel</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
          <p className="text-gray-600">The requested project could not be found.</p>
        </div>
      </div>
    );
  }

  const blocks = project.content?.blocks || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Render Blocks */}
      {blocks.length > 0 ? (
        blocks.map(renderBlock)
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🎨</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h1>
            <p className="text-gray-600">This project is under construction.</p>
          </div>
        </div>
      )}
      
      {/* Powered by Oxdel */}
      <div className="bg-gray-50 py-4 text-center border-t">
        <p className="text-sm text-gray-500">
          Powered by <a href="/" className="font-semibold text-purple-600 hover:text-purple-700">Oxdel</a>
        </p>
      </div>
    </div>
  );
};

export default PublicProjectPage;