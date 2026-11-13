from db.database_connection import connect_to_database

from sqlalchemy import inspect

from orm.consultation import Consultation
from orm.therapy import Therapy

from sqlalchemy.orm import Session
from sqlalchemy import select


server = '.\sqlexpress'
database = 'Cronn_Eva_Testsubset_v2' 

engine = connect_to_database(server, database)

# 1. Bind the inspector to your engine
inspector = inspect(engine)

# 2. Fetch the columns (replace with your actual table name)
# If your table is in a specific schema like 'dbo', you can add schema='dbo'
columns = inspector.get_columns('therapy_addition_dynamic_select_option')

print(columns)

# 1. Open the session using your existing 'engine'
with Session(engine) as session:
    
    # 2. Build the query
    # Ordering by 'id' ensures you consistently get the actual "first" inserted record
    stmt = select(Consultation).order_by(Consultation.id)
    
    # 3. Execute the query and grab the first object
    first_record = session.scalars(stmt).first()
    
    # 4. Access the data using object attributes (dot notation)
    if first_record:
        print(f"Record ID: {first_record.id}")
        print(f"Created On: {first_record.creation_time}")
        print(f"Patient Name: {first_record.patient_name}")
        print(f"Consultation Type: {first_record.consultation_type}")
    else:
        print("No records found in the table.")


