import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Lock, Check, AlertCircle } from 'lucide-react';
import Button from './Button';
import Alert from './Alert';
import axios from 'axios';

const PaymentModal = ({ plan, billingCycle, onSuccess, onError, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [amount, setAmount] = useState(0);
  const [alert, setAlert] = useState(null);
  const [step, setStep] = useState('details'); // 'details', 'payment', 'processing', 'success'

  // Mock Stripe Elements (in production, use real Stripe)
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  useEffect(() => {
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      
      const response = await axios.post('/api/payments/create-intent', {
        plan,
        billing_cycle: billingCycle
      });

      if (response.data.success) {
        setClientSecret(response.data.data.clientSecret);
        setAmount(response.data.data.amount);
      } else {
        onError(response.data.message);
        onClose();
      }
    } catch (error) {
      console.error('Payment intent error:', error);
      onError(error.response?.data?.message || 'Failed to initialize payment');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      setStep('processing');

      // Validate card data
      if (!cardData.number || !cardData.expiry || !cardData.cvc || !cardData.name) {
        setAlert({ type: 'error', message: 'Please fill in all card details' });
        setStep('payment');
        return;
      }

      // Simulate payment processing (in production, use real Stripe)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock payment success
      const mockPaymentIntentId = `pi_mock_${Date.now()}`;
      
      const confirmResponse = await axios.post('/api/payments/confirm', {
        payment_intent_id: mockPaymentIntentId,
        plan
      });

      if (confirmResponse.data.success) {
        setStep('success');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        onError(confirmResponse.data.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      onError(error.response?.data?.message || 'Payment failed');
      setStep('payment');
    } finally {
      setLoading(false);
    }
  };

  const handleCardChange = (field, value) => {
    setCardData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const getPlanDetails = () => {
    const plans = {
      pro: { name: 'Pro', price: 29.99 },
      enterprise: { name: 'Enterprise', price: 99.99 }
    };
    
    const planInfo = plans[plan];
    const price = billingCycle === 'yearly' ? planInfo.price * 12 * 0.8 : planInfo.price;
    
    return {
      name: planInfo.name,
      price,
      period: billingCycle === 'yearly' ? 'year' : 'month',
      savings: billingCycle === 'yearly' ? planInfo.price * 12 * 0.2 : 0
    };
  };

  const planDetails = getPlanDetails();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {step === 'success' ? 'Payment Successful!' : 'Upgrade to ' + planDetails.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Alert */}
            {alert && (
              <div className="mb-4">
                <Alert 
                  type={alert.type} 
                  message={alert.message} 
                  onClose={() => setAlert(null)}
                />
              </div>
            )}

            {/* Step: Details */}
            {step === 'details' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Plan Summary */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">{planDetails.name} Plan</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span className="font-medium">${planDetails.price.toFixed(2)}/{planDetails.period}</span>
                    </div>
                    {planDetails.savings > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Yearly Savings:</span>
                        <span className="font-medium">-${planDetails.savings.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>${planDetails.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">What you'll get:</h4>
                  <div className="space-y-2">
                    {[
                      'Unlimited projects',
                      'Premium templates',
                      'Advanced analytics',
                      'Priority support',
                      'Custom branding'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => setStep('payment')}
                  disabled={loading}
                >
                  Continue to Payment
                </Button>
              </motion.div>
            )}

            {/* Step: Payment */}
            {step === 'payment' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <CreditCard className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Payment Details</h3>
                  <p className="text-sm text-gray-600">Your payment is secured with 256-bit SSL encryption</p>
                </div>

                {/* Mock Payment Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardData.number}
                      onChange={(e) => handleCardChange('number', formatCardNumber(e.target.value))}
                      maxLength={19}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardData.expiry}
                        onChange={(e) => handleCardChange('expiry', formatExpiry(e.target.value))}
                        maxLength={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVC
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        value={cardData.cvc}
                        onChange={(e) => handleCardChange('cvc', e.target.value.replace(/\D/g, '').substring(0, 4))}
                        maxLength={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={cardData.name}
                      onChange={(e) => handleCardChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Security Notice */}
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <Lock className="w-4 h-4" />
                  <span>Your payment information is secure and encrypted</span>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handlePayment}
                    loading={loading}
                  >
                    Pay ${planDetails.price.toFixed(2)}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setStep('details')}
                  >
                    Back
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step: Processing */}
            {step === 'processing' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
                <p className="text-gray-600">Please wait while we process your payment...</p>
              </motion.div>
            )}

            {/* Step: Success */}
            {step === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
                <p className="text-gray-600 mb-4">
                  Welcome to {planDetails.name}! Your account has been upgraded.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    You now have access to all {planDetails.name} features. Enjoy building amazing projects!
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentModal;