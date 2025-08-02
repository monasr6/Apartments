up:
	docker-compose up -d --build
down:
	docker-compose down
restart:
	docker-compose down && docker-compose up -d --build
logs:
	docker-compose logs -f
test:
	docker-compose exec backend npm run test
lint:
	docker-compose exec backend npm run lint
format:
	docker-compose exec backend npm run format
migrate:
	docker-compose exec backend npm run migrate
make-migration:
	docker-compose exec backend npm run make-migration
seed:
	docker-compose exec backend npm run seed
shell:
	docker-compose exec backend sh
bash:
	docker-compose exec backend bash
install:
	docker-compose exec backend npm install
build:
	docker-compose exec backend npm run build
start:
	docker-compose exec backend npm run start:prod
start-dev:
	docker-compose exec backend npm run start:dev
test-watch:
	docker-compose exec backend npm run test:watch
test-coverage:
	docker-compose exec backend npm run test:cov
test-debug:
	docker-compose exec backend npm run test:debug
test-debug-watch:
	docker-compose exec backend npm run test:debug:watch
