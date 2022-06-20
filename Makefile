install:
	$(MAKE) -C frontend install

run:
	$(MAKE) -C frontend run

test:
	$(MAKE) -C frontend test

lint:
	$(MAKE) -C frontend lint

deploy:
	docker-compose build --parallel --pull
	docker-compose up --remove-orphans

UID := $(shell id -u)
GID := $(shell id -g)

process-data:
	cd data; OWNER="${UID}.${GID}" docker-compose up --build
