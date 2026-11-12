import est1_A from '../components/img/sala3/Estante1/A.webp'
import est1_B from '../components/img/sala3/Estante1/B.webp'
import est1_C from '../components/img/sala3/Estante1/C.webp'

// Estante 2

import est2_C from '../components/img/sala3/Estante2/C.webp'
import est2_D from '../components/img/sala3/Estante2/D.webp'
import est2_E from '../components/img/sala3/Estante2/E.webp'
import est2_F from '../components/img/sala3/Estante2/F.webp'
import est2_G from '../components/img/sala3/Estante2/G.webp'

// Estante 3
import est3_H from '../components/img/sala3/Estante3/H.webp'
import est3_I from '../components/img/sala3/Estante3/I.webp'
import est3_J from '../components/img/sala3/Estante3/J.webp'
import est3_K from '../components/img/sala3/Estante3/K.webp'
import est3_L from '../components/img/sala3/Estante3/L.webp'

// Estante 4

import est4_M from '../components/img/sala3/Estante4/M.webp'
import est4_N from '../components/img/sala3/Estante4/N.webp'
import est4_O from '../components/img/sala3/Estante4/O.webp'
import est4_P from '../components/img/sala3/Estante4/P.webp'
import est4_Q from '../components/img/sala3/Estante4/Q.webp'
import est4_R from '../components/img/sala3/Estante4/R.webp'
// Estante 5

import est5_R from '../components/img/sala3/Estante5/R.webp'
import est5_S from '../components/img/sala3/Estante5/S.webp'
import est5_T from '../components/img/sala3/Estante5/T.webp'
import est5_V from '../components/img/sala3/Estante5/V.webp'
import est5_W from '../components/img/sala3/Estante5/W.webp'
import est5_Y from '../components/img/sala3/Estante5/Y.webp'
import est5_Z from '../components/img/sala3/Estante5/Z.webp'


export interface ImageData {
  images: string[]
  shelf: string
  range: string
}

// por exemplo, imageDatabaseSala3[809.89282 A]
export const imageDatabaseSala3: { [key: string]: ImageData } = {
  // Estante 1 - Range: 809.89282 A - C
  '809.89282 A': { images: [est1_A], shelf: 'Estante 1', range: '809.89282 A - C' },
  '809.89282 B': { images: [est1_B], shelf: 'Estante 1', range: '809.89282 A - C' },
  '809.89282 C': { images: [est1_C, est2_C], shelf: 'Estante 1 / Estante 2', range: '809.89282 A - C / C - G' },

  // Estante 2 - Range: 809.89282 C - G
  '809.89282 D': { images: [est2_D], shelf: 'Estante 2', range: '809.89282 C - G' },
  '809.89282 E': { images: [est2_E], shelf: 'Estante 2', range: '809.89282 C - G' },
  '809.89282 F': { images: [est2_F], shelf: 'Estante 2', range: '809.89282 C - G' },
  '809.89282 G': { images: [est2_G], shelf: 'Estante 2', range: '809.89282 C - G' },

  // Estante 3 - Range: 809.89282 H - L
  '809.89282 H': { images: [est3_H], shelf: 'Estante 3', range: '809.89282 H - L' },
  '809.89282 I': { images: [est3_I], shelf: 'Estante 3', range: '809.89282 H - L' },
  '809.89282 J': { images: [est3_J], shelf: 'Estante 3', range: '809.89282 H - L' },
  '809.89282 K': { images: [est3_K], shelf: 'Estante 3', range: '809.89282 H - L' },
  '809.89282 L': { images: [est3_L], shelf: 'Estante 3', range: '809.89282 H - L' },

  // Estante 4 - Range: 809.89282 M - R
  '809.89282 M': { images: [est4_M], shelf: 'Estante 4', range: '809.89282 M - R' },
  '809.89282 N': { images: [est4_N], shelf: 'Estante 4', range: '809.89282 M - R' },
  '809.89282 O': { images: [est4_O], shelf: 'Estante 4', range: '809.89282 M - R' },
  '809.89282 P': { images: [est4_P], shelf: 'Estante 4', range: '809.89282 M - R' },
  '809.89282 Q': { images: [est4_Q], shelf: 'Estante 4', range: '809.89282 M - R' },
  '809.89282 R': { images: [est4_R, est5_R], shelf: 'Estante 4 / Estante 5', range: '809.89282 M - R / R - Z' },

  // Estante 5 - Range: 809.89282 R - Z
  '809.89282 S': { images: [est5_S], shelf: 'Estante 5', range: '809.89282 R - Z' },
  '809.89282 T': { images: [est5_T], shelf: 'Estante 5', range: '809.89282 R - Z' },
  '809.89282 V': { images: [est5_V], shelf: 'Estante 5', range: '809.89282 R - Z' },
  '809.89282 W': { images: [est5_W], shelf: 'Estante 5', range: '809.89282 R - Z' },
  '809.89282 Y': { images: [est5_Y], shelf: 'Estante 5', range: '809.89282 R - Z' },
  '809.89282 Z': { images: [est5_Z], shelf: 'Estante 5', range: '809.89282 R - Z' },
}

