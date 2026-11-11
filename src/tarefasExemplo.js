// TEMPORÁRIO: quando o tareas.json da Paula estiver na main,
// apague este arquivo e no App use: import tarefasIniciais from './data/tareas.json'
const tarefasExemplo = [
  {
    id: 1, titulo: 'Tela de login',
    descripcion: 'Formulário com email, senha e validação básica',
    status: 'a-fazer', responsable: 'Lucas', prioridad: 'alta',
    fecha_creacion: '2026-11-08', fecha_limite: '2026-11-20', fecha_conclusion: null,
  },
  {
    id: 2, titulo: 'Corrigir sidebar no Safari',
    descripcion: 'Os ícones ficam desalinhados em telas pequenas',
    status: 'a-fazer', responsable: 'Lucas', prioridad: 'media',
    fecha_creacion: '2026-11-06', fecha_limite: '2026-11-10', fecha_conclusion: null,
  },
  {
    id: 3, titulo: 'Dicionário de dados',
    descripcion: 'Documentar os campos do tareas.json no README',
    status: 'fazendo', responsable: 'Paula', prioridad: 'media',
    fecha_creacion: '2026-11-09', fecha_limite: '2026-11-15', fecha_conclusion: null,
  },
  {
    id: 4, titulo: 'Funções de estatística',
    descripcion: 'Contagem por status, prioridade e responsável',
    status: 'fazendo', responsable: 'Paula', prioridad: 'alta',
    fecha_creacion: '2026-11-10', fecha_limite: '2026-11-18', fecha_conclusion: null,
  },
  {
    id: 5, titulo: 'Paleta e tema escuro',
    descripcion: 'Variáveis CSS integradas ao Bootstrap',
    status: 'feito', responsable: 'Lucas', prioridad: 'baja',
    fecha_creacion: '2026-11-05', fecha_limite: '2026-11-11', fecha_conclusion: '2026-11-11',
  },
  {
    id: 6, titulo: 'Configurar repositório',
    descripcion: 'Branches, colaboradores e README inicial',
    status: 'feito', responsable: 'Lucas', prioridad: 'media',
    fecha_creacion: '2026-11-04', fecha_limite: '2026-11-09', fecha_conclusion: '2026-11-09',
  },
]

export default tarefasExemplo