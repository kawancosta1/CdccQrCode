// ========================================
// IMAGENS DA SALA 1
// ========================================
import mapaSala1 from '../components/img/MapaSala1.png'
import s1Estante1 from '../components/img/EstanteSala1/1.png'
import s1Estante2 from '../components/img/EstanteSala1/2.png'
import s1Estante3 from '../components/img/EstanteSala1/3.png'
import s1Estante4 from '../components/img/EstanteSala1/4.png'
import s1Estante5 from '../components/img/EstanteSala1/5.png'
import s1Estante6 from '../components/img/EstanteSala1/6.png'
import s1Estante7 from '../components/img/EstanteSala1/7.png'
import s1Estante8 from '../components/img/EstanteSala1/8.png'
import s1Estante9 from '../components/img/EstanteSala1/9.png'
import s1Estante10 from '../components/img/EstanteSala1/10.png'
import s1Estante11 from '../components/img/EstanteSala1/11.png'
import s1Estante12 from '../components/img/EstanteSala1/12.png'
import s1Estante13 from '../components/img/EstanteSala1/13.png'
import s1Estante14 from '../components/img/EstanteSala1/14.png'
import s1Estante15 from '../components/img/EstanteSala1/15.png'
import s1Estante16 from '../components/img/EstanteSala1/16.png'
import s1Estante17 from '../components/img/EstanteSala1/17.png'
import s1Estante18 from '../components/img/EstanteSala1/18.png'
import s1Estante19 from '../components/img/EstanteSala1/19.png'
import s1Estante20 from '../components/img/EstanteSala1/20.png'
import s1Estante21 from '../components/img/EstanteSala1/21.png'
import s1Estante22 from '../components/img/EstanteSala1/22.png'
import s1Estante23 from '../components/img/EstanteSala1/23.png'
import s1Estante24 from '../components/img/EstanteSala1/24.png'
import s1Estante25 from '../components/img/EstanteSala1/25.png'

// ========================================
// IMAGENS DA SALA 2
// ========================================
import mapaSala2 from '../components/img/MapaSala2.png'
import s2Estante1 from '../components/img/EstanteSala2/1.png'
import s2Estante2 from '../components/img/EstanteSala2/2.png'
import s2Estante3 from '../components/img/EstanteSala2/3.png'
import s2Estante4 from '../components/img/EstanteSala2/4.png'
import s2Estante5 from '../components/img/EstanteSala2/5.png'
import s2Estante6 from '../components/img/EstanteSala2/6.png'
import s2Estante7 from '../components/img/EstanteSala2/7.png'
import s2Estante8 from '../components/img/EstanteSala2/8.png'
import s2Estante9 from '../components/img/EstanteSala2/9.png'
import s2Estante10 from '../components/img/EstanteSala2/10.png'
import s2Estante11 from '../components/img/EstanteSala2/11.png'
import s2Estante12 from '../components/img/EstanteSala2/12.png'

// ========================================
// TIPO
// ========================================
export type Sala = {
  nome: string;
  mapa: string;
  estantes: { [numero: string]: string };
  setas: { [numero: string]: { top: string; left: string } };
};

// ========================================
// DADOS DAS SALAS
// ========================================
export const sala1: Sala = {
  nome: 'Sala 1',
  mapa: mapaSala1,
  estantes: {
    '1': s1Estante1,
    '2': s1Estante2,
    '3': s1Estante3,
    '4': s1Estante4,
    '5': s1Estante5,
    '6': s1Estante6,
    '7': s1Estante7,
    '8': s1Estante8,
    '9': s1Estante9,
    '10': s1Estante10,
    '11': s1Estante11,
    '12': s1Estante12,
    '13': s1Estante13,
    '14': s1Estante14,
    '15': s1Estante15,
    '16': s1Estante16,
    '17': s1Estante17,
    '18': s1Estante18,
    '19': s1Estante19,
    '20': s1Estante20,
    '21': s1Estante21,
    '22': s1Estante22,
    '23': s1Estante23,
    '24': s1Estante24,
    '25': s1Estante25,
  },
  setas: {
    '1': { top: '42%', left: '26%' },
    '2': { top: '38%', left: '26%' },
    '3': { top: '36%', left: '10%' },
    '4': { top: '27%', left: '26%' },
    '5': { top: '22%', left: '26%' },
    '6': { top: '11%', left: '9%' },
    '7': { top: '2%', left: '17.2%' },
    '8': { top: '11%', left: '32%' },
    '9': { top: '11%', left: '37%' },
    '10': { top: '7%', left: '50%' },
    '11': { top: '7%', left: '55%' },
    '12': { top: '3%', left: '64%' },
    '13': { top: '7%', left: '78%' },
    '14': { top: '23%', left: '72%' },
    '15': { top: '27%', left: '72%' },
    '16': { top: '36%', left: '78%' },
    '17': { top: '39%', left: '72%' },
    '18': { top: '43%', left: '72%' },
    '19': { top: '52%', left: '79%' },
    '20': { top: '55%', left: '72%' },
    '21': { top: '59%', left: '72%' },
    '22': { top: '62%', left: '78%' },
    '23': { top: '70%', left: '75%' },
    '24': { top: '75%', left: '69%' },
    '25': { top: '78%', left: '80%' },
  },
};

export const sala2: Sala = {
  nome: 'Sala 2',
  mapa: mapaSala2,
  estantes: {
    '1': s2Estante1,
    '2': s2Estante2,
    '3': s2Estante3,
    '4': s2Estante4,
    '5': s2Estante5,
    '6': s2Estante6,
    '7': s2Estante7,
    '8': s2Estante8,
    '9': s2Estante9,
    '10': s2Estante10,
    '11': s2Estante11,
    '12': s2Estante12,
  },
  setas: {
    '1': { top: '78%', left: '11.2%' },
    '2': { top: '75%', left: '22%' },
    '3': { top: '72%', left: '22%' },
    '4': { top: '63%', left: '11.2%' },
    '5': { top: '59%', left: '22%' },
    '6': { top: '55.5%', left: '22%' },
    '7': { top: '48%', left: '11.2%' },
    '8': { top: '43.5%', left: '22%' },
    '9': { top: '40.5%', left: '22%' },
    '10': { top: '31%', left: '11.2%' },
    '11': { top: '27.5%', left: '22%' },
    '12': { top: '23.5%', left: '22%' },
  },
};
