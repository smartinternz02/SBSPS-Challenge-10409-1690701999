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
    # referencedata = referencedata_response.json()
    try:
    # Attempt to parse the response as JSON
        referencedata = referencedata_response.json()
        # print(referencedata)
    except json.JSONDecodeError as e:
    # Handle the JSON decoding error
        print(f"Error decoding JSON: {e}")
        referencedata = None  # Set referencedata to None or another appropriate value



# Check if ChargerTypes table exists, create if not
    print("\nChecking ChargerTypes table exists or not....")
    charger_types_table_check_sql = "SELECT COUNT(*) FROM sysibm.systables WHERE name = 'CHARGERTYPES'"
    stmt = ibm_db.exec_immediate(conn, charger_types_table_check_sql)
    result = ibm_db.fetch_assoc(stmt)
    charger_types_table_exists = result['1'] > 0
    if(charger_types_table_exists):
        print("\nCharger types table exists.")
    else:
        print("\nCharger types table does not exists. Creating Charger types table in DB...")

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
        print("\nChecking ConnectionTypes table exists or not....")
    connection_types_table_check_sql = "SELECT COUNT(*) FROM sysibm.systables WHERE name = 'CONNECTIONTYPES'"
    stmt = ibm_db.exec_immediate(conn, connection_types_table_check_sql)
    result = ibm_db.fetch_assoc(stmt)
    connection_types_table_exists = result['1'] > 0
    if(connection_types_table_exists):
        print("\nConnectionTypes table exists.")
    else:
        print("\nConnectionTypes table does not exists. Creating ConnectionTypes table in DB...")

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

# Check if UsageTypes table exists, create if not
    print("\nChecking UsageTypes table exists or not....")
    usage_types_table_check_sql = "SELECT COUNT(*) FROM sysibm.systables WHERE name = 'USAGETYPES'"
    stmt = ibm_db.exec_immediate(conn, usage_types_table_check_sql)
    result = ibm_db.fetch_assoc(stmt)
    usage_types_table_exists = result['1'] > 0
    if(usage_types_table_exists):
        print("\nUsageTypes table exists.")
    else:
        print("\nUsageTypes table does not exists. Creating UsageTypes table in DB...")

    if not usage_types_table_exists:
        # Create UsageTypes table if it doesn't exist
        usage_types_table_create_sql = """
        CREATE TABLE UsageTypes (
            ID INT PRIMARY KEY NOT NULL,
            IsPayAtLocation BOOLEAN,
            IsMembershipRequired BOOLEAN,
            IsAccessKeyRequired BOOLEAN,
            Title VARCHAR(255)
        )
        """
        ibm_db.exec_immediate(conn, usage_types_table_create_sql)

    # Check if the Countries table exists
    print("\nChecking Countries table exists or not....")
    countries_table_check_sql = "SELECT COUNT(*) FROM sysibm.systables WHERE name = 'COUNTRIES'"
    stmt = ibm_db.exec_immediate(conn, countries_table_check_sql)
    result = ibm_db.fetch_assoc(stmt)
    countries_table_exists = result['1'] > 0
    if(countries_table_exists):
        print("\nCountries table exists.")
    else:
        print("\nCountries table does not exists. Creating Countries table in DB...")

    if not countries_table_exists:
        # Create the Countries table if it doesn't exist
        countries_table_create_sql = """
        CREATE TABLE Countries (
            ID INT PRIMARY KEY NOT NULL,
            ISOCode VARCHAR(255) ,
            ContinentCode VARCHAR(255) ,
            Title VARCHAR(255)
        )
        """
        ibm_db.exec_immediate(conn, countries_table_create_sql)



    # Insert or update data in ChargerTypes table
    print("\nUpdating data in ChargerTypes table")
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
    print("\nUpdating data in ConnectionTypes table")
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


    


# Insert or update data in UsageTypes
    print('\nUpdating data in UsageTypes')
    for usage_type_data in referencedata['UsageTypes']:
        usage_type_id = usage_type_data['ID']
        
        # Handle potential None values for other fields
        is_pay_at_location = usage_type_data.get("IsPayAtLocation", False)  # Provide False as a default value
        is_membership_required = usage_type_data.get("IsMembershipRequired", False)  # Provide False as a default value
        is_access_key_required = usage_type_data.get("IsAccessKeyRequired", False)  # Provide False as a default value
        title = usage_type_data.get("Title", "")  # Provide an empty string as a default value
        
        # Convert boolean values to integers (0 or 1) to match DB2 BOOLEAN data type
        is_pay_at_location = int(is_pay_at_location) if is_pay_at_location is not None else 0
        is_membership_required = int(is_membership_required) if is_membership_required is not None else 0
        is_access_key_required = int(is_access_key_required) if is_access_key_required is not None else 0
        
        usage_types_table_insert_update_sql = f"""
        MERGE INTO UsageTypes AS target
        USING (
            SELECT
                {usage_type_id} AS ID,
                {is_pay_at_location} AS IsPayAtLocation,
                {is_membership_required} AS IsMembershipRequired,
                {is_access_key_required} AS IsAccessKeyRequired,
                '{title}' AS Title
            FROM sysibm.sysdummy1
        ) AS source
        ON target.ID = source.ID
        WHEN MATCHED THEN
            UPDATE SET
                IsPayAtLocation = source.IsPayAtLocation,
                IsMembershipRequired = source.IsMembershipRequired,
                IsAccessKeyRequired = source.IsAccessKeyRequired,
                Title = source.Title
        WHEN NOT MATCHED THEN
            INSERT (ID, IsPayAtLocation, IsMembershipRequired, IsAccessKeyRequired, Title)
            VALUES (source.ID, source.IsPayAtLocation, source.IsMembershipRequired, source.IsAccessKeyRequired, source.Title)
        """
        ibm_db.exec_immediate(conn, usage_types_table_insert_update_sql)




# # Insert or update data in the Countries table
#     for country_data in referencedata['Countries']:
#         country_id = country_data['ID']
#         iso_code = country_data['ISOCode']
#         continent_code = country_data['ContinentCode']
#         title = country_data['Title']

#         # Use parameterized SQL query to avoid SQL injection
#         countries_table_insert_update_sql = """
#         MERGE INTO Countries AS target
#         USING (
#             SELECT ? AS ID, ? AS ISOCode, ? AS ContinentCode, ? AS Title FROM sysibm.sysdummy1
#         ) AS source
#         ON target.ID = source.ID
#         WHEN MATCHED THEN
#             UPDATE SET
#                 ISOCode = source.ISOCode,
#                 ContinentCode = source.ContinentCode,
#                 Title = source.Title
#         WHEN NOT MATCHED THEN
#             INSERT (ID, ISOCode, ContinentCode, Title)
#             VALUES (source.ID, source.ISOCode, source.ContinentCode, source.Title)
#         """
        
        # # Define the parameter values as a tuple
        # params = (country_id, iso_code, continent_code, title)

        # # Execute the SQL query with parameters
        # ibm_db.exec_immediate(conn, countries_table_insert_update_sql, params)



            # Insert or update data in the Countries table for each country
    print("\nUpdating data in Countries")
    for country_data in referencedata['Countries']:
        country_id = country_data['ID']
        iso_code = country_data['ISOCode']
        continent_code = country_data['ContinentCode']
        title = country_data.get('Title', '')  # Use an empty string as a default value if 'Title' is not present

                # Prepare the SQL statement with placeholders for parameters
        countries_table_insert_update_sql = """
        MERGE INTO Countries AS target
        USING (
            SELECT ? AS ID, ? AS ISOCode, ? AS ContinentCode, ? AS Title FROM sysibm.sysdummy1
        ) AS source
        ON target.ID = source.ID
        WHEN MATCHED THEN
            UPDATE SET
                ISOCode = source.ISOCode,
                ContinentCode = source.ContinentCode,
                Title = source.Title
        WHEN NOT MATCHED THEN
            INSERT (ID, ISOCode, ContinentCode, Title)
            VALUES (source.ID, source.ISOCode, source.ContinentCode, source.Title)
        """

        # Prepare the statement
        stmt = ibm_db.prepare(conn, countries_table_insert_update_sql)

        # Bind the parameter values to the prepared statement
        ibm_db.bind_param(stmt, 1, country_id)
        ibm_db.bind_param(stmt, 2, iso_code)
        ibm_db.bind_param(stmt, 3, continent_code)
        ibm_db.bind_param(stmt, 4, title)

        # Execute the prepared statement
        ibm_db.execute(stmt)
    print("\n All data is updated")

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


@app.route('/countries', methods=['GET'])
def get_countries_data():
    try:
        sql_countries = f"SELECT * FROM countries"
        stmt_countries = ibm_db.exec_immediate(conn, sql_countries)
        
        countries_data = []
        while ibm_db.fetch_row(stmt_countries):
            row = ibm_db.fetch_assoc(stmt_countries)
            countries_data.append(row)

        return jsonify(countries_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/usage-types', methods=['GET'])
def get_usage_types_data():
    try:
        sql_usage_types = f"SELECT * FROM usagetypes"
        stmt_usage_types = ibm_db.exec_immediate(conn, sql_usage_types)
        
        usage_types_data = []
        while ibm_db.fetch_row(stmt_usage_types):
            row = ibm_db.fetch_assoc(stmt_usage_types)
            usage_types_data.append(row)

        return jsonify(usage_types_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/connection-types', methods=['GET'])
def get_connection_types_data():
    try:
        sql_connection_types = "SELECT * FROM connectiontypes"
        stmt_connection_types = ibm_db.exec_immediate(conn, sql_connection_types)
        
        connection_types_data = []
        while ibm_db.fetch_row(stmt_connection_types):
            row = ibm_db.fetch_assoc(stmt_connection_types)
            connection_types_data.append(row)
        return jsonify(connection_types_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__=="__main__":
    # Check if the database connection is active
    # if connState:
    #     # Call fetch_and_update_data only when the database connection is established
    #     fetch_and_update_data()
    app.run(debug=True)
