/**
 * ROI Tools module
 * Handles annotation and ROI drawing functionality using Fabric.js
 */

class ROITools {
    constructor(mediaLoader) {
      // Store reference to media loader
      this.mediaLoader = mediaLoader;
      
      // DOM elements
      this.canvasContainer = document.getElementById('canvas-container');
      this.toolbar = document.getElementById('annotation-toolbar');
      
      // Fabric canvas
      this.fabricCanvas = null;
      
      // Active tool
      this.activeTool = 'select';
      
      // Drawing state
      this.isDrawing = false;
      this.startPoint = null;
      this.tempObject = null;
      
      // For polygon/polyline drawing
      this.points = [];
      this.lines = [];
      this.activeShape = false;
      
      // For freehand drawing
      this.freehandPath = null;
      
      // ROI styles
      this.roiStyles = {
        fill: 'rgba(0, 212, 255, 0.2)',
        stroke: '#00d4ff',
        strokeWidth: 2,
        selectable: true,
        cornerColor: 'rgba(0, 212, 255, 0.5)',
        cornerSize: 8,
        transparentCorners: false
      };
      
      // Initialize
      this.init();
    }
    
    /**
     * Initialize ROI tools
     */
    init() {
      // Setup toolbar
      this.setupToolbar();
      
      // Listen for media loaded event
      document.addEventListener('mediaLoaded', this.handleMediaLoaded.bind(this));
      
      // Setup window resize handler
      window.addEventListener('resize', this.handleResize.bind(this));
    }
    
    /**
     * Handle media loaded event
     */
    handleMediaLoaded(event) {
      const { type, width, height, element } = event.detail;
      
      // Initialize or reinitialize Fabric canvas
      this.setupFabricCanvas(element, width, height, type);

      // Make sure selection tool is active by default
      this.setActiveTool('select');
    
      // Make all objects selectable (for any existing objects that might get reloaded)
      this.makeAllObjectsSelectable();
    }
    
    /**
     * Setup Fabric.js canvas
     */
    setupFabricCanvas(mediaElement, width, height, mediaType) {
      // If we already have a canvas, destroy it
      if (this.fabricCanvas) {
        this.fabricCanvas.dispose();
      }
      
      // Create a new Fabric canvas element
      const canvasElement = document.createElement('canvas');
      canvasElement.id = 'annotation-canvas';
      
      // Create container div for Fabric canvas
      const fabricContainer = document.createElement('div');
      fabricContainer.className = 'fabric-container';
      fabricContainer.style.position = 'absolute';
      fabricContainer.style.top = '0';
      fabricContainer.style.left = '0';
      fabricContainer.style.width = '100%';
      fabricContainer.style.height = '100%';
      fabricContainer.style.pointerEvents = 'none';
      fabricContainer.style.zIndex = '10';
      
      // Add to DOM
      fabricContainer.appendChild(canvasElement);
      this.canvasContainer.appendChild(fabricContainer);
      
      // Initialize Fabric canvas
      this.fabricCanvas = new fabric.Canvas('annotation-canvas', {
        selection: true,
        preserveObjectStacking: true
      });
      
      // Make sure fabric canvas elements have proper pointer events
      this.fabricCanvas.wrapperEl.style.pointerEvents = 'auto';
      
      // Match dimensions and position to media element
      this.updateCanvasSize(mediaElement, width, height);
      
      // Set up event handlers
      this.setupFabricEvents();
      
      // If this is a video, we need to update on frame changes
      if (mediaType === 'video') {
        mediaElement.addEventListener('play', () => {
          const updatePosition = () => {
            if (!mediaElement.paused && !mediaElement.ended) {
              this.updateCanvasSize(mediaElement);
              requestAnimationFrame(updatePosition);
            }
          };
          updatePosition();
        });
      }
    }
    
    /**
     * Update canvas size to match media element
     */
    updateCanvasSize(mediaElement, width, height) {
      if (!this.fabricCanvas) return;
      
      // Get media element dimensions
      const mediaRect = mediaElement.getBoundingClientRect();
      const containerRect = this.canvasContainer.getBoundingClientRect();
      
      // Set dimensions of Fabric canvas
      let canvasWidth, canvasHeight;
      
      if (width && height) {
        // Use provided dimensions (original media dimensions)
        canvasWidth = mediaRect.width;
        canvasHeight = mediaRect.height;
      } else {
        // Use current element dimensions
        canvasWidth = mediaElement.offsetWidth || mediaElement.width;
        canvasHeight = mediaElement.offsetHeight || mediaElement.height;
      }
      
      this.fabricCanvas.setWidth(canvasWidth);
      this.fabricCanvas.setHeight(canvasHeight);
      
      // Position Fabric canvas to match media element
      const offsetLeft = mediaRect.left - containerRect.left;
      const offsetTop = mediaRect.top - containerRect.top;
      
      this.fabricCanvas.wrapperEl.style.position = 'absolute';
      this.fabricCanvas.wrapperEl.style.left = `${offsetLeft}px`;
      this.fabricCanvas.wrapperEl.style.top = `${offsetTop}px`;
      
      // Render to update
      this.fabricCanvas.renderAll();
    }
    
    /**
     * Setup Fabric canvas event handlers
     */
    setupFabricEvents() {
      // Mouse down - start drawing
      this.fabricCanvas.on('mouse:down', (opt) => {
        // If in select mode and clicked on object, let Fabric handle it
        if (this.activeTool === 'select' && opt.target) {
          return;
        }
        
        // Get pointer coordinates
        const pointer = this.fabricCanvas.getPointer(opt.e);
        
        // Start drawing based on active tool
        if (this.activeTool !== 'select' && !this.isDrawing) {
          if (this.activeTool === 'polyline') {
            this.addPoint(pointer);
          } else if (this.activeTool === 'freehand') {
            this.startFreehandDrawing(pointer);
          } else if (this.activeTool === 'eraser') {
            this.handleEraserDown(opt);
          } else {
            this.startDrawing(pointer);
          }
        }
      });
      
      // Mouse move - continue drawing
      this.fabricCanvas.on('mouse:move', (opt) => {
        if (!this.isDrawing && this.activeTool !== 'polyline' && this.activeTool !== 'eraser') return;
        
        const pointer = this.fabricCanvas.getPointer(opt.e);
        
        if (this.activeTool === 'polyline' && this.points.length > 0) {
          // Update the last line endpoint
          this.updatePolylinePreview(pointer);
        } else if (this.activeTool === 'freehand' && this.isDrawing) {
          this.continueFreehandDrawing(pointer);
        } else if (this.activeTool === 'eraser') {
          this.handleEraserMove(opt);
        } else if (this.isDrawing) {
          this.continueDrawing(pointer);
        }
      });
      
      // Mouse up - finish drawing
      this.fabricCanvas.on('mouse:up', () => {
        if (this.activeTool === 'polyline') {
          return; // Don't finish drawing for polyline on mouse up
        } else if (this.activeTool === 'freehand' && this.isDrawing) {
          this.finishFreehandDrawing();
        } else if (this.activeTool === 'eraser') {
          this.handleEraserUp();
        } else if (this.isDrawing) {
          this.finishDrawing();
        }
      });
      
      // Set up boundary constraints for objects
      this.setupBoundaryConstraints();
      
      // Double click to finish polyline
      this.fabricCanvas.on('mouse:dblclick', () => {
        if (this.activeTool === 'polyline' && this.points.length >= 3) {
          this.finishPolyline();
        }
      });
    }
    
    /**
     * Setup boundary constraints for objects
     */
    setupBoundaryConstraints() {
      // Prevent objects from moving outside canvas
      this.fabricCanvas.on('object:moving', (e) => {
        const obj = e.target;
        const objBounds = obj.getBoundingRect();
        
        // Get canvas dimensions
        const canvasWidth = this.fabricCanvas.getWidth();
        const canvasHeight = this.fabricCanvas.getHeight();
        
        // Constrain horizontally
        if (objBounds.left < 0) {
          obj.left += Math.abs(objBounds.left);
        } else if (objBounds.left + objBounds.width > canvasWidth) {
          obj.left -= (objBounds.left + objBounds.width) - canvasWidth;
        }
        
        // Constrain vertically
        if (objBounds.top < 0) {
          obj.top += Math.abs(objBounds.top);
        } else if (objBounds.top + objBounds.height > canvasHeight) {
          obj.top -= (objBounds.top + objBounds.height) - canvasHeight;
        }
        
        obj.setCoords();
      });
      
      // Similar constraints for scaling and rotating
      this.fabricCanvas.on('object:scaling', (e) => {
        const obj = e.target;
        obj.setCoords();
        
        const objBounds = obj.getBoundingRect();
        const canvasWidth = this.fabricCanvas.getWidth();
        const canvasHeight = this.fabricCanvas.getHeight();
        
        // If object is now outside canvas, scale it down
        if (objBounds.left < 0 || 
            objBounds.top < 0 || 
            objBounds.left + objBounds.width > canvasWidth || 
            objBounds.top + objBounds.height > canvasHeight) {
          
          // Undo the scaling
          obj.scaleX = obj._previousScaleX || obj.scaleX;
          obj.scaleY = obj._previousScaleY || obj.scaleY;
          obj.setCoords();
        } else {
          // Store current scale for next comparison
          obj._previousScaleX = obj.scaleX;
          obj._previousScaleY = obj.scaleY;
        }
      });
    }
    
    /**
     * Setup annotation toolbar
     */
    setupToolbar() {
      const buttons = this.toolbar.querySelectorAll('.tool-button');
      
      buttons.forEach(button => {
        const tool = button.getAttribute('data-tool');
        
        button.addEventListener('click', () => {
          if (tool === 'delete') {
            this.deleteSelected();
          } else if (tool === 'finish') {
            if (this.activeTool === 'polyline') {
              this.finishPolyline();
            }
          } else {
            this.setActiveTool(tool);
          }
        });
      });
      
      // Set default tool (select)
      this.setActiveTool('select');
    }
    
    /**
     * Set the active drawing tool
     */
    setActiveTool(tool) {
        // If switching from polyline, clean up
        if (this.activeTool === 'polyline' && tool !== 'polyline') {
            this.cancelPolyline();
            }
            
            // Update active tool
            this.activeTool = tool;
            
            // Update toolbar UI
            const buttons = this.toolbar.querySelectorAll('.tool-button');
            buttons.forEach(button => {
            const buttonTool = button.getAttribute('data-tool');
            if (buttonTool === tool) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
            });
            
            // Show/hide finish button for polyline
            const finishButton = this.toolbar.querySelector('[data-tool="finish"]');
            if (finishButton) {
            finishButton.style.display = (tool === 'polyline') ? 'block' : 'none';
            }
            
            // Update cursor and selection state
            if (this.fabricCanvas) {
            if (tool === 'select') {
                this.fabricCanvas.defaultCursor = 'default';
                this.fabricCanvas.selection = true;
                
                // Make all objects selectable and interactive
                this.fabricCanvas.forEachObject(obj => {
                obj.selectable = true;
                obj.evented = true;
                obj.lockMovementX = false;
                obj.lockMovementY = false;
                });
                
                // Force a render to apply changes
                this.fabricCanvas.requestRenderAll();
            } else {
                this.fabricCanvas.defaultCursor = 'crosshair';
                this.fabricCanvas.selection = false;
                
                // Make objects non-selectable during drawing
                this.fabricCanvas.forEachObject(obj => {
                obj.selectable = false;
                obj.evented = false;
                });
                
                // Clear current selection
                this.fabricCanvas.discardActiveObject();
                this.fabricCanvas.requestRenderAll();
            }
        }
    }
    
    /**
     * Start drawing a shape
     */
    startDrawing(pointer) {
      this.isDrawing = true;
      this.startPoint = pointer;
      
      switch (this.activeTool) {
        case 'rectangle':
          this.tempObject = new fabric.Rect({
            left: pointer.x,
            top: pointer.y,
            width: 0,
            height: 0,
            ...this.roiStyles,
            selectable: false
          });
          break;
          
        case 'ellipse':
          this.tempObject = new fabric.Ellipse({
            left: pointer.x,
            top: pointer.y,
            rx: 0,
            ry: 0,
            ...this.roiStyles,
            selectable: false
          });
          break;
          
        case 'line':
          this.tempObject = new fabric.Line([
            pointer.x, pointer.y, pointer.x, pointer.y
          ], {
            ...this.roiStyles,
            fill: null,
            selectable: false
          });
          break;
          
        case 'spot':
          // For spots, create directly and finish
          const spot = new fabric.Circle({
            left: pointer.x - 5,
            top: pointer.y - 5,
            radius: 5,
            ...this.roiStyles
          });
          this.fabricCanvas.add(spot);
          this.fabricCanvas.renderAll();
          this.isDrawing = false;
          return;
      }
      
      if (this.tempObject) {
        this.fabricCanvas.add(this.tempObject);
        this.fabricCanvas.renderAll();
      }
    }
    
    /**
     * Continue drawing a shape
     */
    continueDrawing(pointer) {
      if (!this.isDrawing || !this.tempObject) return;
      
      switch (this.activeTool) {
        case 'rectangle':
          const width = pointer.x - this.startPoint.x;
          const height = pointer.y - this.startPoint.y;
          
          // Handle negative dimensions (drawing from bottom-right to top-left)
          const left = width < 0 ? pointer.x : this.startPoint.x;
          const top = height < 0 ? pointer.y : this.startPoint.y;
          
          this.tempObject.set({
            left: left,
            top: top,
            width: Math.abs(width),
            height: Math.abs(height)
          });
          break;
          
        case 'ellipse':
          const rx = Math.abs(pointer.x - this.startPoint.x) / 2;
          const ry = Math.abs(pointer.y - this.startPoint.y) / 2;
          const centerX = (this.startPoint.x + pointer.x) / 2;
          const centerY = (this.startPoint.y + pointer.y) / 2;
          
          this.tempObject.set({
            left: centerX - rx,
            top: centerY - ry,
            rx: rx,
            ry: ry
          });
          break;
          
        case 'line':
          this.tempObject.set({
            x2: pointer.x,
            y2: pointer.y
          });
          break;
      }
      
      this.fabricCanvas.renderAll();
    }
    
    /**
     * Finish drawing a shape
     */
    finishDrawing() {
        if (!this.isDrawing || !this.tempObject) return;
        
        this.isDrawing = false;
        
        // Make object selectable and interactive
        this.tempObject.set({
        selectable: true,
        evented: true,
        lockMovementX: false,
        lockMovementY: false,
        hasControls: true,
        hasBorders: true
        });
        
        // Clean up
        this.tempObject = null;
        this.startPoint = null;
        
        // Switch back to select mode
        this.setActiveTool('select');
    }
    
    /**
     * Add a point to polyline
     */
    addPoint(pointer) {
      // If this is the first point, initialize the array
      if (this.points.length === 0) {
        this.points = [];
        this.lines = [];
      }
      
      // Add point to array
      this.points.push(pointer);
      
      // Add a circle to mark the point
      const point = new fabric.Circle({
        left: pointer.x - 3,
        top: pointer.y - 3,
        radius: 3,
        fill: this.roiStyles.stroke,
        stroke: this.roiStyles.stroke,
        strokeWidth: 1,
        selectable: false,
        evented: false,
        originX: 'center',
        originY: 'center'
      });
      
      this.fabricCanvas.add(point);
      
      // If there are multiple points, connect with a line
      if (this.points.length > 1) {
        const prevPoint = this.points[this.points.length - 2];
        const line = new fabric.Line([
          prevPoint.x, prevPoint.y, pointer.x, pointer.y
        ], {
          stroke: this.roiStyles.stroke,
          strokeWidth: this.roiStyles.strokeWidth,
          selectable: false,
          evented: false
        });
        
        this.fabricCanvas.add(line);
        this.lines.push(line);
      }
      
      // Add or update preview line
      if (this.points.length === 1) {
        // Create preview line for the first point
        this.previewLine = new fabric.Line([
          pointer.x, pointer.y, pointer.x, pointer.y
        ], {
          stroke: this.roiStyles.stroke,
          strokeWidth: this.roiStyles.strokeWidth,
          strokeDashArray: [3, 3],
          selectable: false,
          evented: false
        });
        
        this.fabricCanvas.add(this.previewLine);
      }
      
      // Update preview polygon if we have enough points
      this.updatePolylinePreview();
      
      this.fabricCanvas.renderAll();
    }
    
    /**
     * Update polyline preview during mouse movement
     */
    updatePolylinePreview(pointer) {
      if (this.points.length === 0) return;
      
      // Update the preview line end point
      if (this.previewLine && pointer) {
        const lastPoint = this.points[this.points.length - 1];
        this.previewLine.set({
          x1: lastPoint.x,
          y1: lastPoint.y,
          x2: pointer.x,
          y2: pointer.y
        });
      }
      
      // If we have at least 3 points, show preview polygon
      if (this.points.length >= 3) {
        if (this.activeShape) {
          this.fabricCanvas.remove(this.activeShape);
        }
        
        // Create a polygon shape to preview
        this.activeShape = new fabric.Polyline(this.points, {
          stroke: this.roiStyles.stroke,
          strokeWidth: this.roiStyles.strokeWidth,
          fill: this.roiStyles.fill,
          selectable: false,
          evented: false
        });
        
        this.fabricCanvas.add(this.activeShape);
        this.activeShape.moveTo(0); // Move to back
      }
      
      this.fabricCanvas.renderAll();
    }
    
    /**
     * Finish polyline
     */
    finishPolyline() {
        if (this.points.length < 3) {
        // Need at least 3 points for a polyline
        this.cancelPolyline();
        return;
        }
        
        // Remove preview objects
        if (this.previewLine) {
        this.fabricCanvas.remove(this.previewLine);
        this.previewLine = null;
        }
        
        if (this.activeShape) {
        this.fabricCanvas.remove(this.activeShape);
        this.activeShape = null;
        }
        
        // Remove temporary points and lines
        for (const line of this.lines) {
        this.fabricCanvas.remove(line);
        }
        
        this.fabricCanvas.getObjects().forEach(obj => {
        if (obj.type === 'circle' && obj.radius === 3) {
            this.fabricCanvas.remove(obj);
        }
        });
        
        // Create the final polyline
        const polyline = new fabric.Polyline(this.points, {
        stroke: this.roiStyles.stroke,
        strokeWidth: this.roiStyles.strokeWidth,
        fill: this.roiStyles.fill,
        selectable: true,
        evented: true,
        lockMovementX: false,
        lockMovementY: false,
        hasControls: true,
        hasBorders: true
        });
        
        this.fabricCanvas.add(polyline);
        this.fabricCanvas.setActiveObject(polyline);
        
        // Reset polyline state
        this.points = [];
        this.lines = [];
        
        // Return to select mode
        this.setActiveTool('select');
        
        this.fabricCanvas.renderAll();
    }
    
    /**
     * Cancel polyline drawing
     */
    cancelPolyline() {
      // Remove preview objects
      if (this.previewLine) {
        this.fabricCanvas.remove(this.previewLine);
        this.previewLine = null;
      }
      
      if (this.activeShape) {
        this.fabricCanvas.remove(this.activeShape);
        this.activeShape = null;
      }
      
      // Remove temporary points and lines
      for (const line of this.lines) {
        this.fabricCanvas.remove(line);
      }
      
      this.fabricCanvas.getObjects().forEach(obj => {
        if (obj.type === 'circle' && obj.radius === 3) {
          this.fabricCanvas.remove(obj);
        }
      });
      
      // Reset polyline state
      this.points = [];
      this.lines = [];
      
      this.fabricCanvas.renderAll();
    }
    
    /**
     * Start freehand drawing
     */
    startFreehandDrawing(pointer) {
      this.isDrawing = true;
      
      // Create new path
      this.freehandPath = new fabric.Path(`M ${pointer.x} ${pointer.y}`, {
        stroke: this.roiStyles.stroke,
        strokeWidth: this.roiStyles.strokeWidth,
        fill: null,
        selectable: false,
        evented: false
      });
      
      this.fabricCanvas.add(this.freehandPath);
    }
    
    /**
     * Continue freehand drawing
     */
    continueFreehandDrawing(pointer) {
      if (!this.isDrawing || !this.freehandPath) return;
      
      // Add point to path
      this.freehandPath.path.push(['L', pointer.x, pointer.y]);
      this.fabricCanvas.renderAll();
    }
    
    /**
     * Finish freehand drawing
     */
    finishFreehandDrawing() {
      if (!this.isDrawing || !this.freehandPath) return;
      
      this.isDrawing = false;
      
      // Make path selectable
      this.freehandPath.set({
        selectable: true,
        evented: true
      });
      
      this.freehandPath = null;
      
      // Stay in freehand mode instead of switching to select
    }

    /**
     * Make all objects selectable and movable
     */
    makeAllObjectsSelectable() {
        if (!this.fabricCanvas) return;
        
        this.fabricCanvas.forEachObject(obj => {
        obj.selectable = true;
        obj.evented = true;
        obj.lockMovementX = false;
        obj.lockMovementY = false;
        obj.hasControls = true;
        obj.hasBorders = true;
        });
        
        this.fabricCanvas.renderAll();
    }
    
    /**
     * Handle eraser tool down event
     */
    handleEraserDown(opt) {
      // Set erasing flag
      this.isErasing = true;
      
      // Try to erase object at pointer
      this.tryEraseAt(opt.e);
    }
    
    /**
     * Handle eraser tool move event
     */
    handleEraserMove(opt) {
      if (!this.isErasing) return;
      
      // Try to erase object at pointer
      this.tryEraseAt(opt.e);
    }
    
    /**
     * Handle eraser tool up event
     */
    handleEraserUp() {
      this.isErasing = false;
    }
    
    /**
     * Try to erase object at pointer position
     */
    tryEraseAt(e) {
      const pointer = this.fabricCanvas.getPointer(e);
      const objects = this.fabricCanvas.getObjects();
      
      // Find objects under point
      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        
        if (obj.containsPoint(pointer)) {
          this.fabricCanvas.remove(obj);
          this.fabricCanvas.renderAll();
          break; // Only remove one object at a time
        }
      }
    }
    
    /**
     * Delete selected objects
     */
    deleteSelected() {
      const activeObject = this.fabricCanvas.getActiveObject();
      
      if (activeObject) {
        if (activeObject.type === 'activeSelection') {
          // Multiple objects selected
          activeObject.forEachObject(obj => {
            this.fabricCanvas.remove(obj);
          });
          this.fabricCanvas.discardActiveObject();
        } else {
          // Single object selected
          this.fabricCanvas.remove(activeObject);
        }
        
        this.fabricCanvas.requestRenderAll();
      }
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
      // Debounce resize events
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }
      
      this.resizeTimeout = setTimeout(() => {
        const mediaElement = this.mediaLoader.getCurrentMediaElement();
        if (mediaElement) {
          this.updateCanvasSize(mediaElement);
        }
      }, 100);
    }
    
    /**
     * Clear all annotations
     */
    clearAll() {
      if (!this.fabricCanvas) return;
      
      this.fabricCanvas.clear();
      this.fabricCanvas.renderAll();
    }
  }
  
  // Wait for document load
  document.addEventListener('DOMContentLoaded', () => {
    // Create ROI tools instance when mediaLoader is available
    window.addEventListener('load', () => {
      if (window.mediaLoader) {
        window.roiTools = new ROITools(window.mediaLoader);
      }
    });
  });