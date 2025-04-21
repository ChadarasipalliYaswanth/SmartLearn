/**
 * Notification utilities
 */

// Create a notification sound using the Web Audio API
export const playNotificationSound = () => {
  try {
    // Check if the AudioContext is supported
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
      // Create an AudioContext
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextClass();

      // Create an oscillator for the notification sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Configure the oscillator and gain node
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      // Connect the nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Start and stop the oscillator
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        
        // Play a second tone for the notification
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        
        oscillator2.type = 'sine';
        oscillator2.frequency.setValueAtTime(1046.5, audioContext.currentTime); // C6
        gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        
        oscillator2.start();
        setTimeout(() => {
          oscillator2.stop();
        }, 250);
      }, 200);
    } else {
      console.warn('Web Audio API is not supported in this browser');
    }
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

// Display a browser notification if supported
export const showBrowserNotification = (title, body, icon = '/favicon.ico', onClick = null) => {
  // Check if the browser supports notifications
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notifications");
    return;
  }

  // Check notification permission
  if (Notification.permission === "granted") {
    createNotification(title, body, icon, onClick);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        createNotification(title, body, icon, onClick);
      }
    });
  }
};

// Helper to create the actual notification
const createNotification = (title, body, icon, onClick) => {
  const notification = new Notification(title, {
    body,
    icon,
    tag: 'chat-notification',
    silent: true // We'll play our own sound
  });

  if (onClick) {
    notification.onclick = onClick;
  }
  
  // Auto-close after 5 seconds
  setTimeout(() => {
    notification.close();
  }, 5000);
};

// Update page title with notification count
export const updatePageTitle = (count, originalTitle) => {
  if (count > 0) {
    document.title = `(${count}) New Message${count > 1 ? 's' : ''} - ${originalTitle}`;
  } else {
    document.title = originalTitle;
  }
};

// Toggle title to draw attention
export const startTitleNotification = (count, originalTitle) => {
  let interval;
  let isOriginal = false;
  
  // Clear any existing intervals
  if (window._titleInterval) {
    clearInterval(window._titleInterval);
  }
  
  // Set up a new interval
  interval = setInterval(() => {
    if (isOriginal) {
      document.title = `(${count}) New Message${count > 1 ? 's' : ''}`;
    } else {
      document.title = originalTitle;
    }
    isOriginal = !isOriginal;
  }, 1000);
  
  // Store the interval ID globally
  window._titleInterval = interval;
  
  // Return a function to stop the notification
  return () => {
    if (interval) {
      clearInterval(interval);
      document.title = originalTitle;
    }
  };
};

export default {
  playNotificationSound,
  showBrowserNotification,
  updatePageTitle,
  startTitleNotification
}; 