import { useEffect, useState } from 'react';

/**
 * VoiceCommandOverlay — Brief animated overlay showing recognized command and action
 * Appears for 2 seconds then auto-dismisses
 * 
 * @param {Object} props
 * @param {boolean} props.visible - Whether the overlay is visible
 * @param {string} props.command - The recognized voice command text
 * @param {string} props.action - The action being taken (e.g., "Navigating to Equipment...")
 * @param {Function} [props.onDismiss] - Callback when overlay dismisses
 */
export default function VoiceCommandOverlay({ visible, command, action, onDismiss }) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (!visible) return;

    // Reset animation state when becoming visible
    setIsAnimatingOut(false);

    // Start dismiss animation after 1.6s, fully dismiss at 2s
    const animTimer = setTimeout(() => {
      setIsAnimatingOut(true);
    }, 1600);

    const dismissTimer = setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 2000);

    return () => {
      clearTimeout(animTimer);
      clearTimeout(dismissTimer);
    };
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <>
      <div
        className={`voice-command-overlay ${isAnimatingOut ? 'fade-out' : 'fade-in'}`}
        role="status"
        aria-live="polite"
        aria-label={`Voice command: ${command}. Action: ${action}`}
      >
        {/* Mic icon */}
        <div className="voice-command-overlay__icon">🎙️</div>

        {/* Command text */}
        {command && (
          <div className="voice-command-overlay__command">
            "{command}"
          </div>
        )}

        {/* Action text */}
        {action && (
          <div className="voice-command-overlay__action">
            {action}
          </div>
        )}

        {/* Progress bar */}
        <div className="voice-command-overlay__progress">
          <div className="voice-command-overlay__progress-bar" />
        </div>
      </div>

      <style>{`
        .voice-command-overlay {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 9999;
          background: rgba(30, 30, 30, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 20px;
          padding: 24px 32px;
          min-width: 260px;
          max-width: 340px;
          text-align: center;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          pointer-events: none;
        }

        .voice-command-overlay.fade-in {
          animation: vcOverlayIn 0.25s ease forwards;
        }

        .voice-command-overlay.fade-out {
          animation: vcOverlayOut 0.4s ease forwards;
        }

        @keyframes vcOverlayIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.85);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes vcOverlayOut {
          from {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          to {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
        }

        .voice-command-overlay__icon {
          font-size: 2rem;
          margin-bottom: 10px;
          animation: vcIconPulse 0.6s ease-in-out infinite alternate;
        }

        @keyframes vcIconPulse {
          from { transform: scale(1); }
          to { transform: scale(1.15); }
        }

        .voice-command-overlay__command {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.85rem;
          font-style: italic;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .voice-command-overlay__action {
          color: #ffffff;
          font-size: 1rem;
          font-weight: 600;
          line-height: 1.4;
          margin-bottom: 16px;
        }

        .voice-command-overlay__progress {
          height: 3px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 2px;
          overflow: hidden;
        }

        .voice-command-overlay__progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #4caf50, #81c784);
          border-radius: 2px;
          animation: vcProgress 2s linear forwards;
        }

        @keyframes vcProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </>
  );
}
