install:
	npm install

run:
	npm run serve

test:
	npm run test:unit

lint:
	npm run lint

deploy-local:
	docker-compose build --parallel --pull
	docker-compose up --remove-orphans

install-prod:
	ansible-galaxy install -r ansible/requirements.yml
	ansible-playbook ansible/install.yml -i ansible/inventory.ini

deploy-prod:
	ansible-playbook ansible/deploy.yml -i ansible/inventory.ini
