/**
 * Main application entry point
 * Coordinates components and handles UI interactions
 */

class App {
    constructor() {
      // DOM elements
      this.appTitle = document.getElementById('app-title');
      this.sidebar = document.getElementById('sidebar');
      this.closeSidebarBtn = document.getElementById('close-sidebar');
      this.sidebarOverlay = document.getElementById('sidebar-overlay');
      this.loadMediaBtn = document.getElementById('load-media');
      this.loadImageBtn = document.getElementById('load-image');
      this.loadVideoBtn = document.getElementById('load-video');
      this.loadStreamBtn = document.getElementById('load-stream');
      this.fullscreenBtn = document.getElementById('fullscreen-btn');
      this.canvasContainer = document.getElementById('canvas-container');
      
      // Component references
      this.mediaLoader = window.mediaLoader;
      
      // Initialize app
      this.init();
    }
    
    /**
     * Initialize the application
     */
    init() {
      // Setup sidebar
      this.initSidebar();
      
      // Set up media loading buttons
      this.initMediaLoaders();
      
      // Setup fullscreen button
      this.initFullscreen();
      
      // Set up keyboard shortcuts
      this.initKeyboardShortcuts();

      setTimeout(() => {
        if (this.mediaLoader && typeof this.mediaLoader.loadDefaultImage === 'function') {
          this.mediaLoader.loadDefaultImage('https://picsum.photos/1024/768');
        } else {
          console.error('MediaLoader or loadDefaultImage method not available');
        }
      }, 500);
      
      console.log('Media Viewer application initialized');
    }
    
    /**
     * Initialize sidebar functionality
     */
    initSidebar() {
      // Toggle sidebar when clicking app title
      this.appTitle.addEventListener('click', () => {
        this.toggleSidebar(true);
      });
      
      // Close sidebar when clicking close button
      this.closeSidebarBtn.addEventListener('click', () => {
        this.toggleSidebar(false);
      });
      
      // Close sidebar when clicking overlay
      this.sidebarOverlay.addEventListener('click', () => {
        this.toggleSidebar(false);
      });
    }
    
    /**
     * Toggle sidebar visibility
     */
    toggleSidebar(show) {
      if (show) {
        this.sidebar.classList.add('active');
        this.sidebarOverlay.classList.add('active');
      } else {
        this.sidebar.classList.remove('active');
        this.sidebarOverlay.classList.remove('active');
      }
    }
    
    /**
     * Initialize media loading buttons
     */
    initMediaLoaders() {
      // Main load media button in header
      this.loadMediaBtn.addEventListener('click', () => {
        this.toggleSidebar(true);
      });
      
      // Load image button in sidebar
      this.loadImageBtn.addEventListener('click', () => {
        this.mediaLoader.openFileBrowser('image/*');
        this.toggleSidebar(false);
      });
      
      // Load video button in sidebar
      this.loadVideoBtn.addEventListener('click', () => {
        this.mediaLoader.openFileBrowser('video/*');
        this.toggleSidebar(false);
      });
      
      // Load stream button in sidebar
      this.loadStreamBtn.addEventListener('click', () => {
        this.promptStreamUrl();
        this.toggleSidebar(false);
      });
    }
    
    /**
     * Prompt user for stream URL
     */
    promptStreamUrl() {
      const url = prompt('Enter stream URL:');
      if (url) {
        this.mediaLoader.loadUrl(url, 'video');
      }
    }
    
    /**
     * Initialize fullscreen functionality
     */
    initFullscreen() {
      // Toggle fullscreen when clicking fullscreen button
      this.fullscreenBtn.addEventListener('click', () => {
        this.toggleFullscreen();
      });
      
      // Listen for fullscreen change events
      document.addEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
      document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange.bind(this));
      document.addEventListener('mozfullscreenchange', this.handleFullscreenChange.bind(this));
      document.addEventListener('MSFullscreenChange', this.handleFullscreenChange.bind(this));
    }
    
    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
      if (!document.fullscreenElement && 
          !document.mozFullScreenElement && 
          !document.webkitFullscreenElement && 
          !document.msFullscreenElement) {
        // Enter fullscreen
        if (this.canvasContainer.requestFullscreen) {
          this.canvasContainer.requestFullscreen();
        } else if (this.canvasContainer.msRequestFullscreen) {
          this.canvasContainer.msRequestFullscreen();
        } else if (this.canvasContainer.mozRequestFullScreen) {
          this.canvasContainer.mozRequestFullScreen();
        } else if (this.canvasContainer.webkitRequestFullscreen) {
          this.canvasContainer.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
        document.body.classList.add('fullscreen');
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
        document.body.classList.remove('fullscreen');
      }
    }
    
    /**
     * Handle fullscreen change events
     */
    handleFullscreenChange() {
      if (!document.fullscreenElement && 
          !document.mozFullScreenElement && 
          !document.webkitFullscreenElement && 
          !document.msFullscreenElement) {
        // Exited fullscreen
        document.body.classList.remove('fullscreen');
      } else {
        // Entered fullscreen
        document.body.classList.add('fullscreen');
      }
      
      // Update annotation canvas if needed
      if (window.roiTools) {
        const mediaElement = this.mediaLoader.getCurrentMediaElement();
        if (mediaElement) {
          setTimeout(() => {
            window.roiTools.updateCanvasSize(mediaElement);
          }, 100);
        }
      }
    }
    
    /**
     * Initialize keyboard shortcuts
     */
    initKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        // ESC key to exit fullscreen
        if (e.key === 'Escape' && document.fullscreenElement) {
          this.toggleFullscreen();
        }
        
        // Delete key to delete selected annotations
        if ((e.key === 'Delete' || e.key === 'Backspace') && window.roiTools) {
          window.roiTools.deleteSelected();
        }
        
        // Ctrl+O to open file browser
        if (e.key === 'o' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          this.mediaLoader.openFileBrowser();
        }
        
        // F1 to toggle sidebar
        if (e.key === 'F1') {
          e.preventDefault();
          this.toggleSidebar(!this.sidebar.classList.contains('active'));
        }
      });
    }
  }
  
  // Initialize the application when the DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
  });