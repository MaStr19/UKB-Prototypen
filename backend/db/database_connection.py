import urllib.parse
from sqlalchemy import create_engine, text, Engine




def connect_to_database(server, database) -> Engine|None:

    # 2. Build the raw ODBC connection string
    # Using Windows Authentication (standard for local SSMS connections)
    driver = '{ODBC Driver 17 for SQL Server}'
    odbc_str = f'DRIVER={driver};SERVER={server};DATABASE={database};Trusted_Connection=yes;'

    # 3. URL-encode the string and create the SQLAlchemy engine
    params = urllib.parse.quote_plus(odbc_str)
    engine = create_engine(f"mssql+pyodbc:///?odbc_connect={params}")

    # 4. Test the connection
    try:
        with engine.connect() as connection:
            # SQLAlchemy 2.0+ requires wrapping raw SQL in text()
            result = connection.execute(text("SELECT @@VERSION"))
            print("Successfully connected via SQLAlchemy!")
            print(result.fetchone()[0])

        return engine


    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None


    


