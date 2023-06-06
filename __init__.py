from flask import Flask, render_template
from WebApps.Converter.converter import convert_bp
import os
import shutil
import time
import threading

app = Flask(__name__)

app.register_blueprint(convert_bp)

@app.route('/')
def index():
    return render_template('index.html')

# function to delete old folders in the temp directory
def delete_old_folders():
    while True:
        # get a list of directories in the temp folder
        try:
            directories = [d for d in os.listdir('temp') if os.path.isdir(os.path.join('temp', d))]
        except:
            os.mkdir('temp')

        # iterate through each directory and check if it is older than 5 minutes
        for directory in directories:
            path = os.path.join('temp', directory)
            if time.time() - os.path.getctime(path) > 300:
                # directory is older than 5 minutes, delete it
                shutil.rmtree(path)
                print(f"Deleted directory {path}")

        # wait for 1 minute before checking again
        time.sleep(60)

if __name__ == "__main__":
    # start the thread to delete old folders
    folder_cleanup_thread = threading.Thread(target=delete_old_folders)
    folder_cleanup_thread.daemon = True
    folder_cleanup_thread.start()

    app.run(debug=True, host='0.0.0.0', port=5000)