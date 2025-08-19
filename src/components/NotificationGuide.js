import React, { useState } from 'react';
import { useNotify } from '../context/NotificationContext';

const NotificationGuide = ({ onClose, onEnableNotifications }) => {
  const { notify } = useNotify();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: '🔔 Enable Notifications',
      content:
        'Get prayer time reminders and important updates from Madina Masjid Badarkha',
      action: 'Enable Notifications',
      icon: '🔔',
    },
    {
      title: '📱 Mobile Setup',
      content:
        'For mobile devices, you may need to enable notifications in browser settings',
      action: 'Show Mobile Guide',
      icon: '📱',
    },
    {
      title: '⚙️ Browser Settings',
      content:
        'If notifications are blocked, enable them in your browser settings',
      action: 'Show Browser Guide',
      icon: '⚙️',
    },
  ];

  const handleEnableNotifications = async () => {
    try {
      const result = await onEnableNotifications();
      if (result) {
        notify('Notifications enabled successfully!', { type: 'success' });
        onClose();
      } else {
        setCurrentStep(1); // Move to mobile guide
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      setCurrentStep(2); // Move to browser guide
    }
  };

  const getMobileGuide = () => (
    <div className='guide-content'>
      <h4>📱 Mobile Device Setup</h4>
      <div className='guide-steps'>
        <div className='guide-step'>
          <span className='step-number'>1</span>
          <div className='step-content'>
            <strong>Android Chrome:</strong>
            <ul>
              <li>Tap the three dots menu (⋮)</li>
              <li>Go to Settings → Site Settings</li>
              <li>Tap Notifications → Allow</li>
              <li>Refresh the page</li>
            </ul>
          </div>
        </div>
        <div className='guide-step'>
          <span className='step-number'>2</span>
          <div className='step-content'>
            <strong>iOS Safari:</strong>
            <ul>
              <li>Go to Settings → Safari</li>
              <li>Tap Advanced → Website Data</li>
              <li>Find this site and enable notifications</li>
              <li>Refresh the page</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const getBrowserGuide = () => (
    <div className='guide-content'>
      <h4>⚙️ Browser Settings</h4>
      <div className='guide-steps'>
        <div className='guide-step'>
          <span className='step-number'>1</span>
          <div className='step-content'>
            <strong>Chrome:</strong>
            <ul>
              <li>Click the lock icon in address bar</li>
              <li>Change "Notifications" to "Allow"</li>
              <li>Refresh the page</li>
            </ul>
          </div>
        </div>
        <div className='guide-step'>
          <span className='step-number'>2</span>
          <div className='step-content'>
            <strong>Firefox:</strong>
            <ul>
              <li>Click the shield icon in address bar</li>
              <li>Click "Permissions" → "Notifications"</li>
              <li>Select "Allow" and refresh</li>
            </ul>
          </div>
        </div>
        <div className='guide-step'>
          <span className='step-number'>3</span>
          <div className='step-content'>
            <strong>Safari:</strong>
            <ul>
              <li>Go to Safari → Preferences</li>
              <li>Click "Websites" → "Notifications"</li>
              <li>Find this site and select "Allow"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const currentStepData = steps[currentStep];

  return (
    <div className='notification-guide-modal'>
      <div className='guide-header'>
        <h3>
          {currentStepData.icon} {currentStepData.title}
        </h3>
        <button className='guide-close' onClick={onClose}>
          ✕
        </button>
      </div>

      <div className='guide-body'>
        <p className='guide-description'>{currentStepData.content}</p>

        {currentStep === 0 && (
          <div className='guide-actions'>
            <button
              className='guide-btn primary'
              onClick={handleEnableNotifications}
            >
              {currentStepData.action}
            </button>
            <button
              className='guide-btn secondary'
              onClick={() => setCurrentStep(1)}
            >
              Skip for now
            </button>
          </div>
        )}

        {currentStep === 1 && getMobileGuide()}
        {currentStep === 2 && getBrowserGuide()}

        {currentStep > 0 && (
          <div className='guide-navigation'>
            <button
              className='guide-btn secondary'
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              ← Back
            </button>
            {currentStep < steps.length - 1 && (
              <button
                className='guide-btn primary'
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next →
              </button>
            )}
          </div>
        )}
      </div>

      <div className='guide-footer'>
        <div className='guide-progress'>
          {steps.map((_, index) => (
            <div
              key={index}
              className={`progress-dot ${index === currentStep ? 'active' : ''}`}
              onClick={() => setCurrentStep(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationGuide;
