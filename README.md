# CarSensor
CarSensor - сервис для сбора и публикации объявлений с CarSensor. Проект включает фоновый парсинг, нормализацию японских полей, хранение данных в MongoDB и веб-интерфейс для просмотра каталога с авторизацией, фильтрами и детальной страницей автомобиля.

## Что внутри

- `frontend` — Next.js интерфейс (логин, список, карточка авто)
- `backend` — Express API + JWT авторизация
- `scraper` — сбор и нормализация объявлений
- `python-service` — маленький сервис на FastAPI для нормализации поисковой строки
- `mongo` — база данных
- автообновление данных каждый час (cron в `scraper`)

## Структура проекта

```text
.
├─ frontend/        # Next.js приложение (UI)
├─ backend/         # Express API (auth, cars, filters)
├─ scraper/         # парсер и нормализация данных
├─ python-service/  # FastAPI сервис для нормализации search
├─ shared/          # общие схемы/типы/словари
├─ docker-compose.yml
└─ docker-compose.prod.yml
```

## Как ходят данные

1. `scraper` забирает объявления и складывает их в `mongo`.
2. `backend` читает данные из `mongo`, применяет фильтры/сортировку и отдаёт API.
3. `python-service` при поиске нормализует строку (чтобы поиск работал стабильнее).
4. `frontend` запрашивает `backend` и показывает список/детали машин.

## Как часто обновляются данные

Парсер запускается автоматически **раз в час** (`cron.schedule("0 * * * *")` в `scraper/index.js`).
При старте контейнера также выполняется первый прогон, чтобы не ждать целый час до первого обновления.

## Быстрый старт (локально)

1. Создай env-файлы из примеров:
   - `backend/.env` из `backend/.env.example`
   - `frontend/.env` из `frontend/.env.example`
   - `scraper/.env` из `scraper/.env.example`
2. Запусти проект:

```bash
docker compose up --build
```

После старта обычно доступны:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- MongoDB: `localhost:27017`

## Основные env-переменные

### `backend/.env`

- `JWT_SECRET` — секрет для JWT
- `ADMIN_LOGIN` — логин администратора
- `ADMIN_PASSWORD` — пароль администратора
- `CORS_ORIGIN` — разрешённые origin через запятую
- `PYTHON_SERVICE_URL` — адрес Python-сервиса (`http://python-service:8000`)

### `frontend/.env`

- `NEXT_PUBLIC_BACKEND_URL` — адрес backend API

### `scraper/.env`

- `SCRAPER_START_URL` — стартовая страница
- `SCRAPER_MAX_CARS` / `SCRAPER_MAX_PAGES` — лимиты парсинга

## Прод-запуск

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Полезные команды:

```bash
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml down
```