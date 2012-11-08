var Utils = {
  makeSquareThumbnail: function(dataURL, size, callback) {
    var canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    var image = new Image();
    image.src = dataURL;
    image.onload = function() {
      var ctx = canvas.getContext('2d');
      var sSize = image.height;
      if (image.width < image.height)
        sSize = image.width;
      ctx.drawImage(image, 0, 0, sSize, sSize, 0, 0, size, size);
      callback(canvas.toDataURL());
    };
  },
  megapixelize: function(file, orientation, cb) {
    var mpi = new MegaPixImage(file);
    var newImage = new Image();
    mpi.onrender = function(newImage) {
      cb(newImage.src);
    };
    mpi.render(newImage, {
      orientation: orientation,
      maxWidth: 1024,
      maxHeight: 1024
    });
  },
  // http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
  dataURLtoBlob: function(dataURI) {
    // doesn't handle URLEncoded DataURIs
    var parts = dataURI.match(/^data:([^;]+);base64,(.+)/);

    if (!parts)
      return null;

    var byteString = atob(parts[2]);
    var mimeString = parts[1];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++)
      ia[i] = byteString.charCodeAt(i);

    // write the ArrayBuffer to a blob, and you're done
    return new Blob([ab], {type: mimeString});
  },
  getExifInfo: function(arrayBuffer) {
    var oFile = new this.ArrayBufferBinaryFile(arrayBuffer);
    var exif = EXIF.readFromBinaryFile(oFile);
    if (exif === false)
      exif = null;
    return exif;
  },
  ArrayBufferBinaryFile: function ArrayBufferBinaryFile(buffer) {
    var dataView = new DataView(buffer);

    this.getByteAt = function(iOffset) {
      var result = dataView.getUint8(iOffset);
      //console.log("getByteAt", iOffset, result);
      return result;
    };

    this.getLength = function() {
      //console.log("getLength", buffer.byteLength);
      return buffer.byteLength;
    };

    this.getShortAt = function(iOffset, bBigEndian) {
      var result = dataView.getUint16(iOffset, !bBigEndian);
      //console.log("getShortAt", iOffset, bBigEndian);
      return result;
    };

    this.getLongAt = function(iOffset, bBigEndian) {
      var result = dataView.getUint32(iOffset, !bBigEndian);
      //console.log("getLongAt", iOffset, bBigEndian);
      return result;
    };

    this.getSLongAt = function(iOffset, bBigEndian) {
      var result = dataView.getInt32(iOffset, !bBigEndian);
      //console.log("getSLongAt", iOffset, bBigEndian);
      return result;
    };

    this.getStringAt = function(iOffset, iLength) {
      var chars = [];
      for (var i = iOffset; i < iOffset + iLength; i++)
        chars.push(String.fromCharCode(dataView.getUint8(i)));
      var result = chars.join('');
      //var result = dataView.getInt32(iOffset, !bBigEndian);
      //console.log("getStringAt", iOffset, iLength, result);
      return result;
    };
  }
};
