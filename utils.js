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
  }
};
