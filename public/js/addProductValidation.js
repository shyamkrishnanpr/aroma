

const productNameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const descriptionInput = document.getElementById("description");
const brandInput = document.getElementById("brand");
const stockInput = document.getElementById("stock");
const sizeInput = document.getElementById("size");
const imagesInput = document.getElementById("images");
const categoryInput = document.getElementById("category-select");
const subCategoryInput = document.getElementById("subCategory-select");


productNameInput.addEventListener("input", function () {
    if (this.value.trim() === "") {
      this.setCustomValidity("Please enter a product name");
    } else {
      this.setCustomValidity("");
    }
  });
  
  priceInput.addEventListener("input", function () {
    const price = parseFloat(this.value.trim());
  
    if (isNaN(price) || price <= 0) {
      this.setCustomValidity("Please enter a valid price");
    } else {
      this.setCustomValidity("");
    }
  });
    
descriptionInput.addEventListener("input", function () {
    if (this.value.trim() === "") {
      this.setCustomValidity("Please enter a description");
    } else {
      this.setCustomValidity("");
    }
  });

brandInput.addEventListener("input", function () {
    if (this.value.trim() === "") {
      this.setCustomValidity("Please enter a brand ");
    } else {
      this.setCustomValidity("");
    }
  });

  stockInput.addEventListener("input", function () {
    const stock = parseInt(this.value.trim());
  
    if (isNaN(stock) || stock <= 0) {
      this.setCustomValidity("Please enter a valid number");
    } else {
      this.setCustomValidity("");
    }
  });

sizeInput.addEventListener("input", function () {
    if (this.value.trim() === "") {
      this.setCustomValidity("Please enter a size ");
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

categoryInput.addEventListener("input", function () {
    if (this.value.trim() === "") {
      this.setCustomValidity("Please select the category ");
    } else {
      this.setCustomValidity("");
    }
  });

subCategoryInput.addEventListener("input", function () {
    if (this.value.trim() === "") {
      this.setCustomValidity("Please select the category ");
    } else {
      this.setCustomValidity("");
    }
  });








