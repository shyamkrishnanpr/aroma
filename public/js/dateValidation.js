
const form = document.querySelector('form');
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');

form.addEventListener('submit', function(event) {
  event.preventDefault();
  
  const startDate = new Date(startDateInput.value);
  const endDate = new Date(endDateInput.value);

  if (isNaN(startDate.getTime())) {
    startDateInput.setCustomValidity('Please enter a valid start date');
    startDateInput.reportValidity();
    return;
  }

  

  if (startDate > endDate) {
    endDateInput.setCustomValidity('End date must be after start date');
    endDateInput.reportValidity();
    return;
  }

  form.submit();
});
