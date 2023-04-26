 


const couponNameInput = document.getElementById("couponName");
const discountInput = document.getElementById("discount");
const minLimitInput = document.getElementById("minLimit");
const maxLimitInput = document.getElementById("maxLimit");
const expirationTimeInput = document.getElementById("expirationTime")

couponNameInput.addEventListener("input", function () {
    if (this.value.trim() === "") {
      this.setCustomValidity("Please enter the coupon code");
    } else {
      this.setCustomValidity("");
    }
  });

  discountInput.addEventListener("input", function () {
    const discountValue = parseFloat(this.value);
    if (isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
      this.setCustomValidity("Please enter a valid discount percentage");
    } else {
      this.setCustomValidity("");
    }
  });


minLimitInput.addEventListener("input", function () {
    const minLimit = parseFloat(this.value.trim());
  
    if (isNaN(minLimit) || minLimit <= 0) {
      this.setCustomValidity("Please enter a valid amount");
    } else {
      this.setCustomValidity("");
    }
  });
  

  maxLimitInput.addEventListener("input", function () {
    const maxLimit = parseFloat(this.value.trim());
  
    if (isNaN(maxLimit) || maxLimit <= 0) {
      this.setCustomValidity("Please enter a valid amount");
    } else {
      this.setCustomValidity("");
    }
  });

expirationTimeInput.addEventListener("input", function () {
    const expirationDate = new Date(this.value.trim());
    const currentDate = new Date();
  
    if (expirationDate < currentDate) {
      this.setCustomValidity("Expiration date must be in the future");
    } else {
      this.setCustomValidity("");
    }
  });






