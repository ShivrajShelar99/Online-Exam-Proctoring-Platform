import React, { useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Camera, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface Violation {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
}

interface AntiCheatMonitorProps {
  sessionId: number;
  onViolation: (violation: Violation) => void;
}

const AntiCheatMonitor: React.FC<AntiCheatMonitorProps> = ({ 
  sessionId, 
  onViolation 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [faceDetected, setFaceDetected] = useState(true);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isWindowFocused, setIsWindowFocused] = useState(true);

  useEffect(() => {
    initializeCamera();
    setupEventListeners();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsMonitoring(true);
        
        // Start face detection after video loads
        videoRef.current.onloadedmetadata = () => {
          startFaceDetection();
        };
      }
    } catch (error) {
      console.error('Failed to access camera:', error);
      reportViolation({
        type: 'camera_access_denied',
        description: 'Camera access was denied or unavailable',
        severity: 'high',
        timestamp: new Date()
      });
    }
  };

  const startFaceDetection = () => {
    const detectFace = () => {
      if (!videoRef.current || !canvasRef.current || !isMonitoring) return;
      
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      // Simple face detection simulation - in real app, use TensorFlow.js or MediaPipe
      const mockFaceDetected = Math.random() > 0.1; // 90% chance face is detected
      
      if (!mockFaceDetected && faceDetected) {
        setFaceDetected(false);
        reportViolation({
          type: 'face_not_detected',
          description: 'Student face not detected in camera feed',
          severity: 'medium',
          timestamp: new Date()
        });
      } else if (mockFaceDetected && !faceDetected) {
        setFaceDetected(true);
      }
      
      // Check for multiple faces (cheating indicator)
      const mockMultipleFaces = Math.random() > 0.95; // 5% chance
      if (mockMultipleFaces) {
        reportViolation({
          type: 'multiple_faces',
          description: 'Multiple faces detected in camera feed',
          severity: 'high',
          timestamp: new Date()
        });
      }
      
      // Continue detection
      requestAnimationFrame(detectFace);
    };
    
    detectFace();
  };

  const setupEventListeners = () => {
    // Tab switch detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        reportViolation({
          type: 'tab_switch',
          description: 'Student switched away from exam tab',
          severity: 'medium',
          timestamp: new Date()
        });
      }
    };

    // Window focus detection
    const handleWindowBlur = () => {
      setIsWindowFocused(false);
      reportViolation({
        type: 'window_blur',
        description: 'Exam window lost focus',
        severity: 'medium',
        timestamp: new Date()
      });
    };

    const handleWindowFocus = () => {
      setIsWindowFocused(true);
    };

    // Fullscreen exit detection
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        reportViolation({
          type: 'fullscreen_exit',
          description: 'Student exited fullscreen mode',
          severity: 'high',
          timestamp: new Date()
        });
      }
    };

    // Right-click prevention
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      reportViolation({
        type: 'right_click_attempt',
        description: 'Attempted to access context menu',
        severity: 'low',
        timestamp: new Date()
      });
    };

    // Key combination detection
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common cheating key combinations
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'a')) ||
        (e.altKey && e.key === 'Tab') ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I')
      ) {
        e.preventDefault();
        reportViolation({
          type: 'suspicious_key_combination',
          description: `Suspicious key combination detected: ${e.key}`,
          severity: 'medium',
          timestamp: new Date()
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  };

  const reportViolation = (violation: Violation) => {
    setViolations(prev => [...prev, violation]);
    onViolation(violation);
    
    console.log('Violation detected:', violation);
    
    // In real app, send violation to server
    // await reportViolationToServer(sessionId, violation);
  };

  const cleanup = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsMonitoring(false);
  };

  const getViolationSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {/* Camera Monitor */}
      <div className="bg-white rounded-lg shadow-lg p-3 max-w-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Camera className="h-4 w-4" />
            <span className="text-sm font-medium">Monitor</span>
          </div>
          <Badge variant={isMonitoring ? 'default' : 'destructive'}>
            {isMonitoring ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-24 bg-gray-200 rounded object-cover"
            muted
            playsInline
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          
          {/* Face detection indicator */}
          <div className="absolute top-1 left-1">
            {faceDetected ? (
              <Eye className="h-4 w-4 text-green-600" />
            ) : (
              <EyeOff className="h-4 w-4 text-red-600" />
            )}
          </div>
        </div>

        {/* Status indicators */}
        <div className="mt-2 space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Face Detection:</span>
            <Badge variant={faceDetected ? 'default' : 'destructive'} className="text-xs">
              {faceDetected ? 'OK' : 'Warning'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Tab Switches:</span>
            <Badge variant={tabSwitchCount === 0 ? 'default' : 'destructive'} className="text-xs">
              {tabSwitchCount}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Window Focus:</span>
            <Badge variant={isWindowFocused ? 'default' : 'destructive'} className="text-xs">
              {isWindowFocused ? 'Focused' : 'Lost'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Recent Violations */}
      {violations.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-3 max-w-xs max-h-48 overflow-y-auto">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium">Violations ({violations.length})</span>
          </div>
          
          <div className="space-y-1">
            {violations.slice(-5).map((violation, index) => (
              <div key={index} className="text-xs border-l-2 border-red-300 pl-2 py-1">
                <div className={`font-medium ${getViolationSeverityColor(violation.severity)}`}>
                  {violation.type.replace(/_/g, ' ').toUpperCase()}
                </div>
                <div className="text-gray-600 mt-1">
                  {violation.description}
                </div>
                <div className="text-gray-500 mt-1">
                  {violation.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Critical violations alert */}
      {violations.filter(v => v.severity === 'high').length >= 3 && (
        <Alert className="max-w-xs border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700 text-sm">
            Multiple critical violations detected. Exam may be terminated.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AntiCheatMonitor;
