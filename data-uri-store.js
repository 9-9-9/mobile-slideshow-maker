(function() {
  var exports = {};

  exports.create = function(name, cb) {
    var request = indexedDB.open(name, 1);
    var db;
    
    request.onerror = function(event) { cb("indexedDB.open() ERROR"); };
    
    request.onsuccess = function(event) {
      db = event.target.result;
      
      cb(null, {
        done: function() {
          db.close();
        },
        delete: function(id, cb) {
          var request = db.transaction(["dataURLs"], "readwrite")
            .objectStore("dataURLs").delete(id);
          request.onsuccess = function(event) {
            cb(null);
          };
          request.onerror = function(event) {
            cb("objectStore.delete() ERROR");
          };
        },
        put: function(dataURL, cb) {
          var request = db.transaction(["dataURLs"], "readwrite")
            .objectStore("dataURLs").add({dataURL: dataURL});
          request.onsuccess = function(event) {
            cb(null, event.target.result);
          };
          request.onerror = function(event) {
            cb("objectStore.add() ERROR");
          };
        },
        get: function(id, cb) {
          var request = db.transaction(["dataURLs"], "readonly")
            .objectStore("dataURLs").get(id);
          request.onsuccess = function(event) {
            if (request.result)
              cb(null, request.result.dataURL);
            else
              cb(null, null);
          };
          request.onerror = function(event) {
            cb("objectStore.get() ERROR");
          };
        }
      });
    };
    
    request.onupgradeneeded = function(event) {
      db = event.target.result;
      
      var objectStore = db.createObjectStore("dataURLs", {
        keyPath: "id",
        autoIncrement: true
      });
    };
  };
  
  exports.destroy = function(name, cb) {
    var result = indexedDB.deleteDatabase(name);
    result.onsuccess = function() { cb(null); };
    result.onerror = function() { cb("ERROR"); };
  };
  
  window.DataURIStore = exports;
})();
