from flask import Flask, request, jsonify
from flask_cors import CORS
import dotenv
import os
from Langchain import GroqRAGSystem
from groq import Groq
# Initialize the Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

app.config['CORS_HEADERS'] = 'Content-Type'



# @app.route("/route_query", methods=["POST"])
# def route_query():
#     try:
#         # Extract data from request+
#         data = request.json
#         query = data.get("query")

#         if not query:
#             return jsonify({"error": "Query is required"}), 400
        
#         if "analyse" in query.lower():
#             return analyse(query)
#         # Route the query to the best-matching function
#         matches = router.route_query(query, top_k=1)

#         if not matches:
#             return jsonify({"error": "No matching function found"}), 404

#         # Execute the best match
#         func_name, score, func = matches[0]
#         if func_name == "get_location":
#             result = func()
#         elif func_name == "get_stock" or func_name == "should_restock":
#             result = func(item)
#         elif func_name == "get_inventory" or "process_query" or "get_stock_level" or "restock_suggestion":
#             print(func_name)
#             result = func(query=query)
#         else:
#             result = func(numbers)

#         return jsonify({
#             "query": query,
#             "matched_function": func_name,
#             "confidence_score": score,
#             "result": result
#         })

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
dotenv.load_dotenv()
rag_system = GroqRAGSystem(
        groq_api_key=os.getenv("GROQ_API_KEY"),
        qdrant_api_key=os.getenv("QDRANT_API_KEY")
    )   

@app.route("/route_query", methods=["POST"])
def route_query():
    try:
        data = request.json
        query = data.get("query")
        if not query:
            return jsonify({"error": "Query is required"}), 400
        result = rag_system.query(query)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/add", methods=["POST"])
def add():
    try:
        data = request.json
        inventory_items = data.get("file")
        if not inventory_items:
            return jsonify({"error": "files items are required"}), 400
        rag_system.add_inventory(inventory_items)
        return jsonify({"message": "files added successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/get_files", methods=["GET"])
def get():
    try:
        query = request.args.get("query")
        if not query:
            return jsonify({"error": "Query is required"}), 400
        result = rag_system.get_inventory(query)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/update_file", methods=["POST"])
def update():
    try:
        data = request.json
        product_name = data.get("file_name")
        inventory_item = data.get("content")
        if not product_name or not inventory_item:
            return jsonify({"error": "Product name and inventory item are required"}), 400
        rag_system.update_inventory(product_name, inventory_item)
        return jsonify({"message": "Inventory updated successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/delete_file", methods=["POST"])
def delete():
    try:
        data = request.json
        file_name = data.get("file_name")
        if not file_name:
            return jsonify({"error": "Product name is required"}), 400
        rag_system.delete_inventory(file_name)
        return jsonify({"message": "Inventory item deleted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/normal_query", methods=["POST"])
def normal_query():
    message=request.json.get("message")
    client = Groq(
        api_key=os.environ.get("GROQ_API_KEY"),
    )

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": f"Explain the message and return the answer in normal text {message}",
            }
        ],
        model="llama-3.3-70b-versatile",
    )

    return (chat_completion.choices[0].message.content)

if __name__ == "__main__":
    app.run(debug=True,port=5500)
