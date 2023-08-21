from flask import Flask, jsonify
from flask_restful import Api, Resource, reqparse
import requests
import os 
import ibm_db
import bcrypt
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
from flask_cors import CORS

app=Flask(__name__)
CORS(app)
api = Api(app)
bcrypt2 = Bcrypt(app)

# Establish a connection to the DB2 database
conn = ibm_db.connect('DATABASE=DATABASE_NAME; HOSTNAME=HOSTNAME; PORT=PORT_NUMBER; UID=USERNAME; PWD=PASSWORD; Security=SSL; SSLCertificate=DigiCertGlobalRootCA.crt','','')
connState = ibm_db.active(conn)
print (connState)


# Helper function to check if a user exists in the database
def user_exist(username):
    sql = f"SELECT COUNT(*) FROM users WHERE username = '{username}'"
    stmt = ibm_db.exec_immediate(conn, sql)
    result = ibm_db.fetch_assoc(stmt)
    return result['1']

#Resource for user registration
class Registration(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('firstname', type=str, required=True, help="First name is required")
        parser.add_argument("lastname",type=str,required=True,help="Last name is required")
        parser.add_argument('username', type=str, required=True, help="Username is required")
        parser.add_argument("password",type=str,required=True,help="Password is required")
        args = parser.parse_args()

        

        firstname = args['firstname']
        lastname = args['lastname']
        username = args['username']
        password = args['password']
        
        hashed_password = (bcrypt.hashpw(password.encode('utf-8'),bcrypt.gensalt()))
        string_password = hashed_password.decode('utf8')      
        print(string_password)


        if user_exist(username):
            return {"message": "User already exists"}, 400
        
        sql = f"INSERT INTO users (firstname, lastname, username, password) VALUES ('{firstname}','{lastname}','{username}','{string_password}')"
        stmt = ibm_db.exec_immediate(conn,sql)

        return {"message": "User registered successfully"}, 201
    

# Resource for login authentication and retrieving data from db using SQL query
class Login(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('username', type=str, required=True, help="Username is required")
        parser.add_argument("password",type=str,required=True,help="Password is required")
        args = parser.parse_args()

        username = args['username']
        password = args['password']

        if not user_exist(username):
            return {"message": "User not found"}, 404
        
        sql = f"SELECT * FROM users WHERE username = '{username}'"
        stmt = ibm_db.exec_immediate(conn,sql)
        result = ibm_db.fetch_assoc(stmt)

        print(password.encode('utf8'))
        print(result['PASSWORD'].encode('utf8'))
        print(bcrypt2.check_password_hash(result['PASSWORD'], password))
        # print(bcrypt.checkpw(password.encode('utf8'), result['PASSWORD'].encode('utf8')))

        if bcrypt2.check_password_hash(result['PASSWORD'], password):
        # if result['PASSWORD'] == password:
            return result,200
            # return {"message":"Login Successfull"},200
        else :
            return {"message": "Invalid Credentials"},401
        
# Add resources to the API with corresponding routes
api.add_resource(Registration,'/register') # Register route
api.add_resource(Login,'/login')         # Login Route


OPENCHARGEMAP_API_KEY = os.getenv("OPENCHARGEMAP_API_KEY")
OPENCHARGEMAP_API_BASE_URL = 'https://api.openchargemap.io/v3/poi/'


def fetch_charging_stations(latitude, longitude, max_results=10000):
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
