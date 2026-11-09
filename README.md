# QuizeLive Admin

Админка студии: вход, викторины, редактор вопросов и пользователи.

## Запуск

API должен слушать тот же адрес, куда смотрит прокси Vite. По умолчанию это `http://127.0.0.1:8080`. Если в `quizelive-backend/.env` другой `HTTP_ADDR`, создайте `quizelive-admin/.env.local`:

```
API_PROXY_TARGET=http://127.0.0.1:8086
VITE_PLAY_PUBLIC_URL=http://localhost:5175
```

Кнопка «Открыть экран» выпускает host-токен и открывает `PLAY/tv?token=…` в новой вкладке; рядом QR той же ссылки для Smart TV.

```bash
yarn install
yarn openapi:generate
yarn dev
```

Откроется `http://localhost:5173`. Схема берётся из `../quizelive-backend/api/openapi.yaml`.

Регистрация создаёт редактора и присылает ссылку подтверждения. Без `SMTP_HOST` письмо видно в логе API.

```bash
yarn typecheck
yarn lint
yarn build
```
