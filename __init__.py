from flask import Flask, render_template
from WebApps.Converter.converter import convert_bp

app = Flask(__name__)

app.register_blueprint(convert_bp)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)