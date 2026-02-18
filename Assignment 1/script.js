
var FILTER_STEP = 2;  // 23i-0526 (Even)

// ============================================================
//  GLOBAL STATE
// ============================================================

var originalImageData = null;

var filters = {
  brightness:  100,  
  saturation:  100,  
  inversion:   0,    // 0–100
  grayscale:   0,    // 0–100
  sepia:       0,    // 0–100
  blur:        0,    // 0–20 px
  rotate:      0,    // degrees (slider, -180 to 180)
  rotateStep:  0,    // cumulative from rotate-left / rotate-right buttons (+/- 90)
  flipH:       1,    // 1 or -1
  flipV:       1     // 1 or -1
};

// Which main-panel filter is selected
var selectedFilter = 'brightness';

// Slider min/max/default per filter
var filterConfig = {
  brightness: { min: 0,    max: 200, def: 100, unit: '%'  },
  saturation: { min: 0,    max: 200, def: 100, unit: '%'  },
  inversion:  { min: 0,    max: 100, def: 0,   unit: '%'  },
  grayscale:  { min: 0,    max: 100, def: 0,   unit: '%'  }
};

// ============================================================
//  UNDO / REDO HISTORY
// ============================================================
// Each entry is a snapshot of "filters" object
var historyStack = [];   // array of filter snapshots
var historyIndex = -1;   // pointer to current state in historyStack

// ============================================================
//  CANVAS & IMAGE SETUP
// ============================================================
var canvas  = document.getElementById('main-canvas');
var ctx     = canvas.getContext('2d');

/*
  loadImage: called when user picks a file.
  Loads image into canvas, saves original pixel data.
*/
function loadImage(event) {
  var file = event.target.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      // Set canvas size to image size
      canvas.width  = img.width;
      canvas.height = img.height;

      // Draw image on canvas
      ctx.drawImage(img, 0, 0);

      // Save original pixel data for reset
      originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Show canvas, hide placeholder
      canvas.style.display = 'block';
      document.getElementById('no-image-msg').style.display = 'none';

      // Reset all filter values
      resetFiltersState();

      // Push initial state to history
      historyStack = [];
      historyIndex = -1;
      pushHistory('Original');

      // Render
      applyFilters();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ============================================================
//  FILTER SELECTION (top buttons: Brightness, Saturation, etc.)
// ============================================================
function selectFilter(filterName) {
  selectedFilter = filterName;

  // Update active button style
  var buttons = document.querySelectorAll('.filter-btn');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove('active');
  }
  document.getElementById('btn-' + filterName).classList.add('active');

  // Update slider label + value + min/max
  var cfg = filterConfig[filterName];
  var slider = document.getElementById('main-slider');
  slider.min   = cfg.min;
  slider.max   = cfg.max;
  slider.step  = FILTER_STEP;
  slider.value = filters[filterName];

  document.getElementById('slider-name').textContent = capitalize(filterName);
  document.getElementById('slider-value').textContent = filters[filterName] + cfg.unit;
}

/*
  onSliderChange: called when the main slider moves.
  Updates the selected filter value and re-renders.
*/
function onSliderChange() {
  if (!originalImageData) return;

  var slider = document.getElementById('main-slider');
  var val = parseInt(slider.value);

  filters[selectedFilter] = val;
  document.getElementById('slider-value').textContent = val + filterConfig[selectedFilter].unit;

  applyFilters();
  pushHistory(capitalize(selectedFilter) + ': ' + val + filterConfig[selectedFilter].unit);
}

/*
  onExtraSliderChange: for sepia, blur, rotate sliders.
*/
function onExtraSliderChange(type) {
  if (!originalImageData) return;

  if (type === 'sepia') {
    var v = parseInt(document.getElementById('sepia-slider').value);
    filters.sepia = v;
    document.getElementById('sepia-val').textContent = v + '%';
    pushHistory('Sepia: ' + v + '%');
  } else if (type === 'blur') {
    var v = parseInt(document.getElementById('blur-slider').value);
    filters.blur = v;
    document.getElementById('blur-val').textContent = v + 'px';
    pushHistory('Blur: ' + v + 'px');
  } else if (type === 'rotate') {
    var v = parseInt(document.getElementById('rotate-slider').value);
    filters.rotate = v;
    document.getElementById('rotate-val').textContent = v + 'deg';
    pushHistory('Rotate: ' + v + 'deg');
  }

  applyFilters();
}

// ============================================================
//  ROTATE & FLIP (button-based)
// ============================================================
function rotateLeft() {
  if (!originalImageData) return;
  filters.rotateStep = (filters.rotateStep - 90 + 360) % 360;
  applyFilters();
  pushHistory('Rotate Left');
}

function rotateRight() {
  if (!originalImageData) return;
  filters.rotateStep = (filters.rotateStep + 90) % 360;
  applyFilters();
  pushHistory('Rotate Right');
}

function flipHorizontal() {
  if (!originalImageData) return;
  filters.flipH = filters.flipH * -1;
  applyFilters();
  pushHistory('Flip Horizontal');
}

function flipVertical() {
  if (!originalImageData) return;
  filters.flipV = filters.flipV * -1;
  applyFilters();
  pushHistory('Flip Vertical');
}

// ============================================================
//  RESET FILTERS
// ============================================================
function resetFilters() {
  if (!originalImageData) return;

  resetFiltersState();
  applyFilters();
  pushHistory('Reset');
}

/*
  resetFiltersState: sets all filter values back to defaults
  and updates the UI sliders/labels.
*/
function resetFiltersState() {
  filters.brightness  = 100;
  filters.saturation  = 100;
  filters.inversion   = 0;
  filters.grayscale   = 0;
  filters.sepia       = 0;
  filters.blur        = 0;
  filters.rotate      = 0;
  filters.rotateStep  = 0;
  filters.flipH       = 1;
  filters.flipV       = 1;

  // Reset main slider to selected filter default
  var cfg = filterConfig[selectedFilter];
  var slider = document.getElementById('main-slider');
  slider.min   = cfg.min;
  slider.max   = cfg.max;
  slider.step  = FILTER_STEP;
  slider.value = filters[selectedFilter];
  document.getElementById('slider-value').textContent = filters[selectedFilter] + cfg.unit;

  // Reset extra sliders
  document.getElementById('sepia-slider').value = 0;
  document.getElementById('sepia-val').textContent  = '0%';

  document.getElementById('blur-slider').value  = 0;
  document.getElementById('blur-val').textContent   = '0px';

  document.getElementById('rotate-slider').value = 0;
  document.getElementById('rotate-val').textContent = '0deg';
}

// ============================================================
//  APPLY ALL FILTERS TO CANVAS
//  This is the core rendering function.
//  Order: brightness → saturation → grayscale → inversion → sepia
//         then blur (CSS trick using off-screen canvas)
//         then rotate (step buttons + slider) + flip
// ============================================================
function applyFilters() {
  if (!originalImageData) return;

  // Work on a copy of original pixel data
  var src  = originalImageData.data;
  var copy = new ImageData(new Uint8ClampedArray(src), originalImageData.width, originalImageData.height);
  var data = copy.data;
  var len  = data.length;

  var bright     = filters.brightness  / 100;   // 1 = normal
  var sat        = filters.saturation  / 100;   // 1 = normal
  var inv        = filters.inversion   / 100;   // 0 = none, 1 = full
  var gray       = filters.grayscale   / 100;   // 0 = none, 1 = full
  var sep        = filters.sepia       / 100;   // 0 = none, 1 = full

  // Process each pixel
  for (var i = 0; i < len; i += 4) {
    var r = data[i];
    var g = data[i + 1];
    var b = data[i + 2];
    // alpha = data[i+3] — unchanged

    // --- BRIGHTNESS ---
    r = r * bright;
    g = g * bright;
    b = b * bright;

    // --- SATURATION ---
    // Luminance-weighted gray level
    var lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    r = lum + (r - lum) * sat;
    g = lum + (g - lum) * sat;
    b = lum + (b - lum) * sat;

    // --- GRAYSCALE ---
    if (gray > 0) {
      var grayVal = 0.299 * r + 0.587 * g + 0.114 * b;
      r = r + (grayVal - r) * gray;
      g = g + (grayVal - g) * gray;
      b = b + (grayVal - b) * gray;
    }

    // --- INVERSION ---
    if (inv > 0) {
      r = r + (255 - r - r) * inv;
      g = g + (255 - g - g) * inv;
      b = b + (255 - b - b) * inv;
    }

    // --- SEPIA ---
    if (sep > 0) {
      var sr = r * 0.393 + g * 0.769 + b * 0.189;
      var sg = r * 0.349 + g * 0.686 + b * 0.168;
      var sb = r * 0.272 + g * 0.534 + b * 0.131;
      r = r + (sr - r) * sep;
      g = g + (sg - g) * sep;
      b = b + (sb - b) * sep;
    }

    // Clamp to [0, 255]
    data[i]     = clamp(r);
    data[i + 1] = clamp(g);
    data[i + 2] = clamp(b);
  }

  // ------ Apply blur (using a simple box blur) ------
  if (filters.blur > 0) {
    applyBoxBlur(copy, filters.blur);
  }

  // ------ Put filtered pixel data onto canvas ------
  // We need to handle rotation + flip using canvas transform

  var totalRotation = ((filters.rotateStep + filters.rotate) % 360 + 360) % 360;
  var rad = totalRotation * Math.PI / 180;

  var origW = originalImageData.width;
  var origH = originalImageData.height;

  // Compute new canvas size needed after rotation
  var sinA = Math.abs(Math.sin(rad));
  var cosA = Math.abs(Math.cos(rad));
  var newW = Math.round(origW * cosA + origH * sinA);
  var newH = Math.round(origW * sinA + origH * cosA);

  canvas.width  = newW;
  canvas.height = newH;

  // Clear canvas
  ctx.clearRect(0, 0, newW, newH);

  // Save context
  ctx.save();

  // Move to center of new canvas
  ctx.translate(newW / 2, newH / 2);

  // Apply flip
  ctx.scale(filters.flipH, filters.flipV);

  // Apply rotation
  ctx.rotate(rad);

  // Draw the filtered image (from a temp offscreen canvas)
  var tmpCanvas  = document.createElement('canvas');
  tmpCanvas.width  = origW;
  tmpCanvas.height = origH;
  var tmpCtx = tmpCanvas.getContext('2d');
  tmpCtx.putImageData(copy, 0, 0);

  // Draw centered
  ctx.drawImage(tmpCanvas, -origW / 2, -origH / 2);

  // Restore context
  ctx.restore();
}

// ============================================================
//  BOX BLUR — simple averaging blur
//  radius: pixel radius of blur (maps to blur slider value)
// ============================================================
function applyBoxBlur(imageData, radius) {
  var data   = imageData.data;
  var width  = imageData.width;
  var height = imageData.height;

  // Use radius directly as half-size of box
  var r = Math.floor(radius);
  if (r < 1) return;

  // Horizontal pass
  var temp = new Uint8ClampedArray(data.length);

  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      var rSum = 0, gSum = 0, bSum = 0, count = 0;
      for (var kx = -r; kx <= r; kx++) {
        var nx = x + kx;
        if (nx >= 0 && nx < width) {
          var idx = (y * width + nx) * 4;
          rSum += data[idx];
          gSum += data[idx + 1];
          bSum += data[idx + 2];
          count++;
        }
      }
      var i = (y * width + x) * 4;
      temp[i]     = rSum / count;
      temp[i + 1] = gSum / count;
      temp[i + 2] = bSum / count;
      temp[i + 3] = data[i + 3];
    }
  }

  // Vertical pass
  for (var x = 0; x < width; x++) {
    for (var y = 0; y < height; y++) {
      var rSum = 0, gSum = 0, bSum = 0, count = 0;
      for (var ky = -r; ky <= r; ky++) {
        var ny = y + ky;
        if (ny >= 0 && ny < height) {
          var idx = (ny * width + x) * 4;
          rSum += temp[idx];
          gSum += temp[idx + 1];
          bSum += temp[idx + 2];
          count++;
        }
      }
      var i = (y * width + x) * 4;
      data[i]     = rSum / count;
      data[i + 1] = gSum / count;
      data[i + 2] = bSum / count;
    }
  }
}

// ============================================================
//  SAVE IMAGE
//  Converts canvas to PNG and triggers download.
// ============================================================
function saveImage() {
  if (!originalImageData) {
    alert('Please select an image first.');
    return;
  }

  var link = document.createElement('a');
  link.download = 'edited-image.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// ============================================================
//  UNDO / REDO
// ============================================================

/*
  pushHistory: saves a snapshot of current filter state.
  label: a descriptive string shown in history panel.
  If we are not at the end of the stack, future states are removed.
*/
function pushHistory(label) {
  // Remove all states after current pointer (for redo invalidation)
  if (historyIndex < historyStack.length - 1) {
    historyStack.splice(historyIndex + 1);
  }

  // Take a deep copy of current filters
  var snapshot = {
    label:      label,
    brightness: filters.brightness,
    saturation: filters.saturation,
    inversion:  filters.inversion,
    grayscale:  filters.grayscale,
    sepia:      filters.sepia,
    blur:       filters.blur,
    rotate:     filters.rotate,
    rotateStep: filters.rotateStep,
    flipH:      filters.flipH,
    flipV:      filters.flipV
  };

  historyStack.push(snapshot);
  historyIndex = historyStack.length - 1;

  updateUndoRedoButtons();
  renderHistoryPanel();
}

/*
  undo: reverts to the previous state.
*/
function undo() {
  if (historyIndex <= 0) return;
  historyIndex--;
  restoreFromHistory(historyIndex);
  updateUndoRedoButtons();
  renderHistoryPanel();
}

/*
  redo: restores the next state.
*/
function redo() {
  if (historyIndex >= historyStack.length - 1) return;
  historyIndex++;
  restoreFromHistory(historyIndex);
  updateUndoRedoButtons();
  renderHistoryPanel();
}

/*
  restoreFromHistory: applies a saved snapshot to current filters and re-renders.
*/
function restoreFromHistory(index) {
  var snap = historyStack[index];
  if (!snap) return;

  filters.brightness = snap.brightness;
  filters.saturation = snap.saturation;
  filters.inversion  = snap.inversion;
  filters.grayscale  = snap.grayscale;
  filters.sepia      = snap.sepia;
  filters.blur       = snap.blur;
  filters.rotate     = snap.rotate;
  filters.rotateStep = snap.rotateStep;
  filters.flipH      = snap.flipH;
  filters.flipV      = snap.flipV;

  // Sync all UI controls to match restored state
  syncUIToFilters();
  applyFilters();
}

/*
  syncUIToFilters: updates all sliders and labels to match current filter values.
*/
function syncUIToFilters() {
  // Main slider
  var cfg = filterConfig[selectedFilter];
  var slider = document.getElementById('main-slider');
  slider.min   = cfg.min;
  slider.max   = cfg.max;
  slider.step  = FILTER_STEP;
  slider.value = filters[selectedFilter];
  document.getElementById('slider-value').textContent = filters[selectedFilter] + cfg.unit;

  // Extra sliders
  document.getElementById('sepia-slider').value = filters.sepia;
  document.getElementById('sepia-val').textContent = filters.sepia + '%';

  document.getElementById('blur-slider').value  = filters.blur;
  document.getElementById('blur-val').textContent = filters.blur + 'px';

  document.getElementById('rotate-slider').value = filters.rotate;
  document.getElementById('rotate-val').textContent = filters.rotate + 'deg';
}

/*
  updateUndoRedoButtons: enables/disables undo and redo buttons.
*/
function updateUndoRedoButtons() {
  document.getElementById('undo-btn').disabled = (historyIndex <= 0);
  document.getElementById('redo-btn').disabled = (historyIndex >= historyStack.length - 1);
}

// ============================================================
//  HISTORY PANEL
// ============================================================

/*
  renderHistoryPanel: rebuilds the history list UI.
*/
function renderHistoryPanel() {
  var list = document.getElementById('history-list');
  list.innerHTML = '';

  if (historyStack.length === 0) {
    var li = document.createElement('li');
    li.className = 'history-empty';
    li.textContent = 'No changes yet';
    list.appendChild(li);
    return;
  }

  for (var i = 0; i < historyStack.length; i++) {
    var li = document.createElement('li');
    li.className = 'history-item';
    if (i === historyIndex) {
      li.className += ' current';
    }
    li.textContent = (i + 1) + '. ' + historyStack[i].label;

    // Capture index in closure
    (function(idx) {
      li.onclick = function() {
        jumpToHistory(idx);
      };
    })(i);

    list.appendChild(li);
  }
}

/*
  jumpToHistory: jump to a specific history entry.
  If a new filter is applied after this, all future states beyond
  the selected point will be deleted (handled in pushHistory).
*/
function jumpToHistory(index) {
  historyIndex = index;
  restoreFromHistory(index);
  updateUndoRedoButtons();
  renderHistoryPanel();
}

/*
  clearHistory: clears history panel (keeps current state).
*/
function clearHistory() {
  if (historyStack.length === 0) return;

  // Keep only the current state
  var current = historyStack[historyIndex];
  historyStack = [current];
  historyIndex = 0;

  updateUndoRedoButtons();
  renderHistoryPanel();
}

// ============================================================
//  UTILITY FUNCTIONS
// ============================================================

/*
  clamp: restricts a value to [0, 255].
*/
function clamp(val) {
  if (val < 0)   return 0;
  if (val > 255) return 255;
  return Math.round(val);
}

/*
  capitalize: makes first letter uppercase.
*/
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================
//  INITIALIZE on page load
// ============================================================
window.onload = function() {
  // Set main slider step according to FILTER_STEP
  var slider = document.getElementById('main-slider');
  slider.step = FILTER_STEP;

  // Set extra sliders step too
  document.getElementById('sepia-slider').step  = FILTER_STEP;
  document.getElementById('blur-slider').step   = 1;    // blur step stays 1 px
  document.getElementById('rotate-slider').step = FILTER_STEP;

  // Initialize UI for the default selected filter (brightness)
  selectFilter('brightness');
};
