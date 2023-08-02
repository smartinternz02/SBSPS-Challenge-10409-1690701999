from flask import Flask, render_template,request
import ibm_db
app = Flask(__name__)

# SECURITY=SSL;SSLCertificate=DigiCertGlobalRootCA.crt;
conn = ibm_db.connect('DATABASE=bludb; HOSTNAME=fbd88901-ebdb-4a4f-a32e-9822b9fb237b.c1ogj3sd0tgtu0lqde00.databases.appdomain.cloud; PORT=32731; UID=mkz61721; PWD=4foCRQCQKktx2Gy7','','')
connState = ibm_db.active(conn)
print (connState)

@app.route("/index")
def index():
    return render_template("index.html")
    # return send_from_directory('C:/Users/adhar/Desktop/Plug and Power/client/src/pages', 'SignIn.js')

if __name__ == "__main__":
    app.run(debug=True)