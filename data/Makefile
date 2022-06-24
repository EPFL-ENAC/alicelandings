UID := $(shell id -u)
GID := $(shell id -g)

process:
	OWNER="${UID}.${GID}" docker-compose up --build
