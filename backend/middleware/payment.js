import Stripe from 'stripe';
import { query } from '../config/database.js';
import { sendEmail } from '../config/email.js';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe webhook middleware
export const stripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  req.stripeEvent = event;
  next();
};

// Process payment webhook
export const processPaymentWebhook = async (req, res) => {
  const event = req.stripeEvent;

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Handle successful payment
const handlePaymentSuccess = async (paymentIntent) => {
  try {
    const { customer, metadata } = paymentIntent;
    const { userId, plan, type } = metadata;

    if (type === 'subscription') {
      // Update user plan
      await query(
        'UPDATE users SET plan = $1, subscription_expiry = $2, updated_at = NOW() WHERE id = $3',
        [plan, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), userId] // 30 days
      );

      // Get user details
      const userResult = await query(
        'SELECT full_name, email FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        
        // Send success email
        await sendEmail(user.email, 'paymentSuccess', {
          user,
          plan: plan.charAt(0).toUpperCase() + plan.slice(1),
          amount: (paymentIntent.amount / 100).toFixed(2)
        });
      }

      // Record payment in database
      await query(`
        INSERT INTO payments (user_id, stripe_payment_intent_id, amount, currency, status, plan, type, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      `, [
        userId,
        paymentIntent.id,
        paymentIntent.amount,
        paymentIntent.currency,
        'succeeded',
        plan,
        type
      ]);

      console.log(`✅ Payment succeeded for user ${userId}, plan: ${plan}`);
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
};

// Handle failed payment
const handlePaymentFailed = async (paymentIntent) => {
  try {
    const { metadata } = paymentIntent;
    const { userId, plan, type } = metadata;

    // Record failed payment
    await query(`
      INSERT INTO payments (user_id, stripe_payment_intent_id, amount, currency, status, plan, type, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    `, [
      userId,
      paymentIntent.id,
      paymentIntent.amount,
      paymentIntent.currency,
      'failed',
      plan,
      type
    ]);

    console.log(`❌ Payment failed for user ${userId}, plan: ${plan}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
};

// Handle subscription created
const handleSubscriptionCreated = async (subscription) => {
  try {
    const { customer, metadata } = subscription;
    const { userId, plan } = metadata;

    // Update user subscription
    await query(
      'UPDATE users SET plan = $1, subscription_expiry = $2, updated_at = NOW() WHERE id = $3',
      [plan, new Date(subscription.current_period_end * 1000), userId]
    );

    console.log(`✅ Subscription created for user ${userId}, plan: ${plan}`);
  } catch (error) {
    console.error('Error handling subscription creation:', error);
  }
};

// Handle subscription updated
const handleSubscriptionUpdated = async (subscription) => {
  try {
    const { customer, metadata } = subscription;
    const { userId } = metadata;

    // Update subscription expiry
    await query(
      'UPDATE users SET subscription_expiry = $1, updated_at = NOW() WHERE id = $2',
      [new Date(subscription.current_period_end * 1000), userId]
    );

    console.log(`✅ Subscription updated for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
};

// Handle subscription canceled
const handleSubscriptionCanceled = async (subscription) => {
  try {
    const { metadata } = subscription;
    const { userId } = metadata;

    // Downgrade to free plan
    await query(
      'UPDATE users SET plan = $1, subscription_expiry = NULL, updated_at = NOW() WHERE id = $2',
      ['free', userId]
    );

    console.log(`✅ Subscription canceled for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
};

// Handle invoice payment succeeded
const handleInvoicePaymentSucceeded = async (invoice) => {
  try {
    const { customer, subscription } = invoice;
    
    if (subscription) {
      // Extend subscription
      const subscriptionObj = await stripe.subscriptions.retrieve(subscription);
      const { metadata } = subscriptionObj;
      const { userId } = metadata;

      await query(
        'UPDATE users SET subscription_expiry = $1, updated_at = NOW() WHERE id = $2',
        [new Date(subscriptionObj.current_period_end * 1000), userId]
      );

      console.log(`✅ Invoice payment succeeded for user ${userId}`);
    }
  } catch (error) {
    console.error('Error handling invoice payment success:', error);
  }
};

// Handle invoice payment failed
const handleInvoicePaymentFailed = async (invoice) => {
  try {
    const { customer, subscription } = invoice;
    
    if (subscription) {
      const subscriptionObj = await stripe.subscriptions.retrieve(subscription);
      const { metadata } = subscriptionObj;
      const { userId } = metadata;

      // Send payment failed notification
      const userResult = await query(
        'SELECT full_name, email FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        // Send payment failed email (implement template)
        console.log(`❌ Invoice payment failed for user ${userId}`);
      }
    }
  } catch (error) {
    console.error('Error handling invoice payment failure:', error);
  }
};

// Create payment intent
export const createPaymentIntent = async (amount, currency, metadata) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency || 'usd',
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Create subscription
export const createSubscription = async (customerId, priceId, metadata) => {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata,
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    return {
      success: true,
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Create customer
export const createCustomer = async (email, name, metadata = {}) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata
    });

    return {
      success: true,
      customerId: customer.id
    };
  } catch (error) {
    console.error('Error creating customer:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export { stripe };
export default {
  stripeWebhook,
  processPaymentWebhook,
  createPaymentIntent,
  createSubscription,
  createCustomer
};