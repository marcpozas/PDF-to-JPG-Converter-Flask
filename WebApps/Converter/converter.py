import shutil
from flask import Flask, render_template, request, redirect, url_for, send_file, Blueprint
from wand.image import Image
from wand.color import Color
import zipfile
import io
import os
import tempfile


convert_bp = Blueprint('converter', __name__, url_prefix='/converter')

@convert_bp.route('/pdf_to_jpg', methods=['POST'])
def convert_pdf_to_images(image_format='jpg'):

    print(request.files)

    PDF_files = []

    if 'pdf_files[]' in request.files:
        PDF_files = request.files.getlist('pdf_files[]')
    elif 'pdf_files' in request.files:
        PDF_files.append(request.files['pdf_files'])

    resolution = min(int(request.form['resolution']), 300)  #resolution <= 300
    resolution = max(resolution, 100)                       #resolution >= 100
                                                            #100 <= resolution <= 300
    # Create a temporary directory to store the converted images for each PDF
    temp_dir = tempfile.mkdtemp(dir='temp')
    print(temp_dir)

    for PDF_file in PDF_files:
        print(PDF_file.filename)
        PDF_name, PDF_extension = os.path.splitext(PDF_file.filename)
        PDF_dir = os.path.join(temp_dir, PDF_name)  # Create a directory for the current PDF

        # Creating folder for PDF
        try:
            os.mkdir(PDF_dir)
        except FileExistsError:
            i = 1
            while True:
                try:
                    os.mkdir(f"{PDF_dir}_({i})")
                    PDF_dir = f"{PDF_dir}_({i})"
                    break
                except FileExistsError:
                    i += 1

        # Open the PDF file using Wand
        with Image(file=PDF_file, resolution=resolution) as pdf:
            # Iterate through each page in the PDF
            for i, page in enumerate(pdf.sequence):
                # Convert the page to an image
                with Image(page) as image:
                    # Set the background color to white (optional)
                    image.background_color = Color('white')
                    # Flatten the image so that it is in RGB format
                    image.alpha_channel = 'remove'
                    # Set the filename for the image (e.g. "page_1.png")
                    filename = f"page_{i+1}.{image_format}"
                    # Save the image to the PDF directory
                    image.save(filename=os.path.join(PDF_dir, filename))
                    print(f"Saving images to: {os.path.join(PDF_dir, filename)}")

    # Create a ZIP file containing the PDF directories
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, mode='w') as zip_file:
        for PDF_dir in os.listdir(temp_dir):
            print(os.listdir(os.path.join(temp_dir, PDF_dir)))
            for file_name in os.listdir(os.path.join(temp_dir, PDF_dir)):
                file_path = os.path.join(temp_dir, PDF_dir, file_name)
                zip_file.write(file_path, arcname=os.path.join(PDF_dir, file_name))
        
        # Close the zip file to ensure that it is properly flushed
        zip_file.close()

    # Set the buffer's cursor to the beginning
    zip_buffer.seek(0)

    # Clean up the temporary directory
    shutil.rmtree(temp_dir)

    # Send the ZIP file to the user
    return send_file(zip_buffer, mimetype='application/zip', as_attachment=True, download_name='converted_images.zip')








#@convert_bp.route('/pptx_to_pdf', methods=['POST'])
#def pptx_to_pdf():
#    return 'pptx_to_pdf'

'''
@convert_bp.route('/pdf_to_jpg', methods=['POST'])
def pdf_to_jpg():
    # get the uploaded file
    file = request.files['file']

    # convert PDF to JPG
    with Image(file=file, resolution=150) as img:
        img.format = 'jpg'
        img.compression_quality = 80
        img.save(filename='output.jpg')
    
    # return the converted file to the user
    return send_file('output.jpg', as_attachment=True)
'''