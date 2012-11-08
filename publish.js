(function() {
  function publishOneImage(baseURL, passkey, file, progressCb, cb) {
    var req = new XMLHttpRequest();
    var url = baseURL + '/upload?cacheBust=' + Date.now();
    req.onload = function() {
      if (req.status == 403) {
        console.log('bad passkey');
        cb(null);
      } else if (req.status == 200) {
        var entry = JSON.parse(req.responseText);
        entry.type = file.type;
        cb(entry);
      } else {
        cb(null);
      }
    };
    req.onerror = function() {
      cb(null);
    };
    if (req.upload) {
      req.upload.addEventListener("progress", function(evt) {
        if (evt.lengthComputable)
          progressCb(evt.loaded / evt.total);
      }, false);
    }
    req.open('POST', url);
    req.setRequestHeader('X-Creation-Key', passkey);
    req.setRequestHeader('Content-Type', file.type);
    req.send(file);
  }

  window.publishImages = function publishImages(options) {
    var model = options.model;
    var baseURL = options.baseURL;
    var passkey = options.passkey;
    var onerror = options.onerror;
    var onprogress = options.onprogress;
    var oncomplete = options.oncomplete;

    var images = model.getMetadata();
    var imageIDs = Object.keys(images);
    var imageCount = imageIDs.length;
    var progressPerImage = 1 / imageCount;
    var toPublish = imageIDs.map(function(id) { return images[id] });
  
    function uploadNextImage() {
      if (!toPublish.length) {
        onprogress(1);
        return oncomplete();
      }
      
      var baseProgress = (imageCount - toPublish.length) / imageCount;
      var metadata = toPublish.pop();
      var id = metadata.id;
    
      if (metadata.publishedURL) {
        onprogress(baseProgress + progressPerImage, id);
        return setTimeout(uploadNextImage, 100);
      }

      onprogress(baseProgress, id);
      model.getImage(id, function(err, file) {
        if (err)
          onerror("Failed to upload picture " + id, err);
        if (!file)
          onerror("Picture " + id + " not in store");
      
        publishOneImage(baseURL, passkey, file, function(percentDone) {
          onprogress(baseProgress + progressPerImage * percentDone, id);
        }, function(entry) {
          var images = model.getMetadata();
          images[id].publishedURL = entry.url;
          images[id].publishedRevocationKey = entry.revocationKey;
          model.setMetadata(images);
          uploadNextImage();
        });
      });
    }
  
    uploadNextImage();
  };
  
  window.publishHTML = function publishHTML(hackpubURL, html, cb) {
    $.ajax({
      type: "POST",
      url: hackpubURL + "/publish",
      data: {
        'html': html,
        'original-url': window.location.href
      },
      dataType: 'json',
      error: function(req) {
        cb(req);
      },
      success: function(result) {
        var url = result['published-url'];
        var path = '/' + url.match(/\/([A-Za-z0-9]+)$/)[1];
        cb(null, {path: path, url: url});
      }
    });
  };
})();
