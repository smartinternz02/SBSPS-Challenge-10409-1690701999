from flask import Flask, render_template,request
import ibm_db
app = Flask(__name__)

# SECURITY=SSL;SSLCertificate=DigiCertGlobalRootCA.crt;
conn = ibm_db.connect('DATABASE=DB_NAME; HOSTNAME=HOST_NAME; PORT=PORT_NO; UID=USER_ID; PWD=PASSWORD','','')
connState = ibm_db.active(conn)
print (connState)

@app.route("/index")
def index():
    return render_template("index.html")
    # return send_from_directory('C:/Users/adhar/Desktop/Plug and Power/client/src/pages', 'SignIn.js')

if __name__ == "__main__":
    app.run(debug=True)
