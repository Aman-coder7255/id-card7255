 document.addEventListener('DOMContentLoaded', function() {
            const idCardForm = document.getElementById('idCardForm');
            const photoInput = document.getElementById('photo');
            const photoPreview = document.getElementById('photoPreview');
            const idCardTemplate = document.getElementById('idCardTemplate');
            const downloadImgBtn = document.getElementById('downloadImgBtn');
            const downloadPdfBtn = document.getElementById('downloadPdfBtn');
            const newCardBtn = document.getElementById('newCardBtn');
            const companyNameInput = document.getElementById('companyName');
            const idCardCompanyName = document.getElementById('idCardCompanyName');

            // Cropper elements
            const cropperModal = document.getElementById('cropperModal');
            const cropperImage = document.getElementById('cropperImage');
            const cropButton = document.getElementById('cropButton');
            const cancelCropButton = document.getElementById('cancelCrop');
            let cropper;
            let imageSrc;

            // Photo preview functionality
            photoInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    if (!file.type.match('image.*')) {
                        document.getElementById('photoError').textContent = 'Please select an image file';
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = function(event) {
                        imageSrc = event.target.result;
                        cropperImage.src = imageSrc;
                        cropperModal.style.display = 'block';

                        // Initialize Cropper.js
                        cropper = new Cropper(cropperImage, {
                            aspectRatio: 1 / 1, // Adjust as needed
                            viewMode: 1,
                            minCropBoxWidth: 100,
                            minCropBoxHeight: 100
                        });
                        document.getElementById('photoError').textContent = '';
                    };
                    reader.readAsDataURL(file);
                }
            });

            // Crop image functionality
            cropButton.addEventListener('click', function() {
                if (cropper) {
                    const croppedCanvas = cropper.getCroppedCanvas({
                        width: 200, // Adjust as needed
                        height: 200,
                    });
                    const croppedImage = document.createElement('img');
                    croppedImage.src = croppedCanvas.toDataURL('image/png');
                    croppedImage.style.maxWidth = '100%';
                    croppedImage.style.maxHeight = '100%';
                    photoPreview.innerHTML = '';
                    photoPreview.appendChild(croppedImage);

                    cropperModal.style.display = 'none';
                    cropper.destroy();
                    cropper = null;
                }
            });

            // Cancel crop functionality
            cancelCropButton.addEventListener('click', function() {
                cropperModal.style.display = 'none';
                if (cropper) {
                    cropper.destroy();
                    cropper = null;
                }
            });
            
            // Form validation
            function validateForm() {
                let isValid = true;
            
                // Validate name
                const fullName = document.getElementById('fullName').value.trim();
                if (!fullName) {
                    document.getElementById('nameError').textContent = 'Name is required';
                    isValid = false;
                } else {
                    document.getElementById('nameError').textContent = '';
                }
            
                // Validate ID number
                const idNumber = document.getElementById('idNumber').value.trim();
                if (!idNumber) {
                    document.getElementById('idError').textContent = 'ID Number is required';
                    isValid = false;
                } else {
                    document.getElementById('idError').textContent = '';
                }
            
                // Validate address
                const address = document.getElementById('address').value.trim();
                if (!address) {
                    document.getElementById('addressError').textContent = 'Address is required';
                    isValid = false;
                } else {
                    document.getElementById('addressError').textContent = '';
                }
            
                // Validate date of birth
                const dob = document.getElementById('dob').value;
                if (!dob) {
                    document.getElementById('dobError').textContent = 'Date of Birth is required';
                    isValid = false;
                } else {
                    document.getElementById('dobError').textContent = '';
                }
            
                // Validate photo
                const photo = document.getElementById('photo').files[0];
                if (!photo && !photoPreview.querySelector('img')) {
                    document.getElementById('photoError').textContent = 'Photo is required';
                    isValid = false;
                } else {
                    document.getElementById('photoError').textContent = '';
                }
            
                return isValid;
            }

            // Form submission
            idCardForm.addEventListener('submit', function(e) {
                e.preventDefault();

                if (!validateForm()) {
                    return;
                }
            
                // Get form values
                const companyName = companyNameInput.value;
                const fullName = document.getElementById('fullName').value;
                const idNumber = document.getElementById('idNumber').value;
                const address = document.getElementById('address').value;
                const dob = new Date(document.getElementById('dob').value)
                    .toLocaleDateString('en-US', {
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric'
                    });
            
                // Update ID card template
                idCardCompanyName.textContent = companyName || 'OFFICIAL ID CARD';
                document.getElementById('cardName').textContent = fullName;
                document.getElementById('cardId').textContent = idNumber;
                document.getElementById('cardDob').textContent = dob;
                document.getElementById('cardAddress').textContent = address;
            
                // Set photo
                const photoSrc = photoPreview.querySelector('img')?.src;
                document.getElementById('cardPhoto').src = photoSrc || '';
            
                // Show the ID card template
                idCardForm.style.display = 'none';
                idCardTemplate.classList.remove('hidden');
            });

            // Download as image functionality
            downloadImgBtn.addEventListener('click', function() {
                const idCard = document.querySelector('.id-card');
            
                html2canvas(idCard).then(canvas => {
                    // Create a temporary link for downloading the image
                    const link = document.createElement('a');
                    link.download = 'id-card.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                });
            });

            // Download as PDF functionality
            downloadPdfBtn.addEventListener('click', function() {
                const idCard = document.querySelector('.id-card');
            
                html2canvas(idCard).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                
                    // Initialize jsPDF
                    const { jsPDF } = window.jspdf;
                    const pdf = new jsPDF({
                        orientation: 'landscape',
                        unit: 'mm',
                        format: [85, 54] // Standard ID card size
                    });
                
                    // Calculate the positioning for the image to be centered
                    const imgProps = pdf.getImageProperties(imgData);
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    const imgWidth = pdfWidth;
                    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
                
                    // Add the image to the PDF
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                
                    // Download the PDF
                    pdf.save('id-card.pdf');
                });
            });

            // Create new card button
            newCardBtn.addEventListener('click', function() {
                idCardForm.reset();
                photoPreview.innerHTML = '';
                idCardTemplate.classList.add('hidden');
                idCardForm.style.display = 'block';
            });
        });