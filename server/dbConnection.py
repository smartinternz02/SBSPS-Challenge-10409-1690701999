from flask import Flask, render_template,request
from flask_restful import Api, Resource, reqparse
import ibm_db
app = Flask(__name__)
api = Api(app)

# Establish a connection to the DB2 database
# SECURITY=SSL;SSLCertificate=DigiCertGlobalRootCA.crt;
conn = ibm_db.connect('DATABASE=bludb; HOSTNAME=fbd88901-ebdb-4a4f-a32e-9822b9fb237b.c1ogj3sd0tgtu0lqde00.databases.appdomain.cloud; PORT=32731; UID=mkz61721; PWD=4foCRQCQKktx2Gy7; Security=SSL; SSLCertificate=DigiCertGlobalRootCA.crt','','')
# print(conn)
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



        if user_exist(username):
            return {"message": "User already exists"}, 400
        
        sql = f"INSERT INTO users (firstname, lastname, username, password) VALUES ('{firstname}','{lastname}','{username}','{password}')"
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
        
        sql = f"SELECT password FROM users WHERE username = '{username}'"
        stmt = ibm_db.exec_immediate(conn,sql)
        result = ibm_db.fetch_assoc(stmt)

        if result['PASSWORD'] == password:
            return {"message":"Login Successfull"},200
        else :
            return {"message": "Invalid Credentials"},401
        
# Add resources to the API with corresponding routes
api.add_resource(Registration,'/register') # Register route
api.add_resource(Login,'/login')         # Login Route

if __name__ == "__main__":
    app.run(debug=True)