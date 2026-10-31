import os
from datetime import date

from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from database import create_tables, SessionLocal, ExpenseModel
from auth import hash_password, verify_password, create_access_token, verify_token, get_current_user
from database import create_tables, SessionLocal, ExpenseModel, UserModel, IncomeModel, DebtModel
from anthropic import Anthropic
from dotenv import load_dotenv
load_dotenv()

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

class ChatMessage(BaseModel):
    message: str
    history: list[dict] = []
    today: str | None = None  # user's local date (YYYY-MM-DD) from the browser

class Expense(BaseModel):
    amount: float
    category: str
    description: str
    date: str

class Income(BaseModel):
    amount: float
    source: str
    description: str = ""
    date: str

class Debt(BaseModel):
    amount: float
    name: str
    description: str = ""
    due_date: str | None = None
    is_paid: bool = False

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

# ---------------------------------------------------------------- Income
@app.post("/income")
def add_income(income: Income, email: str = Depends(get_current_user)):
    db = SessionLocal()
    user = db.query(UserModel).filter(UserModel.email == email).first()
    db_income = IncomeModel(
        user_id=user.id,
        amount=income.amount,
        source=income.source,
        description=income.description,
        date=income.date
    )
    db.add(db_income)
    db.commit()
    db.refresh(db_income)
    db.close()
    return {"message": "Income saved", "data": income}

@app.get("/income")
def get_income(email: str = Depends(get_current_user)):
    db = SessionLocal()
    user = db.query(UserModel).filter(UserModel.email == email).first()
    rows = db.query(IncomeModel).filter(IncomeModel.user_id == user.id).order_by(IncomeModel.id).all()
    db.close()
    return rows

@app.put("/income/{income_id}")
def update_income(income_id: int, income: Income, email: str = Depends(get_current_user)):
    db = SessionLocal()
    user = db.query(UserModel).filter(UserModel.email == email).first()
    row = db.query(IncomeModel).filter(IncomeModel.id == income_id, IncomeModel.user_id == user.id).first()
    if not row:
        db.close()
        raise HTTPException(status_code=404, detail="Income not found")
    row.amount = income.amount
    row.source = income.source
    row.description = income.description
    row.date = income.date
    db.commit()
    db.close()
    return {"message": "Income updated", "data": income}

@app.delete("/income/{income_id}")
def delete_income(income_id: int, email: str = Depends(get_current_user)):
    db = SessionLocal()
    user = db.query(UserModel).filter(UserModel.email == email).first()
    row = db.query(IncomeModel).filter(IncomeModel.id == income_id, IncomeModel.user_id == user.id).first()
    if not row:
        db.close()
        raise HTTPException(status_code=404, detail="Income not found")
    db.delete(row)
    db.commit()
    db.close()
    return {"message": "Income deleted"}

# ---------------------------------------------------------------- Debts
@app.post("/debts")
def add_debt(debt: Debt, email: str = Depends(get_current_user)):
    db = SessionLocal()
    user = db.query(UserModel).filter(UserModel.email == email).first()
    db_debt = DebtModel(
        user_id=user.id,
        amount=debt.amount,
        name=debt.name,
        description=debt.description,
        due_date=debt.due_date,
        is_paid=debt.is_paid
    )
    db.add(db_debt)
    db.commit()
    db.refresh(db_debt)
    db.close()
    return {"message": "Debt saved", "data": debt}

@app.get("/debts")
def get_debts(include_paid: bool = False, email: str = Depends(get_current_user)):
    db = SessionLocal()
    user = db.query(UserModel).filter(UserModel.email == email).first()
    q = db.query(DebtModel).filter(DebtModel.user_id == user.id)
    if not include_paid:
        q = q.filter(DebtModel.is_paid == False)
    rows = q.order_by(DebtModel.id).all()
    db.close()
    return rows

@app.put("/debts/{debt_id}")
def update_debt(debt_id: int, debt: Debt, email: str = Depends(get_current_user)):
    db = SessionLocal()
    user = db.query(UserModel).filter(UserModel.email == email).first()
    row = db.query(DebtModel).filter(DebtModel.id == debt_id, DebtModel.user_id == user.id).first()
    if not row:
        db.close()
        raise HTTPException(status_code=404, detail="Debt not found")
    row.amount = debt.amount
    row.name = debt.name
    row.description = debt.description
    row.due_date = debt.due_date
    row.is_paid = debt.is_paid
    db.commit()
    db.close()
    return {"message": "Debt updated", "data": debt}

@app.patch("/debts/{debt_id}/pay")
def mark_debt_paid(debt_id: int, email: str = Depends(get_current_user)):
    db = SessionLocal()
    user = db.query(UserModel).filter(UserModel.email == email).first()
    row = db.query(DebtModel).filter(DebtModel.id == debt_id, DebtModel.user_id == user.id).first()
    if not row:
        db.close()
        raise HTTPException(status_code=404, detail="Debt not found")
    row.is_paid = True
    db.commit()
    db.close()
    return {"message": "Debt marked as paid"}

@app.delete("/debts/{debt_id}")
def delete_debt(debt_id: int, email: str = Depends(get_current_user)):
    db = SessionLocal()
    user = db.query(UserModel).filter(UserModel.email == email).first()
    row = db.query(DebtModel).filter(DebtModel.id == debt_id, DebtModel.user_id == user.id).first()
    if not row:
        db.close()
        raise HTTPException(status_code=404, detail="Debt not found")
    db.delete(row)
    db.commit()
    db.close()
    return {"message": "Debt deleted"}

# ------------------------------------------------------------ AI agent
TOOLS = [
    {
        "name": "add_expense",
        "description": "Record money the user SPENT. Use when they say they bought or paid for something.",
        "input_schema": {
            "type": "object",
            "properties": {
                "amount": {"type": "number", "description": "Positive amount in dollars"},
                "category": {"type": "string", "description": "Short category, e.g. Groceries, Rent, Dining"},
                "description": {"type": "string", "description": "Short description of the purchase"},
                "date": {"type": "string", "description": "YYYY-MM-DD. Omit for today."},
            },
            "required": ["amount", "category"],
        },
    },
    {
        "name": "add_income",
        "description": "Record money the user EARNED or RECEIVED (salary, freelance payment, refund, gift).",
        "input_schema": {
            "type": "object",
            "properties": {
                "amount": {"type": "number", "description": "Positive amount in dollars"},
                "source": {"type": "string", "description": "Where it came from, e.g. Salary, Freelance"},
                "description": {"type": "string"},
                "date": {"type": "string", "description": "YYYY-MM-DD. Omit for today."},
            },
            "required": ["amount", "source"],
        },
    },
    {
        "name": "add_debt",
        "description": "Record money the user OWES (loan, borrowed money, credit card balance).",
        "input_schema": {
            "type": "object",
            "properties": {
                "amount": {"type": "number", "description": "Positive amount owed in dollars"},
                "name": {"type": "string", "description": "What or who the debt is for, e.g. Car loan, Borrowed from Ravi"},
                "description": {"type": "string"},
                "due_date": {"type": "string", "description": "YYYY-MM-DD, only if the user gave one"},
            },
            "required": ["amount", "name"],
        },
    },
]


def valid_date(value, default):
    """Return a YYYY-MM-DD string, falling back to default. Raises ValueError if malformed."""
    if not value:
        return default
    return date.fromisoformat(value).isoformat()


def run_tool(name, args, db, user_id, today):
    """Execute one tool call for this user. Returns (ok, message, action)."""
    try:
        amount = float(args.get("amount"))
    except (TypeError, ValueError):
        return False, "amount must be a number", None
    if amount <= 0:
        return False, "amount must be greater than 0", None

    try:
        if name == "add_expense":
            category = (args.get("category") or "").strip()
            if not category:
                return False, "category is required", None
            row = ExpenseModel(
                user_id=user_id, amount=amount, category=category,
                description=args.get("description", ""), date=valid_date(args.get("date"), today),
            )
            db.add(row)
            db.commit()
            msg = f"Expense saved: ${amount:.2f} in {category} on {row.date}"
            return True, msg, {"type": "expense", "text": msg}

        if name == "add_income":
            source = (args.get("source") or "").strip()
            if not source:
                return False, "source is required", None
            row = IncomeModel(
                user_id=user_id, amount=amount, source=source,
                description=args.get("description", ""), date=valid_date(args.get("date"), today),
            )
            db.add(row)
            db.commit()
            msg = f"Income saved: ${amount:.2f} from {source} on {row.date}"
            return True, msg, {"type": "income", "text": msg}

        if name == "add_debt":
            debt_name = (args.get("name") or "").strip()
            if not debt_name:
                return False, "name is required", None
            due = args.get("due_date")
            due = date.fromisoformat(due).isoformat() if due else None
            row = DebtModel(
                user_id=user_id, amount=amount, name=debt_name,
                description=args.get("description", ""), due_date=due, is_paid=False,
            )
            db.add(row)
            db.commit()
            msg = f"Debt saved: ${amount:.2f} for {debt_name}" + (f", due {due}" if due else "")
            return True, msg, {"type": "debt", "text": msg}
    except ValueError:
        db.rollback()
        return False, "dates must be in YYYY-MM-DD format", None

    return False, f"unknown tool {name}", None


@app.post("/chat")
def chat(body: ChatMessage, email: str = Depends(get_current_user)):
    db = SessionLocal()
    try:
        user = db.query(UserModel).filter(UserModel.email == email).first()
        expenses = db.query(ExpenseModel).filter(ExpenseModel.user_id == user.id).all()
        incomes = db.query(IncomeModel).filter(IncomeModel.user_id == user.id).all()
        debts = db.query(DebtModel).filter(DebtModel.user_id == user.id, DebtModel.is_paid == False).all()

        expenses_text = "\n".join(
            f"Date: {e.date}, Category: {e.category}, Amount: ${e.amount}, Description: {e.description}"
            for e in expenses
        ) or "(none)"
        income_text = "\n".join(
            f"Date: {i.date}, Source: {i.source}, Amount: ${i.amount}, Description: {i.description}"
            for i in incomes
        ) or "(none)"
        debts_text = "\n".join(
            f"Name: {d.name}, Amount: ${d.amount}, Due: {d.due_date or 'n/a'}, Description: {d.description}"
            for d in debts
        ) or "(none)"
        # use the browser's local date so "today" is right regardless of server timezone
        try:
            today = date.fromisoformat(body.today).isoformat() if body.today else date.today().isoformat()
        except ValueError:
            today = date.today().isoformat()
        categories = sorted({e.category for e in expenses if e.category})

        system = f"""You are the SpendVentures assistant. You answer questions about the user's finances AND can record new entries with your tools.
Today's date is {today}.

EXPENSES:
{expenses_text}

INCOME:
{income_text}

OUTSTANDING DEBTS (unpaid):
{debts_text}

Rules for recording entries:
- Use add_expense when the user spent money, add_income when they earned or received money, add_debt when they owe money.
- If the amount is missing or unclear, or it is unclear whether it is an expense, income or debt, ask one short question instead of guessing.
- If no date is given, omit it so today's date is used. Convert phrases like "yesterday" into YYYY-MM-DD using today's date.
- Reuse the user's existing expense categories when one fits: {', '.join(categories) or 'none yet'}.
- After saving, confirm in one short sentence with the amount and category/source/name.
- You cannot edit, delete, or mark entries as paid. If asked, tell the user to use the Dashboard, Income or Debts pages.
Answer questions accurately from the data above."""

        # prior turns (plain text only), then the new message
        messages = []
        for h in body.history[-10:]:
            role, content = h.get("role"), h.get("content")
            if role in ("user", "assistant") and isinstance(content, str) and content.strip():
                messages.append({"role": role, "content": content})
        while messages and messages[0]["role"] != "user":
            messages.pop(0)
        messages.append({"role": "user", "content": body.message})

        actions = []
        response = None
        for _ in range(5):  # cap tool-use rounds
            response = client.messages.create(
                model="claude-haiku-4-5",
                max_tokens=1024,
                system=system,
                tools=TOOLS,
                messages=messages,
            )
            if response.stop_reason != "tool_use":
                break
            messages.append({"role": "assistant", "content": response.content})
            results = []
            for block in response.content:
                if block.type == "tool_use":
                    ok, msg, action = run_tool(block.name, block.input, db, user.id, today)
                    if ok:
                        actions.append(action)
                    result = {"type": "tool_result", "tool_use_id": block.id, "content": msg}
                    if not ok:
                        result["is_error"] = True
                    results.append(result)
            messages.append({"role": "user", "content": results})

        reply = "".join(b.text for b in response.content if b.type == "text").strip()
        if not reply:
            reply = "Done." if actions else "Sorry, I couldn't complete that. Please try again."
        return {"reply": reply, "actions": actions}
    finally:
        db.close()
