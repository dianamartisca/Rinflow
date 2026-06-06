from models import db
from routes import create_app
from seeds import seed_default_users
from sqlalchemy.exc import OperationalError
from sqlalchemy import text

app = create_app()

with app.app_context():
    try:
        db.session.execute(text('SELECT 1'))
        print("DB connection was successful")
    except OperationalError as e:
        print(f"DB connection error: {str(e)}")
        exit(1)

with app.app_context():
    try:
        #db.drop_all()
        db.create_all()
        created_roles = seed_default_users()
        print("Tables created successfully")
        if created_roles:
            print(f"Seeded default users for roles: {', '.join(created_roles)}")
        else:
            print("Default role users already exist; no seeding needed")
    except Exception as e:
        print(f"Error creating tables: {str(e)}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
