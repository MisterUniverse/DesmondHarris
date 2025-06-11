/**
 * Media Loader module
 * Handles loading and displaying images, videos, and streams
 */

class MediaLoader {
    constructor() {
      // Initialize properties
      this.mediaList = [];
      this.currentMediaIndex = -1;
      
      // DOM elements
      this.canvasContainer = document.getElementById('canvas-container');
      this.mainCanvas = document.getElementById('main-canvas');
      this.videoElement = document.getElementById('video-element');
      this.loadingIndicator = document.getElementById('loading');
      
      // Media info elements
      this.mediaDimensions = document.getElementById('media-dimensions');
      this.mediaSize = document.getElementById('media-size');
      this.mediaType = document.getElementById('media-type');
      
      // Media list container
      this.mediaListContainer = document.getElementById('media-list');
      
      // File input for loading local files
      this.fileInput = document.getElementById('file-input');
      
      // Use arrow functions instead of bind
      this.fileInput.addEventListener('change', (e) => this.handleFileInputChange(e));
    }
    
    /**
     * Show loading indicator
     */
    showLoading(show = true) {
      this.loadingIndicator.style.display = show ? 'block' : 'none';
    }
    
    /**
     * Handle file input change event
     */
    handleFileInputChange(event) {
      const files = event.target.files;
      if (!files || files.length === 0) return;
      
      this.showLoading(true);
      
      // Clear previous media list if this is a new selection
      if (this.mediaList.length === 0) {
        this.mediaList = [];
        this.currentMediaIndex = -1;
      }
      
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const mediaType = file.type.startsWith('image/') ? 'image' : 
                        file.type.startsWith('video/') ? 'video' : null;
        
        if (!mediaType) continue; // Skip unsupported file types
        
        // Create URL for the file
        const url = URL.createObjectURL(file);
        
        // Add to media list
        this.mediaList.push({
          type: mediaType,
          url: url,
          name: file.name,
          fileSize: file.size,
          fileType: file.type,
          objectUrl: true // Flag to revoke URL when done
        });
      }
      
      // Update the UI
      this.updateMediaList();
      
      // Load the first file if this is a new selection
      if (this.currentMediaIndex === -1 && this.mediaList.length > 0) {
        this.loadMedia(0);
      }
    }
    
    /**
     * Load a URL as an image or video
     */
    loadUrl(url, type = 'auto') {
      this.showLoading(true);
      
      // Detect type if not specified
      if (type === 'auto') {
        // Try to detect from URL extension
        const ext = url.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
          type = 'image';
        } else if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) {
          type = 'video';
        } else {
          // Default to image
          type = 'image';
        }
      }
      
      // Create media object
      const mediaObj = {
        type: type,
        url: url,
        name: url.split('/').pop() || 'Remote Media',
        fileSize: 'Unknown',
        fileType: type === 'image' ? 'image/unknown' : 'video/unknown',
        objectUrl: false
      };
      
      // Add to media list
      this.mediaList.push(mediaObj);
      const index = this.mediaList.length - 1;
      
      // Update the UI
      this.updateMediaList();
      
      // Load the media
      this.loadMedia(index);
    }
    
    /**
     * Load media at specified index
     */
    loadMedia(index) {
      if (index < 0 || index >= this.mediaList.length) return;
      
      this.showLoading(true);
      this.currentMediaIndex = index;
      
      const media = this.mediaList[index];
      
      // Hide both elements initially
      this.mainCanvas.style.display = 'none';
      this.videoElement.style.display = 'none';
      
      // Update active media in list
      this.updateMediaList();
      
      // Load based on type
      if (media.type === 'image') {
        this.loadImage(media);
      } else if (media.type === 'video') {
        this.loadVideo(media);
      }
    }
    
    /**
     * Load an image
     */
    loadImage(media) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // Store dimensions
        media.width = img.width;
        media.height = img.height;
        
        // Update canvas size to match image
        this.resizeCanvasToFit(img.width, img.height);
        
        // Draw image to canvas
        const ctx = this.mainCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
        ctx.drawImage(img, 0, 0, this.mainCanvas.width, this.mainCanvas.height);
        
        // Show canvas
        this.mainCanvas.style.display = 'block';
        
        // Update media info
        this.updateMediaInfo(media);
        
        // Hide loading indicator
        this.showLoading(false);
        
        // Trigger event for listeners
        const event = new CustomEvent('mediaLoaded', {
          detail: {
            type: 'image',
            width: img.width,
            height: img.height,
            element: this.mainCanvas
          }
        });
        document.dispatchEvent(event);
      };
      
      img.onerror = () => {
        console.error('Failed to load image:', media.url);
        this.showLoading(false);
        alert('Failed to load image');
      };
      
      img.src = media.url;
    }

    /**
     * Load a default image
     * @param {string} url - URL of the default image to load
     */
    loadDefaultImage(url) {
      console.log('Loading default image:', url);
      
      // Show loading indicator
      this.showLoading(true);
      
      // Load the URL (reusing our existing method)
      this.loadUrl(url, 'image');
    }
    
    /**
     * Load a video
     */
    loadVideo(media) {
      this.videoElement.src = media.url;
      this.videoElement.onloadedmetadata = () => {
        // Store dimensions
        media.width = this.videoElement.videoWidth;
        media.height = this.videoElement.videoHeight;
        
        // Update video element size
        this.resizeVideoToFit();
        
        // Show video element
        this.videoElement.style.display = 'block';
        
        // Update media info
        this.updateMediaInfo(media);
        
        // Hide loading indicator
        this.showLoading(false);
        
        // Trigger event for listeners
        const event = new CustomEvent('mediaLoaded', {
          detail: {
            type: 'video',
            width: this.videoElement.videoWidth,
            height: this.videoElement.videoHeight,
            element: this.videoElement
          }
        });
        document.dispatchEvent(event);
      };
      
      this.videoElement.onerror = () => {
        console.error('Failed to load video:', media.url);
        this.showLoading(false);
        alert('Failed to load video');
      };
    }
    
    /**
     * Resize canvas to fit container while maintaining aspect ratio
     */
    resizeCanvasToFit(width, height) {
      const container = this.canvasContainer;
      const maxWidth = container.clientWidth;
      const maxHeight = container.clientHeight;
      
      let canvasWidth, canvasHeight;
      
      // Calculate aspect ratios
      const imageRatio = width / height;
      const containerRatio = maxWidth / maxHeight;
      
      if (imageRatio > containerRatio) {
        // Image is wider than container (relative to height)
        canvasWidth = Math.min(maxWidth, width);
        canvasHeight = canvasWidth / imageRatio;
      } else {
        // Image is taller than container (relative to width)
        canvasHeight = Math.min(maxHeight, height);
        canvasWidth = canvasHeight * imageRatio;
      }
      
      // Round to whole pixels
      this.mainCanvas.width = Math.floor(canvasWidth);
      this.mainCanvas.height = Math.floor(canvasHeight);
    }
    
    /**
     * Resize video element to fit container while maintaining aspect ratio
     */
    resizeVideoToFit() {
      const container = this.canvasContainer;
      const maxWidth = container.clientWidth;
      const maxHeight = container.clientHeight;
      
      const videoWidth = this.videoElement.videoWidth;
      const videoHeight = this.videoElement.videoHeight;
      
      let width, height;
      
      // Calculate aspect ratios
      const videoRatio = videoWidth / videoHeight;
      const containerRatio = maxWidth / maxHeight;
      
      if (videoRatio > containerRatio) {
        // Video is wider than container (relative to height)
        width = Math.min(maxWidth, videoWidth);
        height = width / videoRatio;
      } else {
        // Video is taller than container (relative to width)
        height = Math.min(maxHeight, videoHeight);
        width = height * videoRatio;
      }
      
      // Set video element size
      this.videoElement.style.width = `${Math.floor(width)}px`;
      this.videoElement.style.height = `${Math.floor(height)}px`;
    }
    
    /**
     * Update media info in sidebar
     */
    updateMediaInfo(media) {
      if (!media) {
        this.mediaDimensions.textContent = '--';
        this.mediaSize.textContent = '--';
        this.mediaType.textContent = '--';
        return;
      }
      
      this.mediaDimensions.textContent = `${media.width} × ${media.height}`;
      this.mediaSize.textContent = media.fileSize === 'Unknown' ? 
                                  'Unknown' : this.formatFileSize(media.fileSize);
      this.mediaType.textContent = media.fileType;
    }
    
    /**
     * Update media list in sidebar
     */
    updateMediaList() {
      // Clear container
      this.mediaListContainer.innerHTML = '';
      
      if (this.mediaList.length === 0) {
        const emptyList = document.createElement('div');
        emptyList.className = 'empty-list';
        emptyList.textContent = 'No media loaded';
        this.mediaListContainer.appendChild(emptyList);
        return;
      }
      
      // Add each media item
      this.mediaList.forEach((media, index) => {
        const item = document.createElement('div');
        item.className = 'media-item';
        if (index === this.currentMediaIndex) {
          item.classList.add('active');
        }
        
        const icon = media.type === 'image' ? '🖼️' : '🎬';
        
        item.innerHTML = `
          <div class="media-item-icon">${icon}</div>
          <div class="media-item-name">${media.name}</div>
        `;
        
        // Add click event to load this media
        item.addEventListener('click', () => {
          this.loadMedia(index);
        });
        
        this.mediaListContainer.appendChild(item);
      });
    }
    
    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
      if (bytes < 1024) {
        return bytes + ' bytes';
      } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + ' KB';
      } else {
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
      }
    }
    
    /**
     * Open the file browser
     */
    openFileBrowser(accept = 'image/*,video/*') {
      this.fileInput.accept = accept;
      this.fileInput.click();
    }
    
    /**
     * Clear all loaded media
     */
    clearMedia() {
      // Revoke any object URLs to prevent memory leaks
      this.mediaList.forEach(media => {
        if (media.objectUrl) {
          URL.revokeObjectURL(media.url);
        }
      });
      
      // Clear the list
      this.mediaList = [];
      this.currentMediaIndex = -1;
      
      // Clear the canvas
      const ctx = this.mainCanvas.getContext('2d');
      ctx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
      
      // Hide media elements
      this.mainCanvas.style.display = 'none';
      this.videoElement.style.display = 'none';
      
      // Update media info
      this.updateMediaInfo(null);
      
      // Update media list
      this.updateMediaList();
    }
    
    /**
     * Get the current media element (canvas or video)
     */
    getCurrentMediaElement() {
      if (this.currentMediaIndex === -1) return null;
      
      const media = this.mediaList[this.currentMediaIndex];
      if (!media) return null;
      
      return media.type === 'image' ? this.mainCanvas : this.videoElement;
    }
    
    /**
     * Get the current media dimensions
     */
    getCurrentMediaDimensions() {
      if (this.currentMediaIndex === -1) return null;
      
      const media = this.mediaList[this.currentMediaIndex];
      if (!media) return null;
      
      return {
        width: media.width,
        height: media.height
      };
    }
  }
  
  // Export as global
  window.mediaLoader = new MediaLoader();