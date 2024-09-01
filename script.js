function convertToPDF() {
    const { jsPDF } = window.jspdf;
    const input = document.getElementById('fileInput');
    const files = input.files;
    const pdf = new jsPDF();
    let promises = [];
  
    if (files.length === 0) {
      alert("Please select one or more images to convert.");
      return;
    }
  
    document.getElementById('progressContainer').style.display = 'block';
    const progressBar = document.getElementById('progressBar');
    const progressPercentage = document.getElementById('progressPercentage');
    const successMessage = document.getElementById('successMessage');
    
    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      let img = new Image();
      let reader = new FileReader();
      let promise = new Promise((resolve, reject) => {
        reader.onload = function (e) {
          img.src = e.target.result;
          img.onload = function () {
            let pageWidth = pdf.internal.pageSize.getWidth();
            let pageHeight = pdf.internal.pageSize.getHeight();
            let imgWidth = img.width;
            let imgHeight = img.height;
  
            // Determine the scale to fit the image properly on the page
            let scale = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
            let x = (pageWidth - imgWidth * scale) / 2;
            let y = (pageHeight - imgHeight * scale) / 2;
            
            if (i > 0) pdf.addPage();
            pdf.addImage(img, 'JPEG', x, y, imgWidth * scale, imgHeight * scale);
            resolve();
          };
          img.onerror = function() {
            alert("Error loading image. Please try again.");
            reject();
          };
        };
        reader.readAsDataURL(file);
      });
      promises.push(promise);
    }
  
    let completed = 0;
    promises.forEach(p => p.then(() => {
      completed++;
      const percentage = Math.round((completed / files.length) * 100);
      progressBar.value = percentage;
      progressPercentage.textContent = `${percentage}%`;
    }));
  
    Promise.all(promises).then(() => {
      progressBar.value = 100;
      progressPercentage.textContent = "100%";
      successMessage.style.display = 'block';
      
      const downloadLink = document.getElementById('downloadLink');
      downloadLink.style.display = 'inline';
      downloadLink.href = pdf.output('bloburl');
      downloadLink.download = 'converted.pdf';
    }).catch(error => {
      console.error("Error during conversion:", error);
    });
  }
  