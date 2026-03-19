# CarSensor

CarSensor - сервис для сбора и публикации объявлений с CarSensor.
Проект включает фоновый парсинг, нормализацию японских полей, хранение данных в MongoDB и веб-интерфейс для просмотра каталога с авторизацией, фильтрами и детальной страницей автомобиля.

## Возможности

- импорт объявлений из CarSensor
- нормализация данных и перевод части японских полей
- хранение данных в MongoDB
- REST API для каталога и детальной страницы
- фильтрация, сортировка и пагинация
- авторизация по JWT

## Локальный запуск

1. Создайте `.env` файлы из шаблонов:
   - `backend/.env` из `backend/.env.example`
   - `frontend/.env` из `frontend/.env.example`
   - `scraper/.env` из `scraper/.env.example`
2. Укажите значения переменных окружения.
3. Запустите контейнеры:

```bash
docker compose up --build
```

После запуска:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- MongoDB: `localhost:27017`

## Основные переменные окружения

`backend/.env`:

- `JWT_SECRET` - длинный случайный секрет
- `ADMIN_LOGIN` - логин администратора
- `ADMIN_PASSWORD` - пароль администратора
- `CORS_ORIGIN` - список разрешённых origin через запятую

`frontend/.env`:

- `NEXT_PUBLIC_BACKEND_URL` - публичный URL API (например, `https://api.your-domain.com`)

`scraper/.env`:

- `SCRAPER_START_URL` - стартовая страница
- `SCRAPER_MAX_CARS` / `SCRAPER_MAX_PAGES` - лимиты сбора

## Production deployment

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

- `frontend` публикуется наружу на `3000`
- `backend` доступен только внутри Docker-сети (`expose`)
- `backend` и `frontend` используют healthcheck
- `mongo` и `scraper` остаются внутренними сервисами

## Эксплуатационные рекомендации

1. Настроить reverse proxy (Nginx/Caddy).
2. Выпустить TLS-сертификаты (Let’s Encrypt).
3. Разделить домены:
   - `https://your-domain.com` - `frontend`
   - `https://api.your-domain.com` - `backend`
4. Ограничить `CORS_ORIGIN` только нужными доменами.
5. Настроить резервные копии MongoDB и ротацию логов.
6. Не хранить реальные секреты в репозитории.

## Команды

Перезапуск production:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Логи:

```bash
docker compose -f docker-compose.prod.yml logs -f
```

Остановка:

```bash
docker compose -f docker-compose.prod.yml down
```
