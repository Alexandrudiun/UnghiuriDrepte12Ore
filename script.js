const hourHand = document.getElementById('hour-hand');
const minuteHand = document.getElementById('minute-hand');
const message = document.getElementById('message');
const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const angleLog = document.getElementById('angle-log');
const angleCountDisplay = document.getElementById('angle-count');

class AnimatedClock {
  constructor() {
    this.hourAngle = 0;
    this.minuteAngle = 0;
    this.speed = 0.5;
    this.isAnimating = false;
    this.animationFrameId = null;
    this.rightAngleHistory = new Set();
    this.totalRightAngles = 0;
    this.expectedRightAngles = 22;
    this.lastRightAngleTime = null;
    this.wasRightAngle = false;

    this.bindEvents();
    this.updateHandPositions();
    
  }

  bindEvents() {
    speedSlider.addEventListener('input', () => this.updateSpeed());
    startButton.addEventListener('click', () => this.toggleAnimation());
    stopButton.addEventListener('click', () => this.resetClock());
  }

  updateSpeed() {
    this.speed = parseFloat(speedSlider.value) / 10;
    speedValue.textContent = `${this.speed.toFixed(1)}x`;
  }

  toggleAnimation() {
    this.isAnimating ? this.stopAnimation() : this.startAnimation();
  }

  startAnimation() {
    if (!this.isAnimating) {
      this.isAnimating = true;
      startButton.textContent = 'Pause';
      this.rotateHands();
    }
  }

  stopAnimation() {
    if (this.isAnimating) {
      this.isAnimating = false;
      startButton.textContent = 'Start';
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
    }
  }

  resetClock() {
    this.stopAnimation();
    // Explicitly start at 12:00
    this.hourAngle = 0;   // 12 o'clock position
    this.minuteAngle = 0; // 12 o'clock position
    this.totalRightAngles = 0;
    this.updateHandPositions();
    message.textContent = '';
    angleLog.innerHTML = '';
    this.rightAngleHistory.clear();
    this.lastRightAngleTime = null;
    this.wasRightAngle = false;
    this.updateAngleCount();
  }

  updateHandPositions() {
    hourHand.style.transform = `rotate(${this.hourAngle}deg)`;
    minuteHand.style.transform = `rotate(${this.minuteAngle}deg)`;
  }

  rotateHands() {
    if (!this.isAnimating) return;
  
    // More precise rotation
    this.hourAngle += (this.speed / 12);
    this.minuteAngle += this.speed;
  
    // Ensure angles stay within 0-360 range
    this.hourAngle %= 360;
    this.minuteAngle %= 360;
  
    // Update hand positions
    this.updateHandPositions();
  
    // Check for right angle
    this.checkRightAngle();
  
    // Continue animation
    this.animationFrameId = requestAnimationFrame(() => this.rotateHands());
  }
  

  calculateAngleDifference() {
    const hourPos = this.hourAngle;
    const minutePos = this.minuteAngle;
    let angleDiff = Math.abs(minutePos - hourPos);
    
    // Always get the smaller angle
    if (angleDiff > 180) {
      angleDiff = 360 - angleDiff;
    }
    
    return angleDiff;
  }

  checkRightAngle() {
    const angleDifference = this.calculateAngleDifference();
    const isNearRightAngle = Math.abs(angleDifference - 90) < 0.5;
  
    if (isNearRightAngle && !this.wasRightAngle) {
      const currentTime = this.formatTime();
      const angleKey = `${currentTime}`;
  
      // Detailed logging for debugging
      console.log(`Right Angle Detection Details:
        Hour Angle: ${this.hourAngle.toFixed(2)}°
        Minute Angle: ${this.minuteAngle.toFixed(2)}°
        Angle Difference: ${angleDifference.toFixed(2)}°
        Current Time: ${currentTime}`);
  
      if (!this.rightAngleHistory.has(angleKey)) {
        this.logRightAngle(currentTime);
        this.rightAngleHistory.add(angleKey);
        this.totalRightAngles++;
        this.updateAngleCount();
        
        this.wasRightAngle = true;
      }
    } 
    else if (!isNearRightAngle) {
      this.wasRightAngle = false;
    }
  }

  updateAngleCount() {
    angleCountDisplay.textContent = `Unghiuri drepte pentru 12 ore: ${this.totalRightAngles}/${this.expectedRightAngles}`;

    // Highlight if target is reached
    if (this.totalRightAngles === this.expectedRightAngles) {
      angleCountDisplay.style.color = 'lime';
      message.textContent = 'Toate unghiurile drepte intr-un interval de 12 ore au fost gasite!';
      message.style.color = 'lime';
      this.stopAnimation();
    } else {
      angleCountDisplay.style.color = 'white';
    }
  }

  logRightAngle(time) {
    // Create log entry
    const logEntry = document.createElement('div');
    logEntry.textContent = `Unghi drept ${this.totalRightAngles + 1} la ora ${time}`;

    // Insert at the top of the log
    angleLog.insertBefore(logEntry, angleLog.firstChild);

    // Show temporary message
    message.textContent = `Unghi drept la ora: ${time}`;
    message.style.color = 'lime';

    setTimeout(() => {
      message.textContent = '';
      message.style.color = 'white';
    }, 1500);

    // Limit total log entries
    if (angleLog.children.length > 50) {
      angleLog.removeChild(angleLog.lastChild);
    }
  }
  formatTime() {
    // More precise time calculation
    const normalizedHourAngle = this.hourAngle % 360;
    const normalizedMinuteAngle = this.minuteAngle % 360;
  
    const hours = Math.floor(normalizedHourAngle / 30);
    const minutes = Math.floor(normalizedMinuteAngle / 6);
    
    const displayHours = hours === 0 ? 12 : hours;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${displayHours.toString().padStart(2, '0')}:${displayMinutes}`;
  }
}

// Initialize the clock
const clock = new AnimatedClock();
