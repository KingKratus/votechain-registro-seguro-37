
interface TSEBoletim {
  secao: number;
  zona: number;
  municipio: string;
  estado: string;
  timestamp: string;
  hash: string;
  votos: Record<string, number>;
  dadosTSE: {
    versaoQR: string;
    dataEleicao: string;
    turno: number;
    codigoMunicipio: number;
    totalEleitoresAptos: number;
    totalComparecimento: number;
    totalFaltas: number;
    horaAbertura: string;
    horaFechamento: string;
    votosBrancos: number;
    votosNulos: number;
    totalVotosNominais: number;
    assinatura: string;
  };
}

export const parseTSEQRCode = (qrData: string): TSEBoletim | null => {
  try {
    console.log('Processando QR Code do TSE:', qrData.substring(0, 100) + '...');
    
    // Parse dos campos do QR code do TSE
    const campos = qrData.split(' ');
    const dadosParsed: Record<string, string> = {};
    
    campos.forEach(campo => {
      const [chave, valor] = campo.split(':');
      if (chave && valor) {
        dadosParsed[chave] = valor;
      }
    });
    
    // Extrair votos por candidato
    const votos: Record<string, number> = {};
    let totalVotosNominais = 0;
    
    // Processar votos dos candidatos (números seguidos de dois pontos e votos)
    campos.forEach(campo => {
      const match = campo.match(/^(\d+):(\d+)$/);
      if (match) {
        const numeroCandidato = match[1];
        const quantidadeVotos = parseInt(match[2]);
        votos[`candidato_${numeroCandidato}`] = quantidadeVotos;
        totalVotosNominais += quantidadeVotos;
      }
    });
    
    // Dados principais extraídos
    const zona = parseInt(dadosParsed['ZONA'] || '0');
    const secao = parseInt(dadosParsed['SECA'] || '0');
    const codigoMunicipio = parseInt(dadosParsed['MUNI'] || '0');
    const totalAptos = parseInt(dadosParsed['APTO'] || '0');
    const comparecimento = parseInt(dadosParsed['COMP'] || '0');
    const faltas = parseInt(dadosParsed['FALT'] || '0');
    const votosBrancos = parseInt(dadosParsed['BRAN'] || '0');
    const votosNulos = parseInt(dadosParsed['NULO'] || '0');
    const hash = dadosParsed['HASH'] || '';
    const assinatura = dadosParsed['ASSI'] || '';
    
    // Converter data do formato YYYYMMDD para ISO
    const dataEleicao = dadosParsed['DTPL'] || '';
    const dataFormatada = dataEleicao.length === 8 
      ? `${dataEleicao.substring(0,4)}-${dataEleicao.substring(4,6)}-${dataEleicao.substring(6,8)}`
      : new Date().toISOString().split('T')[0];
    
    // Mapear código do município para nome (simplificado)
    const getMunicipioNome = (codigo: number): string => {
      const municipios: Record<number, string> = {
        30848: 'Belo Horizonte',
        // Adicionar mais mapeamentos conforme necessário
      };
      return municipios[codigo] || `Município ${codigo}`;
    };
    
    const boletim: TSEBoletim = {
      secao,
      zona,
      municipio: getMunicipioNome(codigoMunicipio),
      estado: dadosParsed['UNFE'] === 'ZZ' ? 'MG' : dadosParsed['UNFE'] || 'BR',
      timestamp: new Date().toISOString(),
      hash: hash || `tse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      votos,
      dadosTSE: {
        versaoQR: dadosParsed['VRQR'] || '',
        dataEleicao: dataFormatada,
        turno: parseInt(dadosParsed['TURN'] || '1'),
        codigoMunicipio,
        totalEleitoresAptos: totalAptos,
        totalComparecimento: comparecimento,
        totalFaltas: faltas,
        horaAbertura: dadosParsed['HRAB'] || '',
        horaFechamento: dadosParsed['HRFC'] || '',
        votosBrancos,
        votosNulos,
        totalVotosNominais,
        assinatura
      }
    };
    
    console.log('Boletim processado:', boletim);
    return boletim;
    
  } catch (error) {
    console.error('Erro ao processar QR Code do TSE:', error);
    return null;
  }
};

export const validateTSEHash = (boletim: TSEBoletim): boolean => {
  // Validação básica do hash para evitar duplicatas
  return boletim.hash && boletim.hash.length > 10;
};
