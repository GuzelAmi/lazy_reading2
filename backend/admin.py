from app.database import SessionLocal
from app import models

db = SessionLocal()

users = db.query(models.User).all()
if not users:
    print("Нет пользователей. Сначала зарегистрируйтесь.")
    db.close()
    exit()

print("Список пользователей:")
for i, u in enumerate(users):
    print(f"{i+1}. {u.username} (id={u.id}, роль={u.role})")

try:
    choice = int(input("Введите номер пользователя, которого сделать администратором: ")) - 1
    if 0 <= choice < len(users):
        user = users[choice]
        user.role = 'admin'
        db.commit()
        print(f"Пользователь {user.username} теперь администратор.")
    else:
        print("Неверный номер.")
except ValueError:
    print("Ошибка: введите число.")
db.close()