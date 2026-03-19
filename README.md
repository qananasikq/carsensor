# CarSensor

Небольшой pet-проект: парсер собирает объявления с CarSensor, данные кладутся в MongoDB, а на сайте можно зайти под админом, посмотреть список машин, открыть карточку и фильтровать каталог.

## Что внутри

- `frontend` — Next.js интерфейс (логин, список, карточка авто)
- `backend` — Express API + JWT авторизация
- `scraper` — сбор и нормализация объявлений
- `python-service` — маленький сервис на FastAPI для нормализации поисковой строки
- `mongo` — база данных

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

