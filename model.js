function MSM_Model(options) {
  var self = this;
  var prefix = options.name || "msm";
  var onerror = options.onerror || function(name, err) {
    if (window.console && console.error)
      console.error("MSM_Model", name, err);
  };
  var thumbnailSize = options.thumbnailSize || 32;
  var onready = options.onready || function() {};
  var store = null;
  
  function fillExifMetadata(file, metadata, cb) {
    var reader = new FileReader();
    reader.onload = function(event) {      
      var exif = Utils.getExifInfo(event.target.result);
      metadata.orientation = exif && exif.Orientation;
      cb(null);
    };
    reader.readAsArrayBuffer(file);
  }
  
  function namespace(name) {
    return prefix + '_' + name;
  }
  
  function saveState(state) {
    localStorage.setItem(namespace("state"), JSON.stringify(state));
  }

  function loadState() {
    function initState() {
      var defaultState = {images: {}};
      saveState(defaultState);
      return defaultState;
    }

    try {
      state = JSON.parse(localStorage.getItem(namespace("state")));
      if (!state)
        throw new Error("state is falsy");
    } catch (e) {
      // reset because of error
      state = initState();
    }
    return state;
  }
  
  function init() {
    DataURIStore.create(namespace("images"), function(err, aStore) {
      if (err)
        return onerror.call(self, "DATASTORE_CREATE_FAILURE", err);
      store = aStore;
      onready.call(self);
    });
  }

  self.getState = function() {
    return loadState();
  };
  
  self.addImage = function(file, cb) {
    var metadata = {};
    fillExifMetadata(file, metadata, function(err) {
      if (err)
        return cb(err);
      var reader = new FileReader();
      reader.onload = function(event) {
        var dataURL = event.target.result;
        Utils.makeSquareThumbnail(dataURL, thumbnailSize, function(tDataURL) {
          metadata.itemImgURL = tDataURL;
          store.put(dataURL, function(err, id) {
            if (err)
              return cb(err);
            var state = loadState();
            state.images[id] = metadata;
            saveState(state);
            cb(null, id);
          });
        });
      };
      reader.readAsDataURL(file);
    });
  };
  
  self.done = function() {
    store.done();
    store = null;
  };
  
  init();
  
  return self;
}
