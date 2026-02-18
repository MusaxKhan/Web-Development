var FILTER_STEP = 2;
var originalImageData = null;

var filters = {
  brightness: 100,
  saturation: 100,
  inversion: 0,
  grayscale: 0,
  sepia: 0,
  blur: 0,
  rotate: 0,
  rotateStep: 0,
  flipH: 1,
  flipV: 1
};

var selectedFilter = 'brightness';

var filterConfig = {
  brightness: { min: 0, max: 200, def: 100, unit: '%' },
  saturation: { min: 0, max: 200, def: 100, unit: '%' },
  inversion: { min: 0, max: 100, def: 0, unit: '%' },
  grayscale: { min: 0, max: 100, def: 0, unit: '%' }
};

var historyStack = [];
var historyIndex = -1;

var canvas = document.getElementById('main-canvas');
var ctx = canvas.getContext('2d');

function loadImage(event) {
  var file = event.target.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = function (e) {
    var img = new Image();
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      canvas.style.display = 'block';
      document.getElementById('no-image-msg').style.display = 'none';

      resetFiltersState();

      historyStack = [];
      historyIndex = -1;
      pushHistory('Original');

      applyFilters();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function selectFilter(filterName) {
  selectedFilter = filterName;

  var buttons = document.querySelectorAll('.filter-btn');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove('active');
  }
  document.getElementById('btn-' + filterName).classList.add('active');

  var cfg = filterConfig[filterName];
  var slider = document.getElementById('main-slider');
  slider.min = cfg.min;
  slider.max = cfg.max;
  slider.step = FILTER_STEP;
  slider.value = filters[filterName];

  document.getElementById('slider-name').textContent = capitalize(filterName);
  document.getElementById('slider-value').textContent =
    filters[filterName] + cfg.unit;
}

function onSliderChange() {
  if (!originalImageData) return;

  var slider = document.getElementById('main-slider');
  var val = parseInt(slider.value);

  filters[selectedFilter] = val;
  document.getElementById('slider-value').textContent =
    val + filterConfig[selectedFilter].unit;

  applyFilters();
  pushHistory(
    capitalize(selectedFilter) +
      ': ' +
      val +
      filterConfig[selectedFilter].unit
  );
}

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

function resetFilters() {
  if (!originalImageData) return;

  resetFiltersState();
  applyFilters();
  pushHistory('Reset');
}

function resetFiltersState() {
  filters.brightness = 100;
  filters.saturation = 100;
  filters.inversion = 0;
  filters.grayscale = 0;
  filters.sepia = 0;
  filters.blur = 0;
  filters.rotate = 0;
  filters.rotateStep = 0;
  filters.flipH = 1;
  filters.flipV = 1;

  var cfg = filterConfig[selectedFilter];
  var slider = document.getElementById('main-slider');
  slider.min = cfg.min;
  slider.max = cfg.max;
  slider.step = FILTER_STEP;
  slider.value = filters[selectedFilter];

  document.getElementById('slider-value').textContent =
    filters[selectedFilter] + cfg.unit;

  document.getElementById('sepia-slider').value = 0;
  document.getElementById('sepia-val').textContent = '0%';

  document.getElementById('blur-slider').value = 0;
  document.getElementById('blur-val').textContent = '0px';

  document.getElementById('rotate-slider').value = 0;
  document.getElementById('rotate-val').textContent = '0deg';
}

function applyFilters() {
  if (!originalImageData) return;

  var src = originalImageData.data;
  var copy = new ImageData(
    new Uint8ClampedArray(src),
    originalImageData.width,
    originalImageData.height
  );
  var data = copy.data;
  var len = data.length;

  var bright = filters.brightness / 100;
  var sat = filters.saturation / 100;
  var inv = filters.inversion / 100;
  var gray = filters.grayscale / 100;
  var sep = filters.sepia / 100;

  for (var i = 0; i < len; i += 4) {
    var r = data[i];
    var g = data[i + 1];
    var b = data[i + 2];

    r = r * bright;
    g = g * bright;
    b = b * bright;

    var lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    r = lum + (r - lum) * sat;
    g = lum + (g - lum) * sat;
    b = lum + (b - lum) * sat;

    if (gray > 0) {
      var grayVal = 0.299 * r + 0.587 * g + 0.114 * b;
      r = r + (grayVal - r) * gray;
      g = g + (grayVal - g) * gray;
      b = b + (grayVal - b) * gray;
    }

    if (inv > 0) {
      r = r + (255 - r - r) * inv;
      g = g + (255 - g - g) * inv;
      b = b + (255 - b - b) * inv;
    }

    if (sep > 0) {
      var sr = r * 0.393 + g * 0.769 + b * 0.189;
      var sg = r * 0.349 + g * 0.686 + b * 0.168;
      var sb = r * 0.272 + g * 0.534 + b * 0.131;

      r = r + (sr - r) * sep;
      g = g + (sg - g) * sep;
      b = b + (sb - b) * sep;
    }

    data[i] = clamp(r);
    data[i + 1] = clamp(g);
    data[i + 2] = clamp(b);
  }

  if (filters.blur > 0) {
    applyBoxBlur(copy, filters.blur);
  }

  var totalRotation =
    ((filters.rotateStep + filters.rotate) % 360 + 360) % 360;

  var rad = (totalRotation * Math.PI) / 180;

  var origW = originalImageData.width;
  var origH = originalImageData.height;

  var sinA = Math.abs(Math.sin(rad));
  var cosA = Math.abs(Math.cos(rad));

  var newW = Math.round(origW * cosA + origH * sinA);
  var newH = Math.round(origW * sinA + origH * cosA);

  canvas.width = newW;
  canvas.height = newH;

  ctx.clearRect(0, 0, newW, newH);

  ctx.save();

  ctx.translate(newW / 2, newH / 2);

  ctx.scale(filters.flipH, filters.flipV);

  ctx.rotate(rad);

  var tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = origW;
  tmpCanvas.height = origH;

  var tmpCtx = tmpCanvas.getContext('2d');
  tmpCtx.putImageData(copy, 0, 0);

  ctx.drawImage(tmpCanvas, -origW / 2, -origH / 2);

  ctx.restore();
}

function applyBoxBlur(imageData, radius) {
  var data = imageData.data;
  var width = imageData.width;
  var height = imageData.height;

  var r = Math.floor(radius);
  if (r < 1) return;

  var temp = new Uint8ClampedArray(data.length);

  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      var rSum = 0,
        gSum = 0,
        bSum = 0,
        count = 0;

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

      temp[i] = rSum / count;
      temp[i + 1] = gSum / count;
      temp[i + 2] = bSum / count;
      temp[i + 3] = data[i + 3];
    }
  }

  for (var x = 0; x < width; x++) {
    for (var y = 0; y < height; y++) {
      var rSum = 0,
        gSum = 0,
        bSum = 0,
        count = 0;

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

      data[i] = rSum / count;
      data[i + 1] = gSum / count;
      data[i + 2] = bSum / count;
    }
  }
}

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

function pushHistory(label) {
  if (historyIndex < historyStack.length - 1) {
    historyStack.splice(historyIndex + 1);
  }

  var snapshot = {
    label: label,
    brightness: filters.brightness,
    saturation: filters.saturation,
    inversion: filters.inversion,
    grayscale: filters.grayscale,
    sepia: filters.sepia,
    blur: filters.blur,
    rotate: filters.rotate,
    rotateStep: filters.rotateStep,
    flipH: filters.flipH,
    flipV: filters.flipV
  };

  historyStack.push(snapshot);
  historyIndex = historyStack.length - 1;

  updateUndoRedoButtons();
  renderHistoryPanel();
}

function undo() {
  if (historyIndex <= 0) return;

  historyIndex--;

  restoreFromHistory(historyIndex);

  updateUndoRedoButtons();
  renderHistoryPanel();
}

function redo() {
  if (historyIndex >= historyStack.length - 1) return;

  historyIndex++;

  restoreFromHistory(historyIndex);

  updateUndoRedoButtons();
  renderHistoryPanel();
}

function restoreFromHistory(index) {
  var snap = historyStack[index];
  if (!snap) return;

  filters.brightness = snap.brightness;
  filters.saturation = snap.saturation;
  filters.inversion = snap.inversion;
  filters.grayscale = snap.grayscale;
  filters.sepia = snap.sepia;
  filters.blur = snap.blur;
  filters.rotate = snap.rotate;
  filters.rotateStep = snap.rotateStep;
  filters.flipH = snap.flipH;
  filters.flipV = snap.flipV;

  syncUIToFilters();
  applyFilters();
}

function syncUIToFilters() {
  var cfg = filterConfig[selectedFilter];
  var slider = document.getElementById('main-slider');

  slider.min = cfg.min;
  slider.max = cfg.max;
  slider.step = FILTER_STEP;
  slider.value = filters[selectedFilter];

  document.getElementById('slider-value').textContent =
    filters[selectedFilter] + cfg.unit;

  document.getElementById('sepia-slider').value = filters.sepia;
  document.getElementById('sepia-val').textContent = filters.sepia + '%';

  document.getElementById('blur-slider').value = filters.blur;
  document.getElementById('blur-val').textContent = filters.blur + 'px';

  document.getElementById('rotate-slider').value = filters.rotate;
  document.getElementById('rotate-val').textContent =
    filters.rotate + 'deg';
}

function updateUndoRedoButtons() {
  document.getElementById('undo-btn').disabled = historyIndex <= 0;
  document.getElementById('redo-btn').disabled =
    historyIndex >= historyStack.length - 1;
}

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

    li.textContent = i + 1 + '. ' + historyStack[i].label;

    (function (idx) {
      li.onclick = function () {
        jumpToHistory(idx);
      };
    })(i);

    list.appendChild(li);
  }
}

function jumpToHistory(index) {
  historyIndex = index;

  restoreFromHistory(index);

  updateUndoRedoButtons();
  renderHistoryPanel();
}

function clearHistory() {
  if (historyStack.length === 0) return;

  var current = historyStack[historyIndex];

  historyStack = [current];
  historyIndex = 0;

  updateUndoRedoButtons();
  renderHistoryPanel();
}

function clamp(val) {
  if (val < 0) return 0;
  if (val > 255) return 255;

  return Math.round(val);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

window.onload = function () {
  var slider = document.getElementById('main-slider');
  slider.step = FILTER_STEP;

  document.getElementById('sepia-slider').step = FILTER_STEP;
  document.getElementById('blur-slider').step = 1;
  document.getElementById('rotate-slider').step = FILTER_STEP;

  selectFilter('brightness');
};
