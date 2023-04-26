const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;




  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");


  emailInput.addEventListener("input", function () {
    if (!emailRegex.test(this.value)) {
      this.setCustomValidity("Please enter a valid email address");
    } else {
      this.setCustomValidity("");
    }
  });



  passwordInput.addEventListener("input", function () {
    if (this.value.trim() === "") {
      this.setCustomValidity("Please enter a password");
    } else {
      this.setCustomValidity("");
    }
  });

