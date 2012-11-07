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
  getExifInfo: function(arrayBuffer) {
    var oFile = new this.ArrayBufferBinaryFile(arrayBuffer);
    return EXIF.readFromBinaryFile(oFile);
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
