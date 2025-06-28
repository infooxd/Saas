import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { paymentRateLimit } from '../middleware/security.js';
import { 
  createPaymentIntent, 
  createSubscription, 
  createCustomer,
  processPaymentWebhook,
  stripeWebhook
} from '../middleware/payment.js';

const router = express.Router();

// Pricing plans configuration
const PRICING_PLANS = {
  pro: {
    name: 'Pro',
    price: 29.99,
    currency: 'usd',
    interval: 'month',
    features: [
      'Unlimited projects',
      'Premium templates',
      'Advanced analytics',
      'Custom branding',
      'Priority support',
      'Export capabilities'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: 99.99,
    currency: 'usd',
    interval: 'month',
    features: [
      'Everything in Pro',
      'White-label solution',
      'API access',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee'
    ]
  }
};

// GET /api/payments/pricing - Get pricing plans
router.get('/pricing', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        plans: PRICING_PLANS,
        currency: 'usd',
        billing_cycles: ['monthly', 'yearly']
      }
    });
  } catch (error) {
    console.error('Get pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pricing information'
    });
  }
});

// POST /api/payments/create-intent - Create payment intent
router.post('/create-intent', [
  authenticateToken,
  paymentRateLimit,
  body('plan')
    .isIn(['pro', 'enterprise'])
    .withMessage('Invalid plan selected'),
  body('billing_cycle')
    .optional()
    .isIn(['monthly', 'yearly'])
    .withMessage('Invalid billing cycle')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: errors.array()
      });
    }

    const { plan, billing_cycle = 'monthly' } = req.body;
    const userId = req.user.id;

    // Check if user already has this plan
    if (req.user.plan === plan) {
      return res.status(400).json({
        success: false,
        message: 'You already have this plan'
      });
    }

    // Calculate amount
    let amount = PRICING_PLANS[plan].price;
    if (billing_cycle === 'yearly') {
      amount = amount * 12 * 0.8; // 20% discount for yearly
    }

    // Create payment intent
    const paymentResult = await createPaymentIntent(amount, 'usd', {
      userId: userId.toString(),
      plan,
      billing_cycle,
      type: 'subscription'
    });

    if (!paymentResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment intent'
      });
    }

    // Record payment attempt
    await query(`
      INSERT INTO payments (user_id, amount, currency, status, plan, type, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `, [
      userId,
      Math.round(amount * 100), // Store in cents
      'usd',
      'pending',
      plan,
      'subscription'
    ]);

    res.json({
      success: true,
      data: {
        clientSecret: paymentResult.clientSecret,
        amount,
        plan,
        billing_cycle
      }
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent'
    });
  }
});

// POST /api/payments/confirm - Confirm payment
router.post('/confirm', [
  authenticateToken,
  body('payment_intent_id')
    .notEmpty()
    .withMessage('Payment intent ID is required'),
  body('plan')
    .isIn(['pro', 'enterprise'])
    .withMessage('Invalid plan selected')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: errors.array()
      });
    }

    const { payment_intent_id, plan } = req.body;
    const userId = req.user.id;

    // Update user plan (this will be confirmed by webhook)
    await query(
      'UPDATE users SET plan = $1, subscription_expiry = $2, updated_at = NOW() WHERE id = $3',
      [plan, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), userId] // 30 days
    );

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: {
        plan,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment'
    });
  }
});

// POST /api/payments/webhook - Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook, processPaymentWebhook);

// GET /api/payments/history - Get payment history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const userId = req.user.id;

    const result = await query(`
      SELECT id, amount, currency, status, plan, type, created_at
      FROM payments 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `, [userId, parseInt(limit), parseInt(offset)]);

    const countResult = await query(
      'SELECT COUNT(*) FROM payments WHERE user_id = $1',
      [userId]
    );

    res.json({
      success: true,
      data: {
        payments: result.rows.map(payment => ({
          ...payment,
          amount: payment.amount / 100 // Convert back to dollars
        })),
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment history'
    });
  }
});

// POST /api/payments/cancel-subscription - Cancel subscription
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Downgrade to free plan
    await query(
      'UPDATE users SET plan = $1, subscription_expiry = NULL, updated_at = NOW() WHERE id = $2',
      ['free', userId]
    );

    res.json({
      success: true,
      message: 'Subscription canceled successfully'
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
});

// GET /api/payments/invoice/:id - Get invoice
router.get('/invoice/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      'SELECT * FROM payments WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const payment = result.rows[0];

    res.json({
      success: true,
      data: {
        invoice: {
          ...payment,
          amount: payment.amount / 100,
          user: {
            name: req.user.full_name,
            email: req.user.email
          }
        }
      }
    });

  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get invoice'
    });
  }
});

export default router;