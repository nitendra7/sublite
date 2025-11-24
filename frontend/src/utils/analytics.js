// Analytics utility for tracking user actions and events

class Analytics {
  constructor() {
    this.events = [];
    this.sessionId = this.generateSessionId();
  }

  // Generate unique session ID
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Track page view
  trackPageView(pageName, properties = {}) {
    this.track('page_view', {
      page: pageName,
      url: window.location.href,
      ...properties
    });
  }

  // Track custom event
  track(eventName, properties = {}) {
    const event = {
      event: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`
      }
    };

    this.events.push(event);
    this.sendToServer(event);
    
    // Also send to third-party analytics if configured
    this.sendToThirdParty(event);
  }

  // Track button clicks
  trackClick(buttonName, properties = {}) {
    this.track('button_click', {
      button: buttonName,
      ...properties
    });
  }

  // Track form submissions
  trackFormSubmit(formName, properties = {}) {
    this.track('form_submit', {
      form: formName,
      ...properties
    });
  }

  // Track errors
  trackError(error, context = {}) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      ...context
    });
  }

  // Track user actions
  trackUserAction(action, properties = {}) {
    this.track('user_action', {
      action,
      ...properties
    });
  }

  // Track search queries
  trackSearch(query, results = 0) {
    this.track('search', {
      query,
      resultsCount: results
    });
  }

  // Track booking actions
  trackBooking(action, bookingData = {}) {
    this.track(`booking_${action}`, bookingData);
  }

  // Track payment actions
  trackPayment(action, paymentData = {}) {
    this.track(`payment_${action}`, {
      ...paymentData,
      // Remove sensitive data
      cardNumber: undefined,
      cvv: undefined
    });
  }

  // Send event to server
  async sendToServer(event) {
    try {
      // API call would go here
      // await api.post('/api/analytics/track', event);
      console.log('Analytics event tracked:', event);
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  }

  // Send to third-party analytics (Google Analytics, Mixpanel, etc.)
  sendToThirdParty(event) {
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', event.event, event.properties);
    }

    // Mixpanel
    if (window.mixpanel) {
      window.mixpanel.track(event.event, event.properties);
    }

    // Facebook Pixel
    if (window.fbq) {
      window.fbq('track', event.event, event.properties);
    }
  }

  // Set user properties
  setUser(userId, properties = {}) {
    this.userId = userId;
    this.userProperties = properties;
  }

  // Get session data
  getSessionData() {
    return {
      sessionId: this.sessionId,
      events: this.events,
      userId: this.userId,
      userProperties: this.userProperties
    };
  }

  // Clear session
  clearSession() {
    this.events = [];
    this.sessionId = this.generateSessionId();
  }
}

// Create singleton instance
const analytics = new Analytics();

export default analytics;
