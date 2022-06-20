install:
	npm install

run:
	npm run serve

test:
	npm run test:unit

lint:
	npm run lint


deploy:
	docker-compose build --parallel --pull
	docker-compose up --remove-orphans

UID := $(shell id -u)
GID := $(shell id -g)

process-data:
	cd data; OWNER="${UID}.${GID}" docker-compose up --build
