
const offerTypeInput =  document.getElementById("offerType");
const bannerTextInput =  document.getElementById("bannerText");
const couponNameInput =  document.getElementById("couponName");
const imagesInput = document.getElementById("bannerImage");


offerTypeInput.addEventListener("input", function () {
    if (this.value.trim() === "") {
      this.setCustomValidity("Please enter the offer type");
    } else {
      this.setCustomValidity("");
    }
  });


  bannerTextInput.addEventListener("input", function () {
    if (this.value.trim() === "") {
      this.setCustomValidity("Please enter the banner text");
    } else {
      this.setCustomValidity("");
    }
  });

  couponNameInput .addEventListener("input", function () {
    if (this.value.trim() === "") {
      this.setCustomValidity("Please enter the banner text");
    } else {
      this.setCustomValidity("");
    }
  });


  imagesInput.addEventListener("change", function () {
    const fileCount = this.files.length;
  
    if (fileCount === 0) {
      this.setCustomValidity("Please add the image files");
    } else {
      this.setCustomValidity("");
    }
  });

  


  