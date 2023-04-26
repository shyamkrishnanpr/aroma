const phoneRegex = /^[0-9]{10}$/;
  const pinRegex = /^[1-9][0-9]{5}$/;

 
  const phonenumberInput = document.getElementById("phonenumber");
  const housenameInput = document.getElementById("housename");
  const postofficeInput = document.getElementById("postoffice");
  const areaInput = document.getElementById("area");
  const districtInput = document.getElementById("district");
  const stateInput = document.getElementById("state");
  const pinInput = document.getElementById("pin");


  phonenumberInput.addEventListener("input", function () {
    if (!phoneRegex.test(this.value)) {
      this.setCustomValidity("Please enter a valid phone number");
    } else {
      this.setCustomValidity("");
    }
  });

  housenameInput.addEventListener("input", function () {
    if (this.value.trim() === "") {
      this.setCustomValidity("Please enter a house name");
    } else {
      this.setCustomValidity("");
    }
  });

  postofficeInput.addEventListener("input", function () {
    if (this.value.trim() === "") {
      this.setCustomValidity("Please enter a post office");
    } else {
      this.setCustomValidity("");
    }
  });

  areaInput.addEventListener("input", function () {
    if (this.value.trim() === "") {
      this.setCustomValidity("Please enter an area");
    } else {
      this.setCustomValidity("");
    }
  });

  districtInput.addEventListener("input", function () {
    if (this.value.trim() === "") {
      this.setCustomValidity("Please enter a district");
    } else {
      this.setCustomValidity("");
    }
  });

  stateInput.addEventListener("input", function () {
    if (this.value.trim() === "") {
      this.setCustomValidity("Please enter a state");
    } else {
      this.setCustomValidity("");
    }
  });

  pinInput.addEventListener("input", function () {
    if (!pinRegex.test(this.value)) {
      this.setCustomValidity("Please enter a valid pincode");
    } else {
      this.setCustomValidity("");
    }
  });