from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_mail import Mail, Message
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_sqlalchemy import SQLAlchemy
from flask_dance.contrib.google import make_google_blueprint, google
import os
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configs
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

# Mail config (Gmail SMTP)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False

mail = Mail(app)
db = SQLAlchemy(app)
jwt = JWTManager(app)

# Google OAuth
app.config['OAUTHLIB_INSECURE_TRANSPORT'] = True  # only for development
google_bp = make_google_blueprint(client_id=os.getenv("GOOGLE_CLIENT_ID"),
                                   client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
                                   redirect_to="google_login")
app.register_blueprint(google_bp, url_prefix="/login")

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)

class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

# Routes
@app.route('/register', methods=['POST'])
def register():
    email = request.json.get('email')
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "User already exists"}), 409
    user = User(email=email)
    db.session.add(user)
    db.session.commit()
    token = create_access_token(identity=email)
    return jsonify(access_token=token)

@app.route('/login/google')
@jwt_required(optional=True)
def google_login():
    if not google.authorized:
        return jsonify({'auth_url': google_bp.session.authorization_url()[0]})
    resp = google.get("/oauth2/v2/userinfo")
    email = resp.json()["email"]
    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(email=email)
        db.session.add(user)
        db.session.commit()
    token = create_access_token(identity=email)
    return jsonify(access_token=token)

@app.route('/todos', methods=['GET', 'POST'])
@jwt_required()
def handle_todos():
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    if request.method == 'POST':
        title = request.json.get('title')
        todo = Todo(title=title, user_id=user.id)
        db.session.add(todo)
        db.session.commit()

        # send email
        msg = Message('New Todo Created', recipients=[email])
        msg.body = f'Todo "{title}" was created.'
        mail.send(msg)

        return jsonify({"msg": "Todo created"})
    todos = Todo.query.filter_by(user_id=user.id).all()
    return jsonify([{"id": t.id, "title": t.title} for t in todos])

@app.route('/todos/<int:id>', methods=['PUT', 'DELETE'])
@jwt_required()
def update_delete_todo(id):
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    todo = Todo.query.filter_by(id=id, user_id=user.id).first()
    if not todo:
        return jsonify({"msg": "Not found"}), 404
    if request.method == 'PUT':
        todo.title = request.json.get('title')
        db.session.commit()
        return jsonify({"msg": "Updated"})
    db.session.delete(todo)
    db.session.commit()
    return jsonify({"msg": "Deleted"})
@app.route('/')
def home():
    return jsonify({"status": "✅ Backend is running!"})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))

