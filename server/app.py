from flask import Flask, jsonify, request
from flask_restful import Api, Resource, reqparse
import requests
import os 
import ibm_db
import bcrypt
from dotenv import load_dotenv
from flask_cors import CORS
import json

app=Flask(__name__)
CORS(app)
api = Api(app)


# Establish a connection to the DB2 database
conn = ibm_db.connect('DATABASE=bludb; HOSTNAME=fbd88901-ebdb-4a4f-a32e-9822b9fb237b.c1ogj3sd0tgtu0lqde00.databases.appdomain.cloud; PORT=32731; UID=mkz61721; PWD=4foCRQCQKktx2Gy7; Security=SSL; SSLCertificate=DigiCertGlobalRootCA.crt','','')
connState = ibm_db.active(conn)


OPENCHARGEMAP_API_KEY = os.getenv("OPENCHARGEMAP_API_KEY")
OPENCHARGEMAP_API_BASE_URL = 'https://api.openchargemap.io/v3/poi/'

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





# Function to fetch and update data from the API
def fetch_and_update_data():
    # Fetch data from the OpenChargeMap referencedata endpoint
    referencedata_url = f'https://api.openchargemap.io/v3/referencedata?key={OPENCHARGEMAP_API_KEY}'
    referencedata_response = requests.get(referencedata_url)
    referencedata = referencedata_response.json()
    # print(referencedata)

    # Check if ChargerTypes table exists, create if not
    charger_types_table_check_sql = "SELECT COUNT(*) FROM sysibm.systables WHERE name = 'CHARGERTYPES'"
    stmt = ibm_db.exec_immediate(conn, charger_types_table_check_sql)
    result = ibm_db.fetch_assoc(stmt)
    charger_types_table_exists = result['1'] > 0
    # print(charger_types_table_exists)

    if not charger_types_table_exists:
        # Create ChargerTypes table if it doesn't exist
        charger_types_table_create_sql = """
        CREATE TABLE ChargerTypes (
            ID INT PRIMARY KEY NOT NULL,
            Comments VARCHAR(255),
            IsFastChargeCapable BOOLEAN,
            Title VARCHAR(255)
        )
        """
        ibm_db.exec_immediate(conn, charger_types_table_create_sql)

    # Check if ConnectionTypes table exists, create if not
    connection_types_table_check_sql = "SELECT COUNT(*) FROM sysibm.systables WHERE name = 'CONNECTIONTYPES'"
    stmt = ibm_db.exec_immediate(conn, connection_types_table_check_sql)
    result = ibm_db.fetch_assoc(stmt)
    connection_types_table_exists = result['1'] > 0

    if not connection_types_table_exists:
        # Create ConnectionTypes table if it doesn't exist
        connection_types_table_create_sql = """
        CREATE TABLE ConnectionTypes (
            ID INT PRIMARY KEY NOT NULL,
            FormalName VARCHAR(255),
            IsDiscontinued BOOLEAN,
            IsObsolete BOOLEAN,
            Title VARCHAR(255)
        )
        """
        ibm_db.exec_immediate(conn, connection_types_table_create_sql)

    # Insert or update data in ChargerTypes table
    for charger_type in referencedata['ChargerTypes']:
        charger_type_id = charger_type['ID']
        charger_type_insert_update_sql = f"""
        MERGE INTO ChargerTypes AS target
        USING (SELECT {charger_type_id} AS ID, '{charger_type["Comments"]}' AS Comments, {charger_type["IsFastChargeCapable"]} AS IsFastChargeCapable, '{charger_type["Title"]}' AS Title FROM sysibm.sysdummy1) AS source
        ON target.ID = source.ID
        WHEN MATCHED THEN
            UPDATE SET Comments = source.Comments,
                       IsFastChargeCapable = source.IsFastChargeCapable,
                       Title = source.Title
        WHEN NOT MATCHED THEN
            INSERT (ID, Comments, IsFastChargeCapable, Title)
            VALUES (source.ID, source.Comments, source.IsFastChargeCapable, source.Title)
        """
        ibm_db.exec_immediate(conn, charger_type_insert_update_sql)

# Insert or update data in ConnectionTypes table
    for connection_type in referencedata['ConnectionTypes']:
        connection_type_id = connection_type['ID']
        
        # Handle potential None values for other fields
        formal_name = connection_type.get("FormalName", "")  # Provide an empty string as a default value
        is_discontinued = connection_type.get("IsDiscontinued", False)  # Provide False as a default value
        is_obsolete = connection_type.get("IsObsolete", False)  # Provide False as a default value
        title = connection_type.get("Title", "")  # Provide an empty string as a default value
        
        # Convert boolean values to integers (0 or 1) to match DB2 BOOLEAN data type
        is_discontinued = int(is_discontinued) if is_discontinued is not None else 0
        is_obsolete = int(is_obsolete) if is_obsolete is not None else 0
        
        connection_type_insert_update_sql = f"""
        MERGE INTO ConnectionTypes AS target
        USING (
            SELECT
                {connection_type_id} AS ID,
                '{formal_name}' AS FormalName,
                {is_discontinued} AS IsDiscontinued,
                {is_obsolete} AS IsObsolete,
                '{title}' AS Title
            FROM sysibm.sysdummy1
        ) AS source
        ON target.ID = source.ID
        WHEN MATCHED THEN
            UPDATE SET
                FormalName = source.FormalName,
                IsDiscontinued = source.IsDiscontinued,
                IsObsolete = source.IsObsolete,
                Title = source.Title
        WHEN NOT MATCHED THEN
            INSERT (ID, FormalName, IsDiscontinued, IsObsolete, Title)
            VALUES (source.ID, source.FormalName, source.IsDiscontinued, source.IsObsolete, source.Title)
        """
        ibm_db.exec_immediate(conn, connection_type_insert_update_sql)




# Add a route to trigger data fetching and updating
@app.route('/fetch-and-update-data', methods=['GET'])
def fetch_and_update_data_route():
    fetch_and_update_data()
    return jsonify({"message": "Data fetched and updated successfully"}), 200



def fetch_charging_stations(latitude, longitude, max_results=100):
    url = f"{OPENCHARGEMAP_API_BASE_URL}?latitude={latitude}&longitude={longitude}&distance=2000&maxresults={max_results}&compact=true&verbose=false&key={OPENCHARGEMAP_API_KEY}"
    response= requests.get(url)
    return response.json()

@app.route('/charging-stations')
def charging_stations():
    latitude = 12.9141 #40.7128
    longitude = 74.8560 #-74.0060
    charging_stations_data = fetch_charging_stations(latitude,longitude)
    return jsonify(charging_stations_data)

if __name__=="__main__":
    # Check if the database connection is active
    if connState:
        # Call fetch_and_update_data only when the database connection is established
        fetch_and_update_data()
    app.run(debug=True)
