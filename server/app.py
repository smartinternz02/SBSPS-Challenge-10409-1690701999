from flask import Flask, jsonify, request
from flask_restful import Api, Resource, reqparse
import requests
import os 
import ibm_db
import bcrypt
# from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
from flask_cors import CORS

app=Flask(__name__)
CORS(app)
api = Api(app)
# bcrypt2 = Bcrypt(app)

# Establish a connection to the DB2 database
conn = ibm_db.connect('DATABASE=bludb; HOSTNAME=fbd88901-ebdb-4a4f-a32e-9822b9fb237b.c1ogj3sd0tgtu0lqde00.databases.appdomain.cloud; PORT=32731; UID=mkz61721; PWD=4foCRQCQKktx2Gy7; Security=SSL; SSLCertificate=DigiCertGlobalRootCA.crt','','')
connState = ibm_db.active(conn)
print (connState)


# Helper function to check if a user exists in the database
def user_exist(username):
    sql = f"SELECT COUNT(*) FROM users WHERE username = '{username}'"
    stmt = ibm_db.exec_immediate(conn, sql)
    result = ibm_db.fetch_assoc(stmt)
    return result['1']

#Resource for user registration
@app.route('/register', methods=['POST'])
def registration():
    data = request.json  # Get the JSON data from the request body
    firstname = data.get('firstname')
    lastname = data.get('lastname')
    username = data.get('username')
    password = data.get('password')

    # Check if the user already exists
    if user_exist(username):
        return jsonify({"message": "User already exists"}), 400

    # Hash the password using bcrypt
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    string_password = hashed_password.decode('utf8')
    
    # Insert user data into the database
    sql = f"INSERT INTO users (firstname, lastname, username, password) VALUES ('{firstname}','{lastname}','{username}','{string_password}')"
    stmt = ibm_db.exec_immediate(conn, sql)

    return jsonify({"message": "User registered successfully"}), 201



# Resource for login authentication and retrieving data from db using SQL query
@app.route('/login', methods=['POST'])
def login():
    data = request.json  # Get the JSON data from the request body
    username = data.get('username')
    password = data.get('password')
    
    # Use your own function to check if the user exists in the database
    if not user_exist(username):
        return jsonify({"message": "User not found"}), 404

    # Replace this SQL query with your actual SQL query to retrieve user data
    sql = f"SELECT * FROM users WHERE username = '{username}'"
    stmt = ibm_db.exec_immediate(conn, sql)
    result = ibm_db.fetch_assoc(stmt)

    # Check the password using bcrypt
    if bcrypt.checkpw(password.encode('utf8'), result['PASSWORD'].encode('utf8')):
        return jsonify(result), 200
    else:
        return jsonify({"message": "Invalid Credentials"}), 401


OPENCHARGEMAP_API_KEY = os.getenv("OPENCHARGEMAP_API_KEY")
OPENCHARGEMAP_API_BASE_URL = 'https://api.openchargemap.io/v3/poi/'


def fetch_charging_stations(latitude, longitude, max_results=100):
    url = f"{OPENCHARGEMAP_API_BASE_URL}?latitude={latitude}&longitude={longitude}&distance=2000&maxresults={max_results}&compact=true&verbose=false&key={OPENCHARGEMAP_API_KEY}"
    response= requests.get(url)
    return response.json()

@app.route('/charging-stations')
def charging_stations():
    latitude = 12.971599 #40.7128
    longitude = 77.594566 #-74.0060
    charging_stations_data = fetch_charging_stations(latitude,longitude)
    return jsonify(charging_stations_data)

if __name__=="__main__":
    app.run(debug=True)
