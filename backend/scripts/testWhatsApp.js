const dotenv = require('dotenv');
const mongoose = require('mongoose');
const whatsappService = require('../services/whatsappService');
const logger = require('../utils/logger');
const User = require('../models/User');

dotenv.config();

const run = async () => {
  try {
    const targetNumber = process.argv[2] || process.env.WHATSAPP_DEMO_TO_NUMBER;
    const requiredWhatsAppEnv = ['WHATSAPP_API_URL', 'WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_ACCESS_TOKEN'];
    const invalidEnvKeys = requiredWhatsAppEnv.filter((key) => {
      const value = process.env[key];
      return !value || value.includes('your_');
    });

    if (!targetNumber) {
      throw new Error('Provide a target number as argument or set WHATSAPP_DEMO_TO_NUMBER in .env');
    }

    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    const fallbackRecipient =
      (await User.findOne({ role: 'admin' }).select('_id')) ||
      (await User.findOne().select('_id'));

    if (!fallbackRecipient) {
      throw new Error('No users found in database. Run npm run seed first.');
    }

    const result = await whatsappService.sendMessage(
      targetNumber,
      '✅ Live WhatsApp test from Hospital Management System. If you see this on your phone, real delivery is working.',
      'general',
      {
        userId: fallbackRecipient._id,
        source: 'manual_whatsapp_test',
      }
    );

    if (!result.success) {
      logger.error('WhatsApp test failed', result.error);
      process.exit(1);
    }

    if (result.demo) {
      logger.warn('WhatsApp is still in DEMO mode. Replace placeholder WhatsApp credentials in backend/.env');
      if (invalidEnvKeys.length > 0) {
        logger.warn(`Invalid or placeholder env keys: ${invalidEnvKeys.join(', ')}`);
      }
    } else {
      logger.success('WhatsApp real delivery call succeeded. Check your phone now.');
    }

    process.exit(0);
  } catch (error) {
    logger.error('WhatsApp test script error:', error.message || error);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

run();
