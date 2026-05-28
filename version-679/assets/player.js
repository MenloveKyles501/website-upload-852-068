(function () {
  var video = document.getElementById('main-video');
  var button = document.getElementById('player-overlay');
  var status = document.getElementById('player-status');
  var url = typeof activeVideoUrl !== 'undefined' ? activeVideoUrl : '';
  var hls = null;
  var prepared = false;
  var wantsPlay = false;

  function setStatus(text) {
    if (status) {
      status.textContent = text;
      status.classList.remove('is-hidden');
    }
  }

  function hideStatus() {
    if (status) {
      status.classList.add('is-hidden');
    }
  }

  function hideButton() {
    if (button) {
      button.classList.add('is-hidden');
    }
  }

  function showButton() {
    if (button) {
      button.classList.remove('is-hidden');
    }
  }

  function tryPlay() {
    if (!video) {
      return;
    }

    var playPromise = video.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(function () {
        hideButton();
      }).catch(function () {
        showButton();
      });
    } else {
      hideButton();
    }
  }

  function onReady() {
    hideStatus();
    if (wantsPlay) {
      tryPlay();
    }
  }

  function prepare() {
    if (!video || prepared || !url) {
      return;
    }

    prepared = true;

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, onReady);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            setStatus('视频暂时无法播放');
            showButton();
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', onReady, { once: true });
    } else {
      setStatus('视频暂时无法播放');
      showButton();
    }
  }

  function startPlayback() {
    wantsPlay = true;
    prepare();
    tryPlay();
  }

  if (video && button) {
    prepare();

    button.addEventListener('click', function () {
      startPlayback();
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', hideButton);
    video.addEventListener('pause', showButton);
    video.addEventListener('waiting', function () {
      setStatus('加载中...');
    });
    video.addEventListener('playing', hideStatus);
  }

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
