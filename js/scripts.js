window.onload = function () {

  // Слайдер до и после
  if ($('.twentytwentySlider').length) {
    $(".twentytwentySlider").twentytwenty({
      no_overlay: true,
      click_to_move: true,
    });
  }

  // Редактор изображениея 
  let image = document.getElementById('editImg');
  if (image) {
    let ratio = eval(image.dataset.ratio);
    let zoomIn = document.getElementById('zoomIn');
    let zoomOut = document.getElementById('zoomOut');
    let rotateRight = document.getElementById('rotateRight');
    let rotateLeft = document.getElementById('rotateLeft');
    let inputImage = document.getElementById('inputImage');
    let reverse = document.getElementById('reverse');
    let uploadedImageURL;
    let options = {
      aspectRatio: ratio,
      viewMode: 1,
      guides: false,
      zoomOnWheel: true,
      dragMode: 'move',
      cropBoxMovable: false,
      cropBoxResizable: false,
      autoCropArea: 1,
      toggleDragModeOnDblclick: false,
    }
    let optionsReverse = {
      aspectRatio: 4 / 3,
      viewMode: 1,
      guides: false,
      zoomOnWheel: true,
      dragMode: 'move',
      cropBoxMovable: false,
      cropBoxResizable: false,
      autoCropArea: 1,
      toggleDragModeOnDblclick: false,
    }
    let cropper = new Cropper(image, options);
    // Загрузка изображения
    if (URL) {
      inputImage.onchange = function () {
        var files = this.files;
        var file;

        if (files && files.length) {
          file = files[0];

          if (/^image\/\w+/.test(file.type)) {
            uploadedImageType = file.type;
            uploadedImageName = file.name;

            if (uploadedImageURL) {
              URL.revokeObjectURL(uploadedImageURL);
            }

            image.src = uploadedImageURL = URL.createObjectURL(file);

            if (cropper) {
              cropper.destroy();
            }

            cropper = new Cropper(image, options);
            inputImage.value = null;
          } else {
            window.alert('Пожалуйста загрузите файл изображения');
          }
        }
      };
    } else {
      inputImage.disabled = true;
      inputImage.parentNode.className += ' disabled';
    }
    // Увеличение
    zoomIn.addEventListener('click', function () {
      cropper.zoom(0.2);
    });
    // Уменьшение
    zoomOut.addEventListener('click', function () {
      cropper.zoom(-0.2);
    });
    // Поворот по часовой
    rotateRight.addEventListener('click', function () {
      cropper.rotate(10);
    });
    // Поворот против часовой
    rotateLeft.addEventListener('click', function () {
      cropper.rotate(-10);
    });
    // Поровот (вертикальная, горизонтальная)
    reverse.addEventListener('click', function () {
      if (!reverse.classList.contains('active')) {
        // cropper.setAspectRatio(4/3);
        // cropper.reset();
        cropper.destroy();
        cropper = new Cropper(image, optionsReverse);
        reverse.classList.add('active');
      } else {
        // cropper.setAspectRatio(ratio);
        // cropper.reset();
        cropper.destroy();
        cropper = new Cropper(image, options);
        reverse.classList.remove('active');
      }
    });
  }

}