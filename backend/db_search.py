import mysql.connector

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="salman7?",
        database="studentos"
    )
    cursor = conn.cursor()

    print("--- Searching for Calculus Book ---")
    cursor.execute("SELECT id, title FROM marketplace_items WHERE title LIKE '%Calculus%'")
    rows = cursor.fetchall()
    if not rows:
        print("No Calculus items found.")
    for (id, title) in rows:
        print(f"ID: {id}, Title: {title}")

    print("\n--- Searching for User ruhul03 ---")
    cursor.execute("SELECT id, username, role FROM users WHERE username = 'ruhul03'")
    rows = cursor.fetchall()
    if not rows:
        print("User ruhul03 not found.")
    for (id, username, role) in rows:
        print(f"ID: {id}, Username: {username}, Role: {role}")

    conn.close()
except Exception as e:
    print(f"Error: {e}")
