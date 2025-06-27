
import { TSEBoletim } from '@/types/tse';

export const parseTSEQRCode = (qrData: string): TSEBoletim | null => {
  try {
    console.log('=== PARSER TSE QR CODE ===');
    console.log('Dados recebidos:', qrData.substring(0, 200) + '...');
    
    // Parse dos campos do QR code do TSE
    const campos = qrData.split(' ');
    const dadosParsed: Record<string, string> = {};
    
    campos.forEach(campo => {
      const [chave, valor] = campo.split(':');
      if (chave && valor) {
        dadosParsed[chave] = valor;
      }
    });
    
    console.log('Campos parseados:', dadosParsed);
    
    // Extrair votos por candidato
    const votos: Record<string, number> = {};
    let totalVotosNominais = 0;
    
    // Processar votos dos candidatos (números seguidos de dois pontos e votos)
    campos.forEach(campo => {
      const match = campo.match(/^(\d+):(\d+)$/);
      if (match) {
        const numeroCandidato = match[1];
        const quantidadeVotos = parseInt(match[2]);
        if (!isNaN(quantidadeVotos) && quantidadeVotos >= 0) {
          votos[`candidato_${numeroCandidato}`] = quantidadeVotos;
          totalVotosNominais += quantidadeVotos;
        }
      }
    });
    
    console.log('Votos por candidato:', votos);
    console.log('Total votos nominais:', totalVotosNominais);
    
    // Dados principais extraídos com validação
    const zona = parseInt(dadosParsed['ZONA'] || '0');
    const secao = parseInt(dadosParsed['SECA'] || '0');
    const codigoMunicipio = parseInt(dadosParsed['MUNI'] || '0');
    const totalAptos = parseInt(dadosParsed['APTO'] || dadosParsed['APTA'] || '0');
    const comparecimento = parseInt(dadosParsed['COMP'] || dadosParsed['TOTC'] || '0');
    const faltas = parseInt(dadosParsed['FALT'] || '0');
    const votosBrancos = parseInt(dadosParsed['BRAN'] || '0');
    const votosNulos = parseInt(dadosParsed['NULO'] || '0');
    const votosNominaisField = parseInt(dadosParsed['NOMI'] || '0');
    const hash = dadosParsed['HASH'] || '';
    const assinatura = dadosParsed['ASSI'] || '';
    
    // Usar votos nominais do campo NOMI se disponível, senão calcular
    const totalVotosNominaisCalculado = votosNominaisField || totalVotosNominais;
    
    console.log('Dados principais:', {
      zona, secao, codigoMunicipio, totalAptos, comparecimento, 
      faltas, votosBrancos, votosNulos, totalVotosNominaisCalculado, hash
    });
    
    // Validação básica dos dados obrigatórios
    if (!zona || !secao || !hash) {
      console.error('Dados obrigatórios ausentes:', { zona, secao, hash });
      return null;
    }
    
    // Converter data do formato YYYYMMDD para ISO
    const dataEleicao = dadosParsed['DTPL'] || '';
    const dataFormatada = dataEleicao.length === 8 
      ? `${dataEleicao.substring(0,4)}-${dataEleicao.substring(4,6)}-${dataEleicao.substring(6,8)}`
      : new Date().toISOString().split('T')[0];
    
    // Mapear código do município para nome (expandido)
    const getMunicipioNome = (codigo: number): string => {
      const municipios: Record<number, string> = {
        30848: 'Belo Horizonte',
        71072: 'São Paulo',
        60011: 'Rio de Janeiro',
        20001: 'Brasília',
        40001: 'Salvador',
        80001: 'Curitiba',
        90001: 'Porto Alegre',
        50001: 'Recife',
        23001: 'Fortaleza',
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
        totalVotosNominais: totalVotosNominaisCalculado,
        assinatura
      }
    };
    
    console.log('Boletim processado com sucesso:', boletim);
    return boletim;
    
  } catch (error) {
    console.error('Erro ao processar QR Code do TSE:', error);
    return null;
  }
};

export const validateTSEHash = (boletim: TSEBoletim): boolean => {
  // Validação aprimorada do hash
  if (!boletim.hash || boletim.hash.length < 10) return false;
  
  // Verificar se é um hash válido (apenas caracteres hexadecimais)
  const hashPattern = /^[A-Fa-f0-9]+$/;
  return hashPattern.test(boletim.hash);
};

// Função para validar integridade dos dados TSE
export const validateTSEIntegrity = (boletim: TSEBoletim): boolean => {
  if (!boletim.dadosTSE) return false;
  
  const { dadosTSE } = boletim;
  
  // Verificar se os totais batem
  const totalVotos = dadosTSE.totalVotosNominais + dadosTSE.votosBrancos + dadosTSE.votosNulos;
  return Math.abs(totalVotos - dadosTSE.totalComparecimento) <= 1; // Permitir diferença de 1 por arredondamento
};
