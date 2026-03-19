// ========================================
// EXPORTADOR CENTRAL DE BANCOS DE DADOS
// ========================================
// Centraliza os bancos de dados das salas 1 e 2

// Sala 2 exporta "imageDatabaseSala2"
export {imageDatabaseSala2 } from './imageDatabaseSala2'

// Sala 1 exporta "imageDatabaseSala1" diretamente
export { imageDatabaseSala1 } from './imageDatabaseSala1'

export { imageDatabaseSala3 } from './imageDatabaseSala3'


// Tipo compartilhado (usando definição da Sala 2)
export type { ImageData } from './imageDatabaseSala2'
