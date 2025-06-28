import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  Crown, 
  Zap, 
  Star, 
  ArrowRight, 
  Shield,
  Sparkles,
  Users,
  BarChart3,
  Palette
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import PaymentModal from '../components/ui/PaymentModal';
import axios from 'axios';

const PricingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly');

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const response = await axios.get('/api/payments/pricing');
      
      if (response.data.success) {
        setPlans(response.data.data.plans);
      } else {
        setAlert({ type: 'error', message: 'Failed to load pricing' });
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
      setAlert({ type: 'error', message: 'Failed to load pricing information' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (planKey) => {
    if (!isAuthenticated) {
      setAlert({ 
        type: 'warning', 
        message: 'Please login to upgrade your plan' 
      });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (user?.plan === planKey) {
      setAlert({ 
        type: 'info', 
        message: 'You already have this plan' 
      });
      return;
    }

    setSelectedPlan(planKey);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setAlert({ 
      type: 'success', 
      message: 'Payment successful! Your plan has been upgraded.' 
    });
    
    // Refresh user data
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handlePaymentError = (error) => {
    setAlert({ 
      type: 'error', 
      message: error || 'Payment failed. Please try again.' 
    });
  };

  const pricingPlans = [
    {
      key: 'free',
      name: 'Free',
      price: 0,
      description: 'Perfect for getting started',
      icon: Zap,
      color: 'from-gray-500 to-gray-600',
      popular: false,
      features: [
        '3 projects',
        'Basic templates',
        'Standard analytics',
        'Community support',
        '100MB storage',
        'Oxdel branding'
      ],
      limitations: [
        'Limited templates',
        'Basic customization',
        'Standard support'
      ]
    },
    {
      key: 'pro',
      name: 'Pro',
      price: plans?.pro?.price || 29.99,
      description: 'Best for professionals',
      icon: Crown,
      color: 'from-purple-500 to-pink-500',
      popular: true,
      features: [
        'Unlimited projects',
        'Premium templates',
        'Advanced analytics',
        'Priority support',
        '10GB storage',
        'Custom branding',
        'Export capabilities',
        'Advanced customization'
      ],
      limitations: []
    },
    {
      key: 'enterprise',
      name: 'Enterprise',
      price: plans?.enterprise?.price || 99.99,
      description: 'For large organizations',
      icon: Shield,
      color: 'from-blue-500 to-indigo-600',
      popular: false,
      features: [
        'Everything in Pro',
        'White-label solution',
        'API access',
        'Custom integrations',
        'Unlimited storage',
        'Dedicated support',
        'SLA guarantee',
        'Team collaboration',
        'Advanced security'
      ],
      limitations: []
    }
  ];

  const getYearlyPrice = (monthlyPrice) => {
    return monthlyPrice * 12 * 0.8; // 20% discount
  };

  const getDisplayPrice = (plan) => {
    if (plan.price === 0) return 'Free';
    
    const price = billingCycle === 'yearly' ? getYearlyPrice(plan.price) : plan.price;
    const period = billingCycle === 'yearly' ? '/year' : '/month';
    
    return `$${price.toFixed(2)}${period}`;
  };

  const getSavings = (plan) => {
    if (plan.price === 0 || billingCycle === 'monthly') return null;
    
    const monthlyTotal = plan.price * 12;
    const yearlyPrice = getYearlyPrice(plan.price);
    const savings = monthlyTotal - yearlyPrice;
    
    return `Save $${savings.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Navbar />
      
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Alert */}
          {alert && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert 
                type={alert.type} 
                message={alert.message} 
                onClose={() => setAlert(null)}
              />
            </motion.div>
          )}

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
                Choose Your <span className="gradient-text">Plan</span>
              </h1>
            </div>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Start free and scale as you grow. All plans include our core features with no hidden fees.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  billingCycle === 'yearly' ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Yearly
              </span>
              {billingCycle === 'yearly' && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  Save 20%
                </span>
              )}
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {pricingPlans.map((plan, index) => {
              const Icon = plan.icon;
              const isCurrentPlan = user?.plan === plan.key;
              
              return (
                <motion.div
                  key={plan.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`relative glass-card-white p-8 ${
                    plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                        <Star className="w-4 h-4" />
                        <span>Most Popular</span>
                      </div>
                    </div>
                  )}

                  {/* Current Plan Badge */}
                  {isCurrentPlan && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                        Current Plan
                      </div>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.color} p-4 mx-auto mb-4`}>
                      <Icon className="w-full h-full text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    
                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-gray-900">
                        {getDisplayPrice(plan)}
                      </div>
                      {getSavings(plan) && (
                        <div className="text-green-600 text-sm font-medium">
                          {getSavings(plan)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    variant={plan.popular ? 'primary' : 'outline'}
                    className="w-full"
                    onClick={() => handleUpgrade(plan.key)}
                    disabled={isCurrentPlan}
                    icon={isCurrentPlan ? Check : ArrowRight}
                  >
                    {isCurrentPlan ? 'Current Plan' : plan.key === 'free' ? 'Get Started' : 'Upgrade Now'}
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Features Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-card-white p-8 mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Compare Features
            </h2>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div className="space-y-6">
                <h3 className="font-semibold text-gray-900">Features</h3>
                <div className="space-y-4 text-sm text-gray-600">
                  <div>Projects</div>
                  <div>Templates</div>
                  <div>Storage</div>
                  <div>Analytics</div>
                  <div>Support</div>
                  <div>Branding</div>
                  <div>API Access</div>
                  <div>Team Collaboration</div>
                </div>
              </div>

              {pricingPlans.map((plan) => (
                <div key={plan.key} className="space-y-6">
                  <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                  <div className="space-y-4 text-sm">
                    <div>{plan.key === 'free' ? '3' : 'Unlimited'}</div>
                    <div>{plan.key === 'free' ? 'Basic' : 'Premium'}</div>
                    <div>{plan.key === 'free' ? '100MB' : plan.key === 'pro' ? '10GB' : 'Unlimited'}</div>
                    <div>{plan.key === 'free' ? 'Basic' : 'Advanced'}</div>
                    <div>{plan.key === 'free' ? 'Community' : plan.key === 'pro' ? 'Priority' : 'Dedicated'}</div>
                    <div>{plan.key === 'free' ? 'Oxdel' : 'Custom'}</div>
                    <div>{plan.key === 'enterprise' ? <Check className="w-4 h-4 text-green-500" /> : '—'}</div>
                    <div>{plan.key === 'enterprise' ? <Check className="w-4 h-4 text-green-500" /> : '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Frequently Asked Questions
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  question: 'Can I change my plan anytime?',
                  answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.'
                },
                {
                  question: 'Is there a free trial?',
                  answer: 'Yes, all new users get a 14-day free trial of Pro features when they sign up.'
                },
                {
                  question: 'What payment methods do you accept?',
                  answer: 'We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.'
                },
                {
                  question: 'Can I cancel anytime?',
                  answer: 'Yes, you can cancel your subscription at any time. No long-term contracts or cancellation fees.'
                }
              ].map((faq, index) => (
                <div key={index} className="text-left">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          billingCycle={billingCycle}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
};

export default PricingPage;