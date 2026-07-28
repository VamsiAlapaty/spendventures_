from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from database import create_tables, SessionLocal, ExpenseModel
from auth import hash_password, verify_password, create_access_token, verify_token
from database import create_tables, SessionLocal, ExpenseModel, UserModel

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
def get_expenses():
    db = SessionLocal()
    expenses = db.query(ExpenseModel).order_by(ExpenseModel.id).all()
    db.close()
    return expenses

# filtered expenses by date range
@app.get("/expenses/filter")
def filter_expenses(start_date: str, end_date: str):
    db = SessionLocal()
    expenses = db.query(ExpenseModel).filter(ExpenseModel.date >= start_date, ExpenseModel.date <= end_date).order_by(ExpenseModel.id).all()
    db.close()
    return expenses

@app.get("/expenses/category_totals")
def get_category_totals():
    db = SessionLocal()
    results = db.query(ExpenseModel.category, func.sum(ExpenseModel.amount).label("total_amount")).group_by(ExpenseModel.category).all()
    db.close()
    return [{"category": row.category, "total_amount": row.total_amount} for row in results]

@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int):
    db = SessionLocal()
    expense = db.query(ExpenseModel).filter(ExpenseModel.id == expense_id).first()
    if not expense:
        db.close()
        return {"message": "Expense not found"}
    db.delete(expense)
    db.commit()
    db.close()
    return {"message": "Expense deleted"}

@app.post("/expenses")
def add_expense(expense: Expense):
    db = SessionLocal()
    db_expense = ExpenseModel(
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
def update_expense(expense_id: int, expense: Expense):
    db = SessionLocal()
    db_expense = db.query(ExpenseModel).filter(ExpenseModel.id == expense_id).first()
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