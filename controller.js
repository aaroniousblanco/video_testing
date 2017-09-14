

(function(anvp) {


//Anvato variables
    let parentElement, mediator, referenceCache = {};

    let totalDuration, currentTime;

//////////////BEGIN CONTROLBAR CONFIGURATION//////////////////////////

    function ControlBar() { //constructor for ControlBar object
        anvp.ControlInterface.call(this);
        this.timers_ = {};
        // this.notImplementedWarning_ = true;
        //
        // this.setResponsive_ = function() {
        // getElementFromClassPath('control').setAttribute('data-state', 'responsive');
        // getElementFromClassPath('topbar').setAttribute('data-state', 'responsive');
        // }
    }

    ControlBar.prototype = Object.create(anvp.ControlInterface.prototype); //extend ControlInterface object

    ControlBar.prototype.init = function() {
        //grab custom video elements from /view.html (video iframe)
        const volumeMeterBar = getElementFromClassPath('volume-meter-bar');
        const volumeMeter = getElementFromClassPath('volume-meter');
        const volumeBar = getElementFromClassPath('volume-bar');
        const volumeIcon = getElementFromClassPath('volume-icon');
        const volumeButton = getElementFromClassPath('volume > svg');
        const qualityButton = getElementFromClassPath('settings > svg');
        const qualityDrawer = getElementFromClassPath('quality-drawer');
        const moreSocialDrawer = getElementFromClassPath('more-social-drawer');
        const moreSocialButton = getElementFromClassPath('social:more-icon');
        const socialIconsArray = moreSocialDrawer.getElementsByClassName('social-drawer-icons');
        const facebookIcon = getElementFromClassPath('social:facebook-icon');
        const twitterIcon = getElementFromClassPath('social:twitter-icon');
        //misc variables/functions
        let playPauseClicked = false;
        let mouseIsDown = false; //test for onmousedown event for slider functionality below
        let volumeBarHoverTimeOut;
        let qualityDrawerHoverTimeOut;
        let moreSocialDrawerHoverTimeOut;

        const uiComponentVisibility = (element, mode) => {
            element.setAttribute('data-state', mode);
        };
        const socialDrawerVisibility = (mode) => {
            moreSocialDrawer.setAttribute('data-state', mode);
            for (let i = 0; i < socialIconsArray.length; i++) {
                socialIconsArray[i].setAttribute('data-state', mode);
            }
        };

        ////HIDE/SHOW LOGIC FOR UI COMPONENTS ////////////
        getElementFromClassPath('custom-ui').onmouseleave = function() { //toggles the volume slider to "hidden"
        //to coincide with the control being set to "responsive" (hidden after a 3000 ms delay) once the mouse exits the iframe
            uiComponentVisibility(volumeBar, 'hidden');
            uiComponentVisibility(qualityDrawer, 'hidden');
            socialDrawerVisibility('hidden');
            getElementFromClassPath('control').setAttribute('data-state', playPauseClicked ? 'visible' : 'hidden');
            getElementFromClassPath('topbar').setAttribute('data-state', playPauseClicked ? 'visible' : 'hidden');
        };
        getElementFromClassPath('control:play-pause').onclick = function() {
            mediator.publish('playPauseClicked');
            playPauseClicked = playPauseClicked ? false : true;
            getElementFromClassPath('topbar').setAttribute('data-state', playPauseClicked ? 'hidden' : 'visible');
        };
        getElementFromClassPath('control:fullscreen').onclick = function() {
            mediator.publish('fullscreenClicked');
        };
        getElementFromClassPath('control:time-line').onclick = function(e) {
            let seekIndex = getSeekIndex(e, this);
            mediator.publish('seekRequest', seekIndex);
        };
        ////SOCIAL SETTINGS /////////////////////////
        moreSocialButton.onmouseover = function() {
            clearTimeout(moreSocialDrawerHoverTimeOut);
            uiComponentVisibility(volumeBar, 'hidden');
            uiComponentVisibility(qualityDrawer, 'hidden');
            socialDrawerVisibility('visible');
        };
        moreSocialButton.onmouseleave = function() {
            moreSocialDrawerHoverTimeOut = setTimeout(function() { socialDrawerVisibility('hidden'); }, 1500);
        };
        moreSocialDrawer.onmouseover = function() {
            clearTimeout(moreSocialDrawerHoverTimeOut);
            socialDrawerVisibility('visible');
        };
        moreSocialDrawer.onmouseleave = function() {
            moreSocialDrawerHoverTimeOut = setTimeout(function() { socialDrawerVisibility('hidden'); }, 1500);
        };
        facebookIcon.onmouseover = function() {
            uiComponentVisibility(volumeBar, 'hidden');
            uiComponentVisibility(qualityDrawer, 'hidden');
            socialDrawerVisibility('hidden');
        };
        facebookIcon.onclick = function() {
            let width = "600px",
                height = "280px",
                left = "400px",
                top = "400px"
            window.open(
            'https://www.facebook.com/share.php?u=http%3A%2F%2Fpreview-dev.ajc.com%2Fsports%2Fthis-headline%2FrVhegVlNXB2WfZBIKsNUIO%2F&title=%22This%20is%20my%20%E2%80%9CHeadline',
            '_blank',
            'toolbar=no,location=no,directories=no,status=no,menubar=no,' +
            'titlebar=no,copyhistory=no,scrollbars=yes,' +
            'width=' + width + ',height=' + height + ',top=' + top + ',left=' + left,
            false
            );
        };
        twitterIcon.onmouseover = function() {
            uiComponentVisibility(volumeBar, 'hidden');
            uiComponentVisibility(qualityDrawer, 'hidden');
            socialDrawerVisibility('hidden');
        };
        twitterIcon.onclick = function() {
            let width = "600px",
                height = "280px",
                left = "400px",
                top = "400px"
            window.open(
            'https://twitter.com/intent/tweet?url=http%3A%2F%2Fpreview-dev.ajc.com%2Fsports%2Fthis-headline%2FrVhegVlNXB2WfZBIKsNUIO%2F&text=%22This%20is%20my%20%E2%80%9CHeadline',
            '_blank',
            'toolbar=no,location=no,directories=no,status=no,menubar=no,' +
            'titlebar=no,copyhistory=no,scrollbars=yes,' +
            'width=' + width + ',height=' + height + ',top=' + top + ',left=' + left,
            false
            );
        }
        getElementFromClassPath('pinterest-share').onclick = function() {
            let width = "600px",
                height = "280px",
                left = "400px",
                top = "400px"
            window.open(
            'https://pinterest.com/pin/create/button/?url=&media=&description=',
            '_blank',
            'toolbar=no,location=no,directories=no,status=no,menubar=no,' +
            'titlebar=no,copyhistory=no,scrollbars=yes,' +
            'width=' + width + ',height=' + height + ',top=' + top + ',left=' + left,
            false
            );
        }
        getElementFromClassPath('reddit-share').onclick = function() {
            let width = "600px",
                height = "280px",
                left = "400px",
                top = "400px"
            window.open(
            'https://reddit.com/submit?url=&title=',
            '_blank',
            'toolbar=no,location=no,directories=no,status=no,menubar=no,' +
            'titlebar=no,copyhistory=no,scrollbars=yes,' +
            'width=' + width + ',height=' + height + ',top=' + top + ',left=' + left,
            false
            );
        }
        getElementFromClassPath('email-video').onclick = function() {

        }
        getElementFromClassPath('copy-embed').onclick = function() {
            for (key in anvp) {
                if (typeof anvp[key] === "object" && anvp[key].config) {
                    var embedCode = top.cmg.anvatoConf.embedCodes[key];
                    var availableBitrates = top.cmg.anvatoConf.bitrates[key];
                    console.log('aarontest', embedCode, availableBitrates);
                }
            }
            function copyToClipboard(text) { //THIS IS TEMPORARY
                window.prompt("Copy embed code to clipboard: Ctrl+C, Enter", text);
            }
            copyToClipboard(embedCode);
        }
        ////VOLUME SETTINGS /////////////////////////
        volumeButton.onmouseover = function() { //toggles the volume slider
            clearTimeout(volumeBarHoverTimeOut);
            uiComponentVisibility(volumeBar, 'visible');
            uiComponentVisibility(qualityDrawer, 'hidden');
            socialDrawerVisibility('hidden');
        };
        volumeButton.onmouseleave = function() { //toggles the volume slider
            volumeBarHoverTimeOut = setTimeout(function() { uiComponentVisibility(volumeBar, 'hidden'); }, 1500);
        };
        volumeBar.onmouseover = function() {
            clearTimeout(volumeBarHoverTimeOut);
            uiComponentVisibility(this, 'visible');
        };
        volumeBar.onmouseleave = function() {
            volumeBarHoverTimeOut = setTimeout(function() { uiComponentVisibility(volumeBar, 'hidden'); }, 1500);
        };
        getElementFromClassPath('volume-bar:volume-meter').onmousedown = function(e) {
            let volumeSelection = getSeekIndexVolume(e, this);
            mediator.publish('volumeUpdate', volumeSelection.index); //update the volume based on y-index corresponding to user selection
            volumeIcon.style.top = volumeSelection.ownerHeight - (volumeSelection.index * volumeSelection.ownerHeight);
            volumeMeterBar.style.height = volumeSelection.ownerHeight - (volumeSelection.index * volumeSelection.ownerHeight); //the diff b/w height
            //of volume-meter and user selected volume; we use this to update the height of the slider (volume-meter-bar)
        };
        volumeIcon.onmousedown = function() { //VOLUME SLIDER
            mouseIsDown = true;
        };
        document.onmouseup = function() {
            mouseIsDown = false;
        };
        document.onmousemove = (e) => {
            let volumeBarOffset = getSeekIndexVolume(e, volumeMeter);
            if (mouseIsDown === false) {
                return;
            }
            volumeIcon.style.top = volumeMeterBar.style.height = volumeMeter.clientHeight - (volumeBarOffset.index * volumeBarOffset.ownerHeight);
            mediator.publish('volumeUpdate', volumeBarOffset.index);
        };
        ////QUALITY SETTINGS //////////////////////////
        qualityButton.onmouseover = function() { //toggles the volume slider
            clearTimeout(qualityDrawerHoverTimeOut);
            socialDrawerVisibility('hidden');
            uiComponentVisibility(qualityDrawer, 'visible');
            uiComponentVisibility(volumeBar, 'hidden');
        };
        qualityButton.onmouseleave = function() { //toggles the volume slider
            qualityDrawerHoverTimeOut = setTimeout(function() { uiComponentVisibility(qualityDrawer, 'hidden'); }, 1500);
        };
        qualityDrawer.onmouseover = function() {
            clearTimeout(qualityDrawerHoverTimeOut);
            uiComponentVisibility(this, 'visible');
        };
        qualityDrawer.onmouseleave = function() {
            qualityDrawerHoverTimeOut = setTimeout(function() { uiComponentVisibility(qualityDrawer, 'hidden'); }, 1500);
        };
        document.getElementById('624-kbps').onclick = function() {
            mediator.publish('bitrateSelected', 624);
        };
        document.getElementById('1707-kbps').onclick = function() {
            mediator.publish('bitrateSelected', 1707);
        };
        document.getElementById('2791-kbps').onclick = function() {
            mediator.publish('bitrateSelected', 2791);
        };
        document.getElementById('3841-kbps').onclick = function() {
            mediator.publish('bitrateSelected', 3841);
        };
        document.getElementById('auto-kbps').onclick = function() { //default bitrate; don't need to call mediator.publish for this
            //update the
        };

        // getElementFromClassPath('custom-ui').ontouchend = function () { //toggles the volume slider to "inactive"
        // //to coincide with the control being set to "responsive" (hidden after a 3000 ms delay) once the mouse exits the iframe
        //   let test = getElementFromClassPath('volume-bar');
        //   setTimeout(function () { test.setAttribute('data-state', 'inactive') }, 3000);
        // };
    };
/////////////////// END INIT FUNCTION ////////////////////////////////

    ControlBar.prototype.updateDuration = function(index) {
        currentTime = index;
        getElementFromClassPath('control:time-line:progress').style.width = (currentTime * 100 / totalDuration) + '%';
        getElementFromClassPath('control:time-line:progress-icon').style.marginLeft = (currentTime * 100 / totalDuration) + '%';
        getElementFromClassPath('control:current-time').innerHTML = sec2TimeString(Math.round(currentTime));
        getElementFromClassPath('control:total-duration').innerHTML = sec2TimeString(Math.round(totalDuration - currentTime));
    };

    ControlBar.prototype.setDuration = function(duration) {
        totalDuration = duration;
    };

    ControlBar.prototype.setVisibilityMode = function(mode) {
        getElementFromClassPath('control').setAttribute('data-state', mode);
        getElementFromClassPath('topbar').setAttribute('data-state', mode);
    };

    ControlBar.prototype.showTemporarily = function() { //called when mouse enters iframe
        getElementFromClassPath('control').setAttribute('data-state', 'visible'); //temporarily
        //sets the control bar to visible
        getElementFromClassPath('topbar').setAttribute('data-state', 'visible');
        // if (this.timers_.setResponsive) {//enters this block following a mouse enter event
        //     // that follows an initial mouse enter event prior to the timeout below expiring
        //     //and then it clears the timeout so that it always returns to responsive state after 3000 ms
        //   clearTimeout(this.timers_.setResponsive);
        //   delete this.timers_.setResponsive; //removes setResponsive property from timers object
        // }
        // this.timers_.setResponsive = setTimeout(this.setResponsive_, 3000); //sets a timeout on the
        // //visible control bar to return to responsive state after 3000 ms
    };

    ControlBar.prototype.setPaused = function(flag) {
        getElementFromClassPath('control:play-pause').setAttribute('data-state', flag ? 'paused' : 'playing');
        getElementFromClassPath('clickable').setAttribute('data-state', 'playing'); //this sets the splash play
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
        getElementFromClassPath('control:fullscreen').setAttribute('data-state', flag ? 'on' : 'off');
    };

    ControlBar.prototype.setLive = function(flag) {
        let fn = flag ? hide : show;
        fn(getElementFromClassPath('control:time-line'));
        getElementFromClassPath('control:time').setAttribute('data-state', flag ? 'live' : 'vod');
    };

    ControlBar.prototype.destroy = function() {
        for (let t in this.timers_) {
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

    //code block below toggles the splash play button colors; update this
    //with logic for section colors when wiring up.
        let playButtonContainer = getElementFromClassPath('play');
        let playButtonSVG = getElementFromClassPath('play:paused');
        playButtonContainer.onmouseover = function() {
            playButtonSVG.style.fill = 'red';
            playButtonContainer.style.background = '#ffffff';
        };
        playButtonContainer.onmouseout = function() {
            playButtonSVG.style.fill = '#ffffff';
            playButtonContainer.style.background = 'red';
        };
    };

    Splash.prototype.show = function(splashMode, playerMode, img) {
        let splash = getElementFromClassPath('splash');
        splash.setAttribute('data-mode', splashMode);
        show(splash);
        mediator.publish('splashModeUpdated', splashMode);
        if (img) {
            cacheImages([img], function() {
                getElementFromClassPath('splash').style.background = 'url(' + img + ') center center / 100% no-repeat';
            });
        } else {
            getElementFromClassPath('splash').style.background = 'none';
        }
    };

    Splash.prototype.setInfo = function(title) {
        getElementFromClassPath('topbar:title').innerHTML = title;
    };

    Splash.prototype.resetInfo = function() {};

    Splash.prototype.hide = function() {
        hide(getElementFromClassPath('splash'));
    };

    Splash.prototype.buffering = function(on) {
        getElementFromClassPath('custom-ui').setAttribute('data-buffering', on ? 'on' : 'off');
    };

////////////Begin EndScreen configuration ////////////////////////

    // function EndScreen() {
    //   anvp.EndScreenInterface.call(this);
    //   this.notImplementedWarning_ = true;
    // }
    //
    // EndScreen.prototype = Object.create(anvp.EndScreenInterface.prototype);

//////////////Construct the CustomUI Object///////////////////////

    function CustomUI() {
        anvp.AnvatoCustomUIInterface.call(this);
        function init_() {
            parentElement = anvp.AnvatoCustomUIInterface.container;
            mediator = anvp.AnvatoCustomUIInterface.mediator;
            // captionProps = anvp.AnvatoCustomUIInterface.staticData.captionProps;
            // fullscreenSupport = anvp.AnvatoCustomUIInterface.staticData.fullscreenSupport;
        }

        this.readyCallback = function() {
            init_();
            parentElement.style.display = 'block';
        };
        this.control = ControlBar;
        this.splash = Splash;
        // this.endscreen = EndScreen;
    }
    new CustomUI();


/////////////////// some useful utilities//////////////////////
    function getElementFromClassPath(path) {
        let parts;
        let part;
        let references;
        let reference = null;
        if (path in referenceCache) {
            return referenceCache[path];
        } else {
            parts = typeof path === 'string' && path.split(':') || [];
            for (let i = 0, len = parts.length; i < len; i++) {
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
        let hour = '';
        let min = parseInt((sec / 60), 10);
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
        let i = 0, len = imageArray.length, images = [];
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
        if (node.addEventListener) { // W3C model
            useCapture = typeof useCapture !== 'undefined' ? useCapture : false;
            node.addEventListener(eventName, eventListener, useCapture);
        } else { // Microsoft model
            node.attachEvent('on' + eventName, eventListener);
        }
    }

    function getSeekIndex(e, owner) {
        let x, trueOffset, seekIndex, location = {}, ownerWidth;
        if (e.type === 'touchmove' || e.type === 'touchstart' || e.type === 'touchend') {
            let touchObj = e.changedTouches[0];
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
        let y, trueOffset, seekIndex, ownerHeight;
        if (e.type === 'touchmove' || e.type === 'touchstart' || e.type === 'touchend') {
            let touchObj = e.changedTouches[0];
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
        let index = (1 - seekIndex) * 1;
        return { index, ownerHeight };
    }
    function getCumulativeOffset(obj) {
        let left, top, boundingClientRect;
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
                    obj = obj.offsetParent;
                } while (obj);
            }
        }
        return { x: left, y: top };
    }
    function hide(element) {
        element.setAttribute('data-display', element.style.display);
        element.style.display = 'none';
    }

    function show(element) {
        element.style.display = element.getAttribute('data-display') || 'block';
    }

})(window.anvp);
