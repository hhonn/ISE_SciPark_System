import QRCode from 'qrcode';
import crypto from 'crypto';

/**
 * QR Code Service
 * Generates secure QR codes for parking bookings
 */

/**
 * Generate QR code data for a booking
 * @param {Object} booking - Booking object
 * @returns {Promise<Object>} - QR code data URL and token
 */
export const generateBookingQRCode = async (booking) => {
  try {
    // Create secure token
    const token = crypto.randomBytes(32).toString('hex');
    
    // QR expires at checkInDeadline or 24 hours if no deadline
    const expiresAt = booking.checkInDeadline 
      ? new Date(booking.checkInDeadline).getTime()
      : Date.now() + (24 * 60 * 60 * 1000); // 24 hours default
    
    // QR payload with booking information
    const qrPayload = {
      bookingId: booking._id.toString(),
      userId: booking.user.toString(),
      spotId: booking.spot.toString(),
      token: token,
      timestamp: Date.now(),
      expiresAt: expiresAt
    };

    // Convert to JSON string
    const qrData = JSON.stringify(qrPayload);

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 400
    });

    return {
      qrCodeDataURL,
      token,
      expiresAt: expiresAt
    };

  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate QR code as buffer (for file storage)
 * @param {Object} booking - Booking object
 * @returns {Promise<Buffer>} - QR code buffer
 */
export const generateBookingQRCodeBuffer = async (booking) => {
  try {
    const token = crypto.randomBytes(32).toString('hex');
    
    // QR expires at checkInDeadline or 24 hours if no deadline
    const expiresAt = booking.checkInDeadline 
      ? new Date(booking.checkInDeadline).getTime()
      : Date.now() + (24 * 60 * 60 * 1000); // 24 hours default
    
    const qrPayload = {
      bookingId: booking._id.toString(),
      userId: booking.user.toString(),
      spotId: booking.spot.toString(),
      token: token,
      timestamp: Date.now(),
      expiresAt: expiresAt
    };

    const qrData = JSON.stringify(qrPayload);

    // Generate QR code as buffer
    const qrCodeBuffer = await QRCode.toBuffer(qrData, {
      errorCorrectionLevel: 'H',
      type: 'png',
      quality: 0.95,
      margin: 1,
      width: 400
    });

    return {
      buffer: qrCodeBuffer,
      token,
      expiresAt: expiresAt
    };

  } catch (error) {
    console.error('QR Code buffer generation error:', error);
    throw new Error('Failed to generate QR code buffer');
  }
};

/**
 * Validate QR code data
 * @param {string} qrData - QR code data string
 * @returns {Object} - Validation result
 */
export const validateQRCode = (qrData) => {
  try {
    const payload = JSON.parse(qrData);

    // Check required fields
    if (!payload.bookingId || !payload.userId || !payload.spotId || !payload.token) {
      return {
        valid: false,
        error: 'Invalid QR code format'
      };
    }

    // Check expiration
    if (Date.now() > payload.expiresAt) {
      return {
        valid: false,
        error: 'QR code has expired'
      };
    }

    // Check timestamp (QR code should not be older than 24 hours)
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (Date.now() - payload.timestamp > maxAge) {
      return {
        valid: false,
        error: 'QR code is too old'
      };
    }

    return {
      valid: true,
      payload
    };

  } catch (error) {
    return {
      valid: false,
      error: 'Failed to parse QR code'
    };
  }
};

/**
 * Generate simple QR code for any data
 * @param {string} data - Data to encode
 * @param {Object} options - QR code options
 * @returns {Promise<string>} - QR code data URL
 */
export const generateQRCode = async (data, options = {}) => {
  try {
    const defaultOptions = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 300
    };

    const qrOptions = { ...defaultOptions, ...options };
    const qrCodeDataURL = await QRCode.toDataURL(data, qrOptions);

    return qrCodeDataURL;

  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

export default {
  generateBookingQRCode,
  generateBookingQRCodeBuffer,
  validateQRCode,
  generateQRCode
};
