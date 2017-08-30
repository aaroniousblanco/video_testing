


(function(anvp) {

var parentElement, mediator, captionProps, fullscreenSupport,
    referenceCache = {};

var totalDuration, currentTime;

// var log = function() {
//   console.log.apply(
//       console,
//       ['[Controller]\t'].concat(Array.prototype.slice.call(arguments)));
// };

//////////////BEGIN CONTROL CONFIGURATION//////////////////////////

function ControlBar() { //create ControlBar object
  anvp.ControlInterface.call(this);
  this.timers_ = {};
  this.notImplementedWarning_ = true;

  this.setResponsive_ = function() {
    getElementFromClassPath('control').setAttribute('data-state', 'responsive');
    getElementFromClassPath('topbar').setAttribute('data-state', 'responsive');
  }
}

ControlBar.prototype = Object.create(anvp.ControlInterface.prototype);

ControlBar.prototype.init = function(node, w, h) {
  getElementFromClassPath('control:play-pause').onclick = function() {
    mediator.publish('playPauseClicked');
    getElementFromClassPath('topbar').setAttribute('data-state', 'visible');
  };
  getElementFromClassPath('control:fullscreen').onclick = function() {
    mediator.publish('fullscreenClicked');
  };
  getElementFromClassPath('control:time-line').onclick = function(e) {
    var seekIndex = getSeekIndex(e, this);
    mediator.publish('seekRequest', seekIndex);
  };
  getElementFromClassPath('social:more-icon').onclick = function() {
        let moreSocialDrawer = getElementFromClassPath('more-social-drawer');
        let toggledState = moreSocialDrawer.getAttribute('data-state');
        moreSocialDrawer.setAttribute('data-state', toggledState === 'visible' ?
        'hidden' : 'visible');
        let elementsArray = moreSocialDrawer.getElementsByClassName('social-drawer-icons');
        for (var i = 0; i < elementsArray.length; i++) {
            elementsArray[i].setAttribute('data-state', toggledState === 'visible' ? 'hidden' : 'visible');
        };
  };
  getElementFromClassPath('social:facebook-icon').onclick = function() {
        console.log('face');
  };
  getElementFromClassPath('social:twitter-icon').onclick = function() {
        console.log('twit');
  };
  getElementFromClassPath('volume > svg').onclick = function() { //toggles the volume slider
      let volumeBar = getElementFromClassPath('volume-bar');
      let toggledState = volumeBar.getAttribute('data-state');
      volumeBar.setAttribute('data-state', toggledState === 'visible' ?
      'hidden' : 'visible');
  };
  // let test = getElementFromClassPath('volume-bar:volume-meter');
  // test.onmousedown = (e) => {
  //     console.log('aaron',e);
  //     test.bind('onmousemove', (e) => {//beginning of the slider functionality
  //         console.log('first', e);
  //     });
  // };


  getElementFromClassPath('volume-bar:volume-meter').onmousedown = function(e) {
    var results = getSeekIndexVolume(e, this);
    mediator.publish('volumeUpdate', results.index); //update the volume based on y-index corresponding to user selection
    getElementFromClassPath('volume-meter-bar').style.height =
    results.ownerHeight - (results.index * results.ownerHeight); //the diff b/w height
    //of volume-meter and user selected volume; we use this to update the height of the slider (volume-meter-bar)
  };
  getElementFromClassPath('custom-ui').onmouseleave = function () { //toggles the volume slider to "inactive"
  //to coincide with the control being set to "responsive" (hidden after a 3000 ms delay) once the mouse exits the iframe
    var test = getElementFromClassPath('volume-bar');
    setTimeout(function () { test.setAttribute('data-state', 'hidden') }, 3000);
  };
  // getElementFromClassPath('custom-ui').ontouchend = function () { //toggles the volume slider to "inactive"
  // //to coincide with the control being set to "responsive" (hidden after a 3000 ms delay) once the mouse exits the iframe
  //   var test = getElementFromClassPath('volume-bar');
  //   setTimeout(function () { test.setAttribute('data-state', 'inactive') }, 3000);
  // };

};

ControlBar.prototype.updateDuration = function(index) {
  currentTime = index;
  getElementFromClassPath('control:time-line:progress').style.width =
      (currentTime * 100 / totalDuration) + '%';
  getElementFromClassPath('control:time-line:volume-icon').style.marginLeft =
      (currentTime * 100 / totalDuration) + '%';
  getElementFromClassPath('control:current-time').innerHTML =
      sec2TimeString(Math.round(currentTime));
  if (currentTime) {
    show(getElementFromClassPath('control:time'));
  }
};

ControlBar.prototype.setDuration = function(duration) {
  currentTime = 0;
  totalDuration = duration;
  hide(getElementFromClassPath('control:time'));
  getElementFromClassPath('control:total-duration').innerHTML =
      sec2TimeString(Math.round(totalDuration));
};

ControlBar.prototype.setVisibilityMode = function(mode) {
  getElementFromClassPath('control').setAttribute('data-state', mode);
  getElementFromClassPath('topbar').setAttribute('data-state', mode);
};

ControlBar.prototype.showTemporarily = function() { //called when mouse enters iframe
  getElementFromClassPath('control').setAttribute('data-state', 'visible'); //temporarily
  //sets the control bar to visible
  getElementFromClassPath('topbar').setAttribute('data-state', 'visible');
  if (this.timers_.setResponsive) {//enters this block following a mouse enter event
      // that follows an initial mouse enter event prior to the timeout below expiring
      //and then it clears the timeout so that it always returns to responsive state after 3000 ms
    clearTimeout(this.timers_.setResponsive);
    delete this.timers_.setResponsive; //removes setResponsive property from timers object
  }
  this.timers_.setResponsive = setTimeout(this.setResponsive_, 3000); //sets a timeout on the
  //visible control bar to return to responsive state after 3000 ms
};

ControlBar.prototype.setPaused = function(flag) {
  getElementFromClassPath('control:play-pause')
      .setAttribute('data-state', flag ? 'paused' : 'playing');
  getElementFromClassPath('clickable')
      .setAttribute('data-state', 'playing'); //this sets the splash play
      //icon attribute to playing so it's hidden after the initial play
  if (flag) {  // overriding default hidden mode of control bar for paused state
               // (async)
    setTimeout(this.setVisibilityMode.bind(this, 'visible'), 100);
    if (this.timers_.setResponsive) {
      clearTimeout(this.timers_.setResponsive);
      delete this.timers_.setResponsive;
    }
  }
};

ControlBar.prototype.setFullscreen = function(flag) {
  getElementFromClassPath('control:fullscreen')
      .setAttribute('data-state', flag ? 'on' : 'off');
};

ControlBar.prototype.setLive = function(flag) {
  var fn = flag ? hide : show;
  fn(getElementFromClassPath('control:time-line'));
  getElementFromClassPath('control:time')
      .setAttribute('data-state', flag ? 'live' : 'vod');
};

ControlBar.prototype.destroy = function() {
  for (var t in this.timers_) {
    if (this.timers_.hasOwnProperty(t)) {
      clearTimeout(this.timers_[t]);
      delete this.timers_[t];
    }
  }
};

//////////////BEGIN SPLASH CONFIGURATION//////////////////////////

function Splash() {
  anvp.SplashInterface.call(this);
  this.notImplementedWarning_ = true;
}

Splash.prototype = Object.create(anvp.SplashInterface.prototype);

Splash.prototype.init = function() {
  getElementFromClassPath('splash:play').onclick = function() {
    mediator.publish('playRequest', true); //play button on splash screen
  };
  // AARON'S CODE
  // I added a test property to the mediator object to toggle volume
  // getElementFromClassPath('unmute').onclick = function() {
  //   if (!mediator.test || mediator.test === 0) {
  //     mediator.publish('volumeUpdate', 1);
  //     mediator.test = 1;
  //   } else if (mediator.test === 1) {
  //     mediator.publish('volumeUpdate', 0);
  //     mediator.test = 0;
  //   }
  // };
  // getElementFromClassPath('unmute').onclick = function() {
  //       if (!mediator.test || mediator.test === 0) {
  //         mediator.publish('bitrateSelected', 200);
  //         mediator.test = 1;
  //       } else if (mediator.test === 1) {
  //         mediator.publish('bitrateSelected', 4000);
  //         mediator.test = 0;
  //       }
  //     };
  //code block below toggles the splash play button colors; update this
  //with logic for section colors when wiring up.
  let playButtonContainer = getElementFromClassPath('play');
  let playButtonSVG = getElementFromClassPath('play:paused')
  playButtonContainer.onmouseover = function() {
      playButtonSVG.style.fill = 'red';
      playButtonContainer.style.background = '#ffffff';
  };
  playButtonContainer.onmouseout = function() {
      playButtonSVG.style.fill = '#ffffff';
      playButtonContainer.style.background = 'red';
  };
  // END AARON'S CODE
};

Splash.prototype.show = function(splashMode, playerMode, img, remaining) {
  var splash = getElementFromClassPath('splash');
  splash.setAttribute('data-mode', splashMode);
  show(splash);
  mediator.publish('splashModeUpdated', splashMode);
  if (img) {
    cacheImages([img], function() {
      getElementFromClassPath('splash').style.background =
          'url(' + img + ') center center / 100% no-repeat';
    });
  } else {
    getElementFromClassPath('splash').style.background = 'none';
  }
};

Splash.prototype.setInfo = function(title, description) {
  getElementFromClassPath('topbar:title').innerHTML = title;
};

Splash.prototype.resetInfo = function() {};

Splash.prototype.hide = function() {
  hide(getElementFromClassPath('splash'));
};

Splash.prototype.buffering = function(on) {
  getElementFromClassPath('custom-ui')
      .setAttribute('data-buffering', on ? 'on' : 'off');
};

//////////////Construct the CustomUI Object///////////////////////

function CustomUI() {
  anvp.AnvatoCustomUIInterface.call(this);
  function init_() {
    parentElement = anvp.AnvatoCustomUIInterface.container;
    mediator = anvp.AnvatoCustomUIInterface.mediator;
    captionProps = anvp.AnvatoCustomUIInterface.staticData.captionProps;
    fullscreenSupport =
        anvp.AnvatoCustomUIInterface.staticData.fullscreenSupport;
  }

  this.readyCallback = function() {
    init_();
    parentElement.style.display = 'block';
  };
  this.control = ControlBar;
  this.splash = Splash;
}
new CustomUI();


/////////////////// some useful utilities//////////////////////
function getElementFromClassPath(path) {
  var parts;
  var part;
  var references;
  var reference = null;
  if (path in referenceCache) {
    return referenceCache[path];
  } else {
    parts = typeof path === 'string' && path.split(':') || [];
    for (var i = 0, len = parts.length; i < len; i++) {
      part = parts[i];
      reference = reference || document;
      references = reference.querySelector('.' + part);
      if (references.length) {
        reference = references[0];
      } else if (references) {
        reference = references;
      } else {
        return null;
      }
    }
    references[path] = reference;
    return reference;
  }
}

function sec2TimeString(sec) {
  var hour = '';
  var min = parseInt((sec / 60), 10);
  sec = parseInt((sec % 60), 10);
  if (min >= 60) {
    hour = parseInt((min / 60), 10);
    min = parseInt((min % 60), 10);
    if (hour < 10) {
      hour = '0' + hour;
    }
    hour += ':';
  }
  if (sec < 10) {
    sec = '0' + sec;
  }
  if (min < 10) {
    min = '0' + min;
  }
  return hour + min + ':' + sec;
}

function cacheImages(imageArray, onLoadFn, onErrorFn) {
  var i = 0, len = imageArray.length, images = [];
  for (; i < len; i++) {
    images[i] = new Image();
    addEventListener(images[i], 'load', function() {
      onLoadFn(this);
    }, false);
    if (onErrorFn) {
      addEventListener(images[i], 'error', function() {
        onErrorFn(this);
      }, false);
    }
    if (imageArray[i]) {
      images[i].src = imageArray[i];
    } else {
      onLoadFn(images[i]);
    }
  }
}

function addEventListener(node, eventName, eventListener, useCapture) {
  // W3C model
  if (node.addEventListener) {
    useCapture = typeof useCapture !== 'undefined' ? useCapture : false;
    node.addEventListener(eventName, eventListener, useCapture);
  }
  // Microsoft model
  else {
    node.attachEvent('on' + eventName, eventListener);
  }
}

function getSeekIndex(e, owner) {
  var x, trueOffset, seekIndex, location = {}, ownerWidth;
  if (e.type == 'touchmove' || e.type == 'touchstart' || e.type == 'touchend') {
    var touchObj = e.changedTouches[0];
    x = touchObj.clientX;
  } else {
    x = e.clientX;
  }
  trueOffset = getCumulativeOffset(owner);
  ownerWidth = owner.clientWidth;
  x -= trueOffset.x;
  x = (x < 0) ? 0 : x;
  x = (x > ownerWidth) ? ownerWidth : x;
  seekIndex = totalDuration * x / ownerWidth;
  // Needed for preview request
  location.left = owner.clientLeft;
  location.right = location.left + owner.clientWidth;
  location.top = owner.clientTop;
  location.x = x + location.left;
  return seekIndex;
}

function getSeekIndexVolume(e, owner) { //UPDATED by AW
  var y, trueOffset, seekIndex, seekIndexVolume, ownerHeight;
  if (e.type == 'touchmove' || e.type == 'touchstart' || e.type == 'touchend') {
    var touchObj = e.changedTouches[0];
    y = touchObj.clientY;
  } else {
    y = e.clientY;
  }
  trueOffset = getCumulativeOffset(owner);
  ownerHeight = owner.clientHeight;
  y -= trueOffset.y;
  y = (y < 0) ? 0 : y;
  y = (y > ownerHeight) ? ownerHeight : y;
  seekIndex = 1 * y / ownerHeight;
  index = (1 - seekIndex) * 1;
  return { index, ownerHeight};
}

function getCumulativeOffset(obj) {
  var left, top, boundingClientRect;
  left = top = 0;
  if (window.self !== window.top && obj.offsetWidth < obj.clientWidth &&
      obj.getBoundingClientRect().width < 100) {
    boundingClientRect = obj.getBoundingClientRect();
    top = boundingClientRect.top * 100;
    left = boundingClientRect.left * 100;
  } else {
    if (obj.offsetParent) {
      do {
        left += obj.offsetLeft;
        top += obj.offsetTop;
      } while (obj = obj.offsetParent);
    }
  }
  return {x: left, y: top};
}

function hide(element) {
  element.setAttribute('data-display', element.style.display);
  element.style.display = 'none';
}

function show(element) {
  element.style.display = element.getAttribute('data-display') || 'block';
}

})(window.anvp);
