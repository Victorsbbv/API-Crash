import axios from "axios";

// Instância do axios configurada com a URL base da API
// Todos os componentes importam este objeto para fazer chamadas HTTP
// Padrão do professor: axios.create({ baseURL: "url_da_api" })
const api = axios.create({
    baseURL: "http://localhost:5128"
});

export default api;
