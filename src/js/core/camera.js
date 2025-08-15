// Camera Management System

import { DOM, DeviceUtils, AsyncUtils } from '../utils/helpers.js';
import { CAMERA_SETTINGS, ERROR_MESSAGES } from '../utils/constants.js';
import { SettingsManager } from '../utils/storage.js';
import Toast from '../components/toast.js';

/**
 * Camera Manager Class
 */
class CameraManager {
  constructor() {
    this.stream = null;
    this.video = null;
    this.canvas = null;
    this.context = null;
    this.isActive = false;
    this.currentFacingMode = 'environment';
    this.availableCameras = [];
    this.currentCameraId = null;
    this.constraints = { ...CAMERA_SETTINGS.constraints };
    
    // UI Elements
    this.startButton = null;
    this.stopButton = null;
    this.captureButton = null;
    this.flipButton = null;
    this.flashButton = null;
    
    this.init();
  }
  
  /**
   * Initialize camera manager
   */
  init() {
    this.video = DOM.get('video');
    this.canvas = DOM.get('canvas');
    
    if (this.canvas) {
      this.context = this.canvas.getContext('2d');
    }
    
    // Initialize UI elements
    this.initUIElements();
    
    // Get available cameras
    this.getCameras();
    
    // Apply settings
    this.applySettings();
  }
  
  /**
   * Initialize UI elements
   */
  initUIElements() {
    this.startButton = DOM.get('start-camera');
    this.stopButton = DOM.get('stop-camera');
    this.captureButton = DOM.get('capture-photo');
    this.flipButton = DOM.get('camera-flip');
    this.flashButton = DOM.get('flash-toggle');
    
    // Add event listeners
    if (this.startButton) {
      DOM.on(this.startButton, 'click', () => this.start());
    }
    
    if (this.stopButton) {
      DOM.on(this.stopButton, 'click', () => this.stop());
    }
    
    if (this.captureButton) {
      DOM.on(this.captureButton, 'click', () => this.capture());
    }
    
    if (this.flipButton) {
      DOM.on(this.flipButton, 'click', () => this.flipCamera());
    }
    
    if (this.flashButton) {
      DOM.on(this.flashButton, 'click', () => this.toggleFlash());
    }
  }
  
  /**
   * Apply settings from storage
   */
  applySettings() {
    const quality = SettingsManager.get('cameraQuality', 'high');
    this.setQuality(quality);
  }
  
  /**
   * Get available cameras
   */
  async getCameras() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableCameras = devices.filter(device => device.kind === 'videoinput');
      
      // Update UI
      this.updateCameraControls();
      
      return this.availableCameras;
    } catch (error) {
      console.warn('Error getting cameras:', error);
      return [];
    }
  }
  
  /**
   * Start camera
   */
  async start() {
    if (this.isActive) {
      return true;
    }
    
    try {
      // Request permissions and get stream
      this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);
      
      if (!this.video) {
        throw new Error('Video element not found');
      }
      
      // Set video source
      this.video.srcObject = this.stream;
      
      // Wait for video to load
      await new Promise((resolve, reject) => {
        this.video.onloadedmetadata = resolve;
        this.video.onerror = reject;
      });
      
      // Play video
      await this.video.play();
      
      // Update state
      this.isActive = true;
      this.currentCameraId = this.getCurrentCameraId();
      
      // Update UI
      this.updateUI();
      
      // Trigger event
      this.triggerEvent('camera:started');
      
      Toast.success('Câmera iniciada com sucesso');
      
      return true;
      
    } catch (error) {
      console.error('Error starting camera:', error);
      
      let errorMessage = ERROR_MESSAGES.CAMERA_ACCESS;
      
      if (error.name === 'NotFoundError') {
        errorMessage = ERROR_MESSAGES.CAMERA_NOT_FOUND;
      } else if (error.name === 'NotAllowedError') {
        errorMessage = 'Permissão de câmera negada. Verifique as configurações do navegador.';
      }
      
      Toast.error(errorMessage);
      
      return false;
    }
  }
  
  /**
   * Stop camera
   */
  stop() {
    if (!this.isActive) {
      return true;
    }
    
    try {
      // Stop all tracks
      if (this.stream) {
        this.stream.getTracks().forEach(track => {
          track.stop();
        });
        this.stream = null;
      }
      
      // Clear video source
      if (this.video) {
        this.video.srcObject = null;
      }
      
      // Update state
      this.isActive = false;
      this.currentCameraId = null;
      
      // Update UI
      this.updateUI();
      
      // Trigger event
      this.triggerEvent('camera:stopped');
      
      Toast.info('Câmera desligada');
      
      return true;
      
    } catch (error) {
      console.error('Error stopping camera:', error);
      Toast.error('Erro ao desligar câmera');
      return false;
    }
  }
  
  /**
   * Capture photo from video
   */
  capture() {
    if (!this.isActive || !this.video || !this.canvas || !this.context) {
      Toast.error('Câmera não está ativa');
      return null;
    }
    
    try {
      // Get video dimensions
      const videoWidth = this.video.videoWidth;
      const videoHeight = this.video.videoHeight;
      
      if (videoWidth === 0 || videoHeight === 0) {
        throw new Error('Video dimensions not available');
      }
      
      // Set canvas dimensions
      this.canvas.width = videoWidth;
      this.canvas.height = videoHeight;
      
      // Draw video frame to canvas
      this.context.drawImage(this.video, 0, 0, videoWidth, videoHeight);
      
      // Get image data
      const imageData = this.canvas.toDataURL('image/png');
      
      // Trigger event with image data
      this.triggerEvent('camera:captured', { imageData, canvas: this.canvas });
      
      // Haptic feedback
      DeviceUtils.vibrate(100);
      
      return {
        imageData,
        canvas: this.canvas,
        width: videoWidth,
        height: videoHeight
      };
      
    } catch (error) {
      console.error('Error capturing photo:', error);
      Toast.error('Erro ao capturar foto');
      return null;
    }
  }
  
  /**
   * Flip camera (front/back)
   */
  async flipCamera() {
    if (!this.isActive) {
      Toast.warning('Inicie a câmera primeiro');
      return false;
    }
    
    try {
      // Toggle facing mode
      this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
      
      // Update constraints
      this.constraints.video.facingMode = { ideal: this.currentFacingMode };
      
      // Restart camera with new constraints
      await this.stop();
      await AsyncUtils.sleep(100);
      await this.start();
      
      Toast.info(`Câmera ${this.currentFacingMode === 'environment' ? 'traseira' : 'frontal'} ativada`);
      
      return true;
      
    } catch (error) {
      console.error('Error flipping camera:', error);
      Toast.error('Erro ao alternar câmera');
      return false;
    }
  }
  
  /**
   * Toggle flash/torch
   */
  async toggleFlash() {
    if (!this.isActive || !this.stream) {
      Toast.warning('Inicie a câmera primeiro');
      return false;
    }
    
    try {
      const track = this.stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      
      if (!capabilities.torch) {
        Toast.warning('Flash não disponível neste dispositivo');
        return false;
      }
      
      const settings = track.getSettings();
      const newTorchState = !settings.torch;
      
      await track.applyConstraints({
        advanced: [{ torch: newTorchState }]
      });
      
      // Update UI
      this.updateFlashButton(newTorchState);
      
      Toast.info(`Flash ${newTorchState ? 'ligado' : 'desligado'}`);
      
      return true;
      
    } catch (error) {
      console.error('Error toggling flash:', error);
      Toast.error('Erro ao controlar flash');
      return false;
    }
  }
  
  /**
   * Set camera quality
   */
  setQuality(quality) {
    const qualitySettings = CAMERA_SETTINGS.quality[quality];
    if (!qualitySettings) {
      console.warn(`Invalid quality setting: ${quality}`);
      return false;
    }
    
    // Update constraints
    this.constraints.video = {
      ...this.constraints.video,
      ...qualitySettings
    };
    
    // Restart camera if active
    if (this.isActive) {
      this.restart();
    }
    
    return true;
  }
  
  /**
   * Restart camera
   */
  async restart() {
    if (this.isActive) {
      await this.stop();
      await AsyncUtils.sleep(100);
      await this.start();
    }
  }
  
  /**
   * Get current camera ID
   */
  getCurrentCameraId() {
    if (!this.stream) return null;
    
    const track = this.stream.getVideoTracks()[0];
    return track ? track.getSettings().deviceId : null;
  }
  
  /**
   * Switch to specific camera
   */
  async switchCamera(deviceId) {
    if (!deviceId) return false;
    
    try {
      // Update constraints
      this.constraints.video.deviceId = { exact: deviceId };
      
      // Restart camera
      await this.restart();
      
      return true;
      
    } catch (error) {
      console.error('Error switching camera:', error);
      Toast.error('Erro ao trocar câmera');
      return false;
    }
  }
  
  /**
   * Update UI elements
   */
  updateUI() {
    // Update button states
    if (this.startButton) {
      this.startButton.disabled = this.isActive;
    }
    
    if (this.stopButton) {
      this.stopButton.disabled = !this.isActive;
    }
    
    if (this.captureButton) {
      this.captureButton.disabled = !this.isActive;
    }
    
    if (this.flipButton) {
      this.flipButton.disabled = !this.isActive;
    }
    
    if (this.flashButton) {
      this.flashButton.disabled = !this.isActive;
    }
  }
  
  /**
   * Update camera controls
   */
  updateCameraControls() {
    // Show/hide flip button based on available cameras
    if (this.flipButton) {
      const hasMultipleCameras = this.availableCameras.length > 1;
      this.flipButton.style.display = hasMultipleCameras ? 'flex' : 'none';
    }
  }
  
  /**
   * Update flash button
   */
  updateFlashButton(isOn) {
    if (!this.flashButton) return;
    
    this.flashButton.classList.toggle('active', isOn);
    this.flashButton.title = isOn ? 'Desligar flash' : 'Ligar flash';
  }
  
  /**
   * Get camera info
   */
  getInfo() {
    return {
      isActive: this.isActive,
      currentFacingMode: this.currentFacingMode,
      currentCameraId: this.currentCameraId,
      availableCameras: this.availableCameras,
      constraints: this.constraints,
      videoElement: this.video,
      canvasElement: this.canvas
    };
  }
  
  /**
   * Get camera capabilities
   */
  getCapabilities() {
    if (!this.stream) return null;
    
    const track = this.stream.getVideoTracks()[0];
    return track ? track.getCapabilities() : null;
  }
  
  /**
   * Get camera settings
   */
  getSettings() {
    if (!this.stream) return null;
    
    const track = this.stream.getVideoTracks()[0];
    return track ? track.getSettings() : null;
  }
  
  /**
   * Check if camera is supported
   */
  static isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
  
  /**
   * Request camera permissions
   */
  static async requestPermissions() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.warn('Camera permission denied:', error);
      return false;
    }
  }
  
  /**
   * Trigger custom event
   */
  triggerEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, {
      detail: { ...detail, camera: this },
      bubbles: true
    });
    
    document.dispatchEvent(event);
  }
  
  /**
   * Cleanup resources
   */
  destroy() {
    this.stop();
    
    // Remove event listeners
    // (In a real implementation, you'd store and remove specific listeners)
    
    // Clear references
    this.video = null;
    this.canvas = null;
    this.context = null;
  }
}

/**
 * Camera Utility Functions
 */
export const Camera = {
  manager: null,
  
  /**
   * Initialize camera system
   */
  init() {
    if (!this.manager) {
      this.manager = new CameraManager();
    }
    return this.manager;
  },
  
  /**
   * Start camera
   */
  start() {
    return this.init().start();
  },
  
  /**
   * Stop camera
   */
  stop() {
    return this.init().stop();
  },
  
  /**
   * Capture photo
   */
  capture() {
    return this.init().capture();
  },
  
  /**
   * Flip camera
   */
  flip() {
    return this.init().flipCamera();
  },
  
  /**
   * Toggle flash
   */
  toggleFlash() {
    return this.init().toggleFlash();
  },
  
  /**
   * Set quality
   */
  setQuality(quality) {
    return this.init().setQuality(quality);
  },
  
  /**
   * Get camera info
   */
  getInfo() {
    return this.init().getInfo();
  },
  
  /**
   * Check if supported
   */
  isSupported() {
    return CameraManager.isSupported();
  },
  
  /**
   * Request permissions
   */
  requestPermissions() {
    return CameraManager.requestPermissions();
  },
  
  /**
   * Listen for camera events
   */
  on(eventName, callback) {
    document.addEventListener(eventName, callback);
    return () => document.removeEventListener(eventName, callback);
  }
};

// Auto-initialize on import
Camera.init();

// Export classes and utilities
export { CameraManager };
export default Camera;

