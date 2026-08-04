import os

from fastapi import FastAPI, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from database import create_tables, SessionLocal, ExpenseModel
from auth import hash_password, verify_password, create_access_token, verify_token, get_current_user
from database import create_tables, SessionLocal, ExpenseModel, UserModel
from anthropic import Anthropic
from dotenv import load_dotenv
load_dotenv()

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

class ChatMessage(BaseModel):
    message: str

class Expense(BaseModel):
    amount: float
    category: str
    description: str
    date: str

class UserRegister(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","https://spendventures-frontend.onrender.com"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    create_tables()

@app.post("/register")
def register(user: UserRegister):
    db = SessionLocal()
    existing_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if existing_user:
        db.close()
        return {"error": "Email already registered"}
    hashed = hash_password(user.password)
    new_user = UserModel(email=user.email, password=hashed)
    db.add(new_user)
    db.commit()
    db.close()
    return {"message": "User registered successfully"}

@app.post("/login")
def login(user: UserLogin):
    db = SessionLocal()
    db_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password):
        db.close()
        return {"error": "Invalid email or password"}
    token = create_access_token({"sub": db_user.email})
    db.close()
    return {"access_token": token, "token_type": "bearer"}

@app.get("/")
def root():
    return {"message": "SpendVentures API is running"}

@app.get("/expenses")
def get_expenses(email: str = Depends(get_current_user)):
    db = SessionLocal()
    user = db.query(UserModel).filter(UserModel.email == email).first()
    expenses = db.query(ExpenseModel).filter(ExpenseModel.user_id == user.id).order_by(ExpenseModel.id).all()
    db.close()
    return expenses

# filtered expenses by date range
@app.get("/expenses/filter")
def filter_expenses(start_date: str, end_date: str, email: str = Depends(get_current_user)):
    db = SessionLocal()
    user = db.query(UserModel).filter(UserModel.email == email).first()
    expenses = db.query(ExpenseModel).filter(ExpenseModel.user_id == user.id, ExpenseModel.date >= start_date, ExpenseModel.date <= end_date).all()
    db.close()
    return expenses

# Category totals endpoint
@app.get("/expenses/category_totals")
def get_category_totals(email: str = Depends(get_current_user)):
    db = SessionLocal()
    user = db.query(UserModel).filter(UserModel.email == email).first()
    results = db.query(ExpenseModel.category, func.sum(ExpenseModel.amount).label("total_amount")).filter(ExpenseModel.user_id == user.id).group_by(ExpenseModel.category).all()
    db.close()
    return [{"category": row.category, "total_amount": row.total_amount} for row in results]

@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int, email: str = Depends(get_current_user)):
    db = SessionLocal()
    user = db.query(UserModel).filter(UserModel.email == email).first()
    expense = db.query(ExpenseModel).filter(ExpenseModel.id == expense_id, ExpenseModel.user_id == user.id).first()
    if not expense:
        db.close()
        return {"message": "Expense not found"}
    db.delete(expense)
    db.commit()
    db.close()
    return {"message": "Expense deleted"}

@app.post("/expenses")
def add_expense(expense: Expense, email: str = Depends(get_current_user)):
    db = SessionLocal()
    user = db.query(UserModel).filter(UserModel.email == email).first()
    db_expense = ExpenseModel(
        user_id=user.id,
        amount=expense.amount,
        category=expense.category,
        description=expense.description,
        date=expense.date
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    db.close()
    return {"message": "Expense saved", "data": expense}

@app.put("/expenses/{expense_id}")
def update_expense(expense_id: int, expense: Expense, email: str = Depends(get_current_user)):
    db = SessionLocal()
    user = db.query(UserModel).filter(UserModel.email == email).first()
    db_expense = db.query(ExpenseModel).filter(ExpenseModel.id == expense_id, ExpenseModel.user_id == user.id).first()
    if not db_expense:
        db.close()
        return {"message": "Expense not found"}
    db_expense.amount = expense.amount
    db_expense.category = expense.category
    db_expense.description = expense.description
    db_expense.date = expense.date
    db.commit()
    db.refresh(db_expense)
    db.close()
    return {"message": "Expense updated", "data": expense}

@app.post("/chat")
def chat(body: ChatMessage, email: str = Depends(get_current_user)):
    db = SessionLocal()
    user = db.query(UserModel).filter(UserModel.email == email).first()
    expenses = db.query(ExpenseModel).filter(ExpenseModel.user_id == user.id).all()
    db.close()

    expenses_text = "\n".join([
        f"Date: {e.date}, Category: {e.category}, Amount: ${e.amount}, Description: {e.description}"
        for e in expenses
    ])

    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=1024,
        system=f"""You are a helpful expense tracking assistant. 
        The user has the following expenses:
        {expenses_text}
        
        Answer questions about their expenses accurately and helpfully.""",
        messages=[
            {"role": "user", "content": body.message}
        ]
    )

    return {"reply": response.content[0].text}