import pymongo

try:
    # Correct the URI format here, ensure database name is part of the path, not query parameter
    client = pymongo.MongoClient("mongodb+srv://admin:admin@tweets.8ugzv.mongodb.net/tweets?retryWrites=true&w=majority")
    db = client.test  # Attempt to access a database to trigger the connection
    print("MongoDB connection successful.")
except pymongo.errors.ConnectionFailure as e:
    print(f"MongoDB connection failed: {str(e)}")