# 🚗 Shopper Ride

Este projeto é parte do teste técnico para a vaga de Desenvolvedor Full Stack na Shopper.

## Sobre o Projeto
Shopper Ride é uma aplicação de compartilhamento de caronas que permite aos usuários solicitar viagens de um ponto A até um ponto B. Os usuários podem escolher entre diferentes motoristas, cada um com suas próprias características e preços.

## Tecnologias Utilizadas

### Frontend
- React com TypeScript
- Material-UI para interface
- Axios para requisições HTTP
- Google Maps API para visualização de rotas

### Backend
- Node.js com TypeScript
- Express para API REST
- TypeORM para persistência de dados
- PostgreSQL como banco de dados

### Infraestrutura
- Docker e Docker Compose para containerização
- Nginx como servidor web

## Como Executar o Projeto

### Pré-requisitos
- Docker e Docker Compose instalados
- Chave de API do Google Maps (necessária para funcionalidades de mapa)

### Configuração
1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
cd shopper-ride
```

2. Crie um arquivo `.env` na raiz do projeto com sua chave da API do Google Maps:
```env
GOOGLE_API_KEY=sua_chave_aqui
```

3. Inicie a aplicação com Docker Compose:
```bash
docker-compose up
```

A aplicação estará disponível em:
- Frontend: http://localhost:80
- Backend: http://localhost:8080

## Funcionalidades

### 1. Solicitação de Viagem
- Formulário para informar origem e destino
- Cálculo automático de rota e preços
- Visualização da rota no mapa

### 2. Escolha de Motorista
- Lista de motoristas disponíveis
- Informações detalhadas sobre cada motorista
- Preços calculados com base na distância

### 3. Histórico de Viagens
- Visualização de todas as viagens realizadas
- Filtro por motorista
- Detalhes completos de cada viagem

## Estrutura do Projeto

### Frontend (/frontend)
- `/src/components`: Componentes React
- `/src/services`: Serviços e integrações
- `/src/types`: Definições de tipos TypeScript
- `/src/theme`: Configurações de tema e estilos

### Backend (/backend)
- `/src/controllers`: Controladores da API
- `/src/services`: Lógica de negócios
- `/src/models`: Modelos de dados
- `/src/routes`: Rotas da API

## Endpoints da API

### POST /ride/estimate
- Calcula estimativas de preço para uma viagem
- Retorna opções de motoristas disponíveis

### PATCH /ride/confirm
- Confirma uma viagem
- Salva os detalhes no banco de dados

### GET /ride/{customer_id}
- Retorna histórico de viagens do usuário
- Suporta filtro por motorista

## Motoristas Disponíveis
1. Homer Simpson
   - Veículo: Plymouth Valiant 1973
   - Taxa: R$ 2,50/km
   - Quilometragem mínima: 1km

2. Dominic Toretto
   - Veículo: Dodge Charger R/T 1970
   - Taxa: R$ 5,00/km
   - Quilometragem mínima: 5km

3. James Bond
   - Veículo: Aston Martin DB5
   - Taxa: R$ 10,00/km
   - Quilometragem mínima: 10km

## Observações Importantes
- A aplicação requer uma chave válida da API do Google Maps
- Todos os preços são calculados automaticamente com base na distância
- O banco de dados é inicializado automaticamente com o Docker Compose
