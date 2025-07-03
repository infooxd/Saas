/*
  # Update templates with Elementor-style blocks

  1. Updates
    - Update existing templates with proper block structure
    - Add realistic content for each block type
    - Include floating contact settings

  2. New Content Structure
    - Each template has complete blocks with content
    - Blocks include: hero, about, services, contact, etc.
    - Floating contact buttons configuration
*/

-- Update templates with proper Elementor-style content
UPDATE templates SET content = '{
  "blocks": [
    {
      "id": "hero_1",
      "type": "hero",
      "name": "Hero Section",
      "visible": true,
      "content": {
        "title": "Professional Portfolio",
        "subtitle": "Showcasing my creative work and professional journey",
        "buttonText": "View My Work",
        "buttonUrl": "#portfolio",
        "backgroundImage": "/uploads/templates/hero-portfolio.jpg"
      }
    },
    {
      "id": "about_1", 
      "type": "about",
      "name": "About Section",
      "visible": true,
      "content": {
        "title": "About Me",
        "description": "I am a passionate creative professional with over 5 years of experience in design and development. I love creating beautiful, functional solutions that make a difference.",
        "image": "/uploads/templates/about-me.jpg"
      }
    },
    {
      "id": "portfolio_1",
      "type": "portfolio", 
      "name": "Portfolio Section",
      "visible": true,
      "content": {
        "title": "My Work",
        "projects": [
          {
            "name": "Brand Identity Design",
            "description": "Complete brand identity for tech startup",
            "image": "/uploads/templates/project-1.jpg",
            "url": "#"
          },
          {
            "name": "Website Development", 
            "description": "Responsive website for local business",
            "image": "/uploads/templates/project-2.jpg",
            "url": "#"
          },
          {
            "name": "Mobile App UI",
            "description": "User interface design for mobile application",
            "image": "/uploads/templates/project-3.jpg", 
            "url": "#"
          }
        ]
      }
    },
    {
      "id": "contact_1",
      "type": "contact",
      "name": "Contact Section", 
      "visible": true,
      "content": {
        "title": "Get In Touch",
        "email": "hello@portfolio.com",
        "phone": "+62 812 3456 7890",
        "address": "Jakarta, Indonesia"
      }
    }
  ],
  "floatingContacts": {
    "whatsapp": {
      "enabled": true,
      "number": "6281234567890",
      "message": "Hi! I am interested in your portfolio."
    },
    "telegram": {
      "enabled": false,
      "username": ""
    }
  }
}' WHERE name = 'Modern Portfolio';

UPDATE templates SET content = '{
  "blocks": [
    {
      "id": "hero_2",
      "type": "hero", 
      "name": "Hero Section",
      "visible": true,
      "content": {
        "title": "Grow Your Business",
        "subtitle": "Professional solutions and consulting services to help your business thrive in the digital age",
        "buttonText": "Get Started",
        "buttonUrl": "https://wa.me/6281234567890",
        "backgroundImage": "/uploads/templates/hero-business.jpg"
      }
    },
    {
      "id": "services_1",
      "type": "services",
      "name": "Services Section",
      "visible": true, 
      "content": {
        "title": "Our Services",
        "services": [
          {
            "name": "Business Consulting",
            "description": "Strategic planning and business development consulting to accelerate your growth"
          },
          {
            "name": "Digital Marketing",
            "description": "Comprehensive digital marketing strategies to reach your target audience effectively"
          },
          {
            "name": "Technology Solutions", 
            "description": "Custom software development and technology implementation for your business needs"
          }
        ]
      }
    },
    {
      "id": "about_2",
      "type": "about",
      "name": "About Section",
      "visible": true,
      "content": {
        "title": "Why Choose Us",
        "description": "With over 10 years of experience helping businesses succeed, we provide proven strategies and innovative solutions. Our team of experts is dedicated to delivering results that matter to your bottom line.",
        "image": "/uploads/templates/about-business.jpg"
      }
    },
    {
      "id": "testimonials_1",
      "type": "testimonials",
      "name": "Testimonials Section", 
      "visible": true,
      "content": {
        "title": "What Our Clients Say",
        "testimonials": [
          {
            "name": "Sarah Johnson",
            "company": "Tech Startup Inc",
            "text": "Their consulting services helped us increase revenue by 300% in just 6 months. Highly recommended!",
            "avatar": "/uploads/templates/client-1.jpg"
          },
          {
            "name": "Michael Chen",
            "company": "Local Restaurant",
            "text": "The digital marketing strategy they developed brought us 50% more customers. Amazing results!",
            "avatar": "/uploads/templates/client-2.jpg"
          }
        ]
      }
    },
    {
      "id": "contact_2",
      "type": "contact",
      "name": "Contact Section",
      "visible": true,
      "content": {
        "title": "Contact Us Today",
        "email": "info@business.com", 
        "phone": "+62 21 1234 5678",
        "address": "Jl. Sudirman No. 123, Jakarta Pusat"
      }
    }
  ],
  "floatingContacts": {
    "whatsapp": {
      "enabled": true,
      "number": "6281234567890", 
      "message": "Hello! I am interested in your business services."
    },
    "telegram": {
      "enabled": true,
      "username": "businessconsult"
    }
  }
}' WHERE name = 'Business Landing';

UPDATE templates SET content = '{
  "blocks": [
    {
      "id": "hero_3",
      "type": "hero",
      "name": "Hero Section", 
      "visible": true,
      "content": {
        "title": "Shop Premium Products",
        "subtitle": "Discover our curated collection of high-quality products with fast shipping and excellent customer service",
        "buttonText": "Shop Now",
        "buttonUrl": "#products",
        "backgroundImage": "/uploads/templates/hero-ecommerce.jpg"
      }
    },
    {
      "id": "products_1",
      "type": "products",
      "name": "Products Section",
      "visible": true,
      "content": {
        "title": "Featured Products",
        "products": [
          {
            "name": "Premium Headphones",
            "price": "299",
            "description": "High-quality wireless headphones with noise cancellation",
            "image": "/uploads/templates/product-1.jpg",
            "url": "#"
          },
          {
            "name": "Smart Watch",
            "price": "199", 
            "description": "Advanced fitness tracking and smart notifications",
            "image": "/uploads/templates/product-2.jpg",
            "url": "#"
          },
          {
            "name": "Laptop Stand",
            "price": "79",
            "description": "Ergonomic aluminum laptop stand for better posture",
            "image": "/uploads/templates/product-3.jpg",
            "url": "#"
          }
        ]
      }
    },
    {
      "id": "features_1",
      "type": "features",
      "name": "Features Section",
      "visible": true,
      "content": {
        "title": "Why Shop With Us",
        "features": [
          {
            "name": "Free Shipping",
            "description": "Free shipping on orders over $50"
          },
          {
            "name": "30-Day Returns",
            "description": "Easy returns within 30 days"
          },
          {
            "name": "24/7 Support", 
            "description": "Customer support available anytime"
          }
        ]
      }
    },
    {
      "id": "contact_3",
      "type": "contact",
      "name": "Contact Section",
      "visible": true,
      "content": {
        "title": "Customer Support",
        "email": "support@store.com",
        "phone": "+62 800 1234 5678",
        "address": "Jl. Shopping Center No. 456, Jakarta"
      }
    }
  ],
  "floatingContacts": {
    "whatsapp": {
      "enabled": true,
      "number": "6281234567890",
      "message": "Hi! I have a question about your products."
    },
    "telegram": {
      "enabled": false,
      "username": ""
    }
  }
}' WHERE name = 'E-commerce Store';

UPDATE templates SET content = '{
  "blocks": [
    {
      "id": "hero_4",
      "type": "hero",
      "name": "Hero Section",
      "visible": true,
      "content": {
        "title": "Tech Conference 2024",
        "subtitle": "Join us for the biggest technology conference of the year. Learn from industry experts and network with professionals.",
        "buttonText": "Register Now",
        "buttonUrl": "https://wa.me/6281234567890",
        "backgroundImage": "/uploads/templates/hero-event.jpg"
      }
    },
    {
      "id": "schedule_1",
      "type": "schedule",
      "name": "Schedule Section",
      "visible": true,
      "content": {
        "title": "Event Schedule",
        "schedule": [
          {
            "time": "09:00 - 10:00",
            "title": "Registration & Welcome Coffee",
            "speaker": "Event Team"
          },
          {
            "time": "10:00 - 11:30", 
            "title": "Keynote: Future of Technology",
            "speaker": "Dr. Sarah Wilson"
          },
          {
            "time": "11:45 - 12:30",
            "title": "AI and Machine Learning Trends",
            "speaker": "Michael Chen"
          },
          {
            "time": "14:00 - 15:30",
            "title": "Building Scalable Applications",
            "speaker": "Alex Rodriguez"
          }
        ]
      }
    },
    {
      "id": "speakers_1",
      "type": "speakers",
      "name": "Speakers Section",
      "visible": true,
      "content": {
        "title": "Featured Speakers",
        "speakers": [
          {
            "name": "Dr. Sarah Wilson",
            "title": "Chief Technology Officer",
            "company": "TechCorp",
            "bio": "Leading expert in artificial intelligence and machine learning",
            "image": "/uploads/templates/speaker-1.jpg"
          },
          {
            "name": "Michael Chen",
            "title": "Senior Developer",
            "company": "StartupXYZ", 
            "bio": "Full-stack developer with 10+ years experience",
            "image": "/uploads/templates/speaker-2.jpg"
          }
        ]
      }
    },
    {
      "id": "contact_4",
      "type": "contact",
      "name": "Contact Section",
      "visible": true,
      "content": {
        "title": "Event Information",
        "email": "info@techconf2024.com",
        "phone": "+62 21 9876 5432",
        "address": "Jakarta Convention Center, Jakarta"
      }
    }
  ],
  "floatingContacts": {
    "whatsapp": {
      "enabled": true,
      "number": "6281234567890",
      "message": "Hi! I want to register for Tech Conference 2024."
    },
    "telegram": {
      "enabled": true,
      "username": "techconf2024"
    }
  }
}' WHERE name = 'Event Landing';