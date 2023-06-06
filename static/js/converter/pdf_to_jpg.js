function handleDragOver(event) {
    event.preventDefault();
    document.querySelector('.dropzone').classList.add('dragover');
}

function handleDrop(event) {
    event.stopPropagation();
    event.preventDefault();
    document.querySelector('.dropzone').classList.remove('dragover');

    var files = event.dataTransfer.files;

    var pdfFileInput = document.getElementById('pdf_file');
    const dataTransfer = new DataTransfer();

    for (let i = 0; i < pdfFileInput.files.length; i++) {
      dataTransfer.items.add(pdfFileInput.files[i]);
    }
  
    for (let i = 0; i < files.length; i++) {
      dataTransfer.items.add(files[i]);
    }
  
    const newFileList = dataTransfer.files;
  
    pdfFileInput.files = newFileList;

    pdfFileInput.dispatchEvent(new Event('change'));
}

function handleDragLeave(event) {
    event.preventDefault();
    document.querySelector('.dropzone').classList.remove('dragover');
}

const PDF_container_info = document.querySelector(".PDF_container_info");
PDF_container_info.addEventListener("click", deleteFile);

const DarkModeButton = document.querySelector(".img_dark-mode");
DarkModeButton.addEventListener("click", switchDarkMode);

const fileInput = document.getElementById('pdf_file');

fileInput.addEventListener('change', (event) => {
    const files = event.target.files;
    console.log(files); // logs an array of File objects

    // loop through the array of files and log their name and size
    for (const file of files) {
      console.log(`File name: ${file.name}, size: ${(file.size / 1048576).toFixed(2)} MB`);
    }

    const dropzone = document.querySelector('.dropzone');
    //dropzone.innerHTML += '<div class="PDF_container_info"></div>';
    const PDF_container = dropzone.querySelector(".PDF_container_info");
    PDF_container.innerHTML = '';

    for (const file of files) {
        PDF_container.innerHTML += '<div class="PDF_info"></div>';

        const PDF_actual_container = PDF_container.lastElementChild;

        PDF_actual_container.innerHTML += `<div class="PDF_name"><p class="PDF_p">${file.name}</p></div>`;

        PDF_actual_container.innerHTML += `<div class="PDF_size"><p class="PDF_p">${(file.size / 1000000).toFixed(2)} MB</p></div>`;

        const removeButton = document.createElement('button');
        removeButton.classList.add('PDF_button');
        removeButton.setAttribute('type', 'button');

        PDF_actual_container.appendChild(removeButton);
    }
});

function deleteFile(e) {
    const file = e.target;
    if (file.classList[0] === "PDF_button") {
        const info = file.parentElement;
        
        removeFromFileList(info.querySelector(".PDF_name").textContent);

        info.remove();
    }

}

function removeFromFileList(PDF_name) {
    const fileInput = document.getElementById('pdf_file');
    const newFileList = new DataTransfer();
    var removed = false;

    for (const file of fileInput.files) {
        if (file.name != PDF_name || removed) {
            newFileList.items.add(file);
        } else {
            removed = true;
        }
    }
    fileInput.files = newFileList.files;
}



const form = document.querySelector('.form');
form.addEventListener('submit', (event) => {
  // Prevent the default form submission behavior
  event.preventDefault();

  // Submit the form
  form.submit();

  // Clear the PDF_container_info element
  const PDF_container = document.querySelector('.PDF_container_info');
  PDF_container.innerHTML = '';

  // Clear the file input element
  const fileInput = document.getElementById('pdf_file');
  fileInput.value = '';

  // Create a new DataTransfer object to replace the old one
  const newFileList = new DataTransfer();
  fileInput.files = newFileList.files;
  

});

const convertButton = document.querySelector('.convertButton');
convertButton.addEventListener('click', (event) => {
    const data = new FormData();
    const files = document.querySelector('input[type="file"]').files;
    
    for (let i = 0; i < files.length; i++) {
        data.append('pdf_files[]', files[i]);
    }

    data.append('resolution', document.querySelector('#resolution').value);

    fetch("/converter/pdf_to_jpg", {
        method: 'POST',
        body: data
    })
    .then(response => {
        if (response.ok) {
            console.log(response);
            console.log(response.headers.get('Content-Disposition'));
            return response.blob();
        } else {
            throw new Error('Network response was not ok');
        }
    })
    .then(blob => {
        saveAs(blob, 'converted_images.zip');
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
    
});

function switchDarkMode(e) {
    console.log(e.target.classList);
    
    const dmButton = document.querySelector('.img_dark-mode');

    const navOptions = document.querySelectorAll('.a_nav');
    const h1 = document.querySelector('.h1');
    const container = document.querySelector('.container');
    const nav = document.querySelector('.nav');
    const dropzone = document.querySelector('.dropzone');
    const resolutionLabel = document.querySelector('.resolutionLabel');
    const convertButton = document.querySelector('.convertButton');

    if (!e.target.classList.contains("dm_on")) {

        navOptions.forEach(element => element.classList.add("a_nav_dm"));
        h1.classList.add('h1_dm');
        container.classList.add("container_dm");
        nav.classList.add("nav_dm");
        dropzone.classList.add("dropzone_dm");
        resolutionLabel.classList.add("resolutionLabel_dm");
        convertButton.classList.add("convertButton_dm");

        dmButton.classList.add("dm_on");

    } else {
        navOptions.forEach(element => element.classList.remove("a_nav_dm"));
        h1.classList.remove('h1_dm');
        container.classList.remove("container_dm");
        nav.classList.remove("nav_dm");
        dropzone.classList.remove("dropzone_dm");
        resolutionLabel.classList.remove("resolutionLabel_dm");
        convertButton.classList.remove("convertButton_dm");

        dmButton.classList.remove("dm_on");
    }
}