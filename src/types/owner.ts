// Definição dos tipos da configuração do proprietário do site (Revista Codorninha).
// Os valores preenchidos pelo usuário ficam em `src/data/owner_data.ts`.

export interface OwnerAuthor {
  /** Nome do autor principal ou redação. Obrigatório. Ex: "Redação Revista Codorninha" */
  name: string;
  /** Caminho relativo para a foto de perfil do autor. Opcional. Ex: "/placeholder-author.svg" */
  profilePhoto?: string;
}

export interface OwnerContact {
  /** Telefone ou canal de atendimento telefônico/WhatsApp. Opcional. Ex: "(11) 98765-4321" */
  phone?: string;
  /** E-mail oficial de contato e destino do formulário de mensagens. Opcional. Ex: "contato@revistacodorninha.com.br" */
  email?: string;
}

export interface OwnerColors {
  /** Cor primária da marca: cabeçalho, botões e destaque institucional. Obrigatório. Ex: "#1e3a8a" */
  primary: string;
  /** Cor secundária de apoio para realces, badges e categorias. Obrigatório. Ex: "#b45309" */
  secondary: string;
  /** Cor de fundo geral da página. Obrigatório. Ex: "#f8fafc" */
  background: string;
  /** Cor de superfície para cards, painéis e caixas. Obrigatório. Ex: "#ffffff" */
  surface: string;
  /** Cor do texto principal de leitura. Obrigatório. Ex: "#1e293b" */
  text: string;
  /** Cor de texto suavizada para datas, legendas e subtítulos. Obrigatório. Ex: "#64748b" */
  textMuted: string;
  /** Cor de títulos e cabeçalhos (h1–h6). Obrigatório. Ex: "#0f172a" */
  heading: string;
  /** Cor para links e âncoras. Obrigatório. Ex: "#2563eb" */
  link: string;
  /** Cor para bordas, separadores e divisórias. Obrigatório. Ex: "#e2e8f0" */
  border: string;
}

export interface OwnerFonts {
  /** Fonte tipográfica aplicada a títulos e cabeçalhos. Obrigatório. Ex: "'Merriweather', serif" */
  heading: string;
  /** Fonte tipográfica para o corpo do texto e leitura. Obrigatório. Ex: "'Inter', sans-serif" */
  body: string;
  /** Fonte tipográfica para citações e trechos de código. Opcional. Ex: "'Fira Code', monospace" */
  abstract?: string;
  /** URL opcional para importação no cabeçalho (ex: Google Fonts). Opcional. Ex: "https://fonts.googleapis.com/..." */
  googleFontsUrl?: string;
}

export interface OwnerData {
  /** Nome oficial do portal ou revista. Obrigatório. Ex: "Revista Codorninha" */
  siteName: string;
  /** Slogan ou frase descritiva da revista. Opcional. Ex: "Crítica, filosofia, política e eventos locais." */
  tagline?: string;
  /** Caminho do ícone de favoritos (favicon). Obrigatório. Ex: "/favicon.svg" */
  favicon: string;
  /** Descrição sobre a revista. Opcional. Ex: "A Revista Codorninha é uma publicação digital dedicada a fornecer informações, análises e insights sobre uma variedade de tópicos relevantes para nossos leitores." */
  sobre?: string;
  /** Caminho do logotipo principal da revista. Obrigatório. Ex: "/logo.svg" */
  logo: string;
  /** Imagem de fundo do Hero da página inicial. Opcional (se vazia, utiliza a cor principal). Ex: "" */
  heroBackgroundImage?: string;
  /** Dados editoriais do autor ou redação. Obrigatório. */
  author: OwnerAuthor;
  /** Informações de contato e atendimento. Obrigatório. */
  contact: OwnerContact;
  /** Paleta de cores oficial da revista. Obrigatório. */
  colors: OwnerColors;
  /** Configuração das fontes tipográficas da revista. Obrigatório. */
  fonts: OwnerFonts;
}
