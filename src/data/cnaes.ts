export interface CnaeItem {
  code: string;
  description: string;
  group: string;
  searchKeywords: string[];
}

export const POPULAR_CNAES: CnaeItem[] = [
  {
    code: '6201-5/01',
    description: 'Desenvolvimento de programas de computador sob encomenda',
    group: 'Tecnologia & Software',
    searchKeywords: ['desenvolvimento de software', 'empresa de TI', 'tecnologia', 'software house'],
  },
  {
    code: '6202-3/00',
    description: 'Desenvolvimento e licenciamento de softwares customizáveis',
    group: 'Tecnologia & Software',
    searchKeywords: ['sistemas de gestão', 'software ERP', 'cloud computing'],
  },
  {
    code: '4930-2/02',
    description: 'Transporte rodoviário de carga intermunicipal e interestadual',
    group: 'Logística & Transportes',
    searchKeywords: ['transportadora', 'logística', 'armazém geral', 'frotas de transporte'],
  },
  {
    code: '8610-1/01',
    description: 'Atividades de atendimento hospitalar',
    group: 'Saúde & Medicina',
    searchKeywords: ['hospital', 'clínica médica', 'centro de diagnóstico', 'laboratório de análises'],
  },
  {
    code: '4711-3/02',
    description: 'Comércio varejista de mercadorias em geral (Supermercados)',
    group: 'Varejo & Consumo',
    searchKeywords: ['supermercado', 'hipermercado', 'distribuidora de alimentos'],
  },
  {
    code: '2511-0/00',
    description: 'Fabricação de estruturas metálicas e caldeiraria',
    group: 'Indústria Metalmecânica',
    searchKeywords: ['metalúrgica', 'estruturas metálicas', 'caldeiraria', 'usinagem'],
  },
  {
    code: '4120-4/00',
    description: 'Construção de edifícios residenciais e comerciais',
    group: 'Construção Civil',
    searchKeywords: ['construtora', 'incorporadora', 'engenharia civil', 'obras'],
  },
  {
    code: '7311-4/00',
    description: 'Agências de publicidade e propaganda',
    group: 'Marketing & Comunicação',
    searchKeywords: ['agência de publicidade', 'marketing digital', 'comunicação corporativa'],
  },
  {
    code: '6920-6/01',
    description: 'Atividades de contabilidade e auditoria',
    group: 'Serviços Corporativos & BPO',
    searchKeywords: ['escritório de contabilidade', 'auditoria contábil', 'assessoria tributária'],
  },
  {
    code: '7112-0/00',
    description: 'Serviços de engenharia e consultoria técnica',
    group: 'Engenharia & Projetos',
    searchKeywords: ['empresa de engenharia', 'projetos industriais', 'consultoria técnica'],
  },
  {
    code: '7020-4/00',
    description: 'Atividades de consultoria em gestão empresarial',
    group: 'Consultoria',
    searchKeywords: ['consultoria empresarial', 'gestão de processos', 'consultoria estratégica'],
  },
  {
    code: '4684-2/99',
    description: 'Comércio atacadista de outros produtos químicos e petroquímicos',
    group: 'Química & Energia',
    searchKeywords: ['distribuidora de produtos químicos', 'indústria química', 'combustíveis'],
  },
];
