// Configuração centralizada do proprietário do site (Revista Codorninha).
// Define dados institucionais, editoriais, contatos, fontes e paleta de cores.
// Edite apenas os valores abaixo; os tipos ficam em `src/types/owner.ts`.

import type { OwnerData } from "../types/owner";

// Reexporta os tipos para manter compatibilidade com imports existentes.
export type {
  OwnerAuthor,
  OwnerContact,
  OwnerColors,
  OwnerFonts,
  OwnerData,
} from "../types/owner";

export const ownerData: OwnerData = {
  // Nome oficial da revista
  siteName: "O Estrangeiro",
  // Slogan institucional
  tagline: "Observações, reflexões e críticas vindas de fora do ninho",
  // Caminho do favicon
  favicon: "/favicon.png",
  // Logotipo da revista
  logo: "/final.svg",
  // Imagem de fundo opcional para a seção Hero (deixe vazio para usar a cor primária)
  heroBackgroundImage: "",
  // Dados do autor ou redação
  author: {
    name: "A. L. Camus",
    profilePhoto: "/placeholder-author.svg",
  },
  // Contatos da revista (o email também recebe os envios do formulário)
  contact: {
    phone: "Sem contato telefônico",
    email: "oestrangeiro.radacao@proton.me",
  },
  // Paleta de cores: altere aqui para transformar a identidade do site
  colors: {
    primary: "#a4161a",       // Vermelho Marlboro queimado
    secondary: "#b8892b",     // Dourado fosco, estilo detalhe de maço Gudang Garam
    background: "#ece8e1",    // Cinza de fumaça, quente e envelhecido
    surface: "#f7f4ee",       // Papel de cigarro para superfícies e cards
    text: "#2b2a28",          // Cinza-carvão para texto padrão
    textMuted: "#6f6a62",     // Cinza de cinzeiro para textos secundários
    heading: "#14110f",       // Preto tabaco para títulos
    link: "#8b1a1a",          // Vinho escuro, a brasa apagada
    border: "#cfc8bc",        // Bege-acinzentado, como papel amarelado
  },

  // Fontes: famílias tipográficas e link do Google Fonts
  fonts: {
    // Newsreader traz a urgência jornalística com elegância clássica
    heading: "'Newsreader', Georgia, serif", 
    // Courier Prime traz a alma da máquina de escrever de Camus, sem viés tech
    abstract: "'Courier Prime', 'Courier New', monospace", 
    // Lora é serifada, literária e extremamente confortável para leitura longa
    body: "'Lora', Georgia, serif", 
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Lora:ital,wght@0,400;0,600;1,400&family=Newsreader:opsz,wght@6..72,500;6..72,700&display=swap",
  }
};
