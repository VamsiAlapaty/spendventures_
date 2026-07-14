from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from database import create_tables, SessionLocal, ExpenseModel


class Expense(BaseModel):
    amount: float
    category: str
    description: str
    date: str

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

@app.get("/")
def root():
    return {"message": "SpendVentures API is running"}

@app.get("/expenses")
def get_expenses():
    db = SessionLocal()
    expenses = db.query(ExpenseModel).all()
    db.close()
    return expenses

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