(function () {
  'use strict';

  /* Práctica de Modelos atómicos: 10 enunciados en dos tandas de 5. La pista
     remite a la línea del tiempo sin decir el nombre del modelo. */
  if (!window.TercialPractica) return;

  window.TercialPractica.init({
    clave: 'tercial:quimica:modelos-atomicos:practica:v1',
    respuestas: {
      'modelo-01': ['Thomson'],
      'modelo-02': ['Bohr'],
      'modelo-03': ['Rutherford'],
      'modelo-04': ['Dalton'],
      'modelo-05': ['Schrödinger'],
      'modelo-06': ['Demócrito'],
      'modelo-07': ['Bohr'],
      'modelo-08': ['Dalton'],
      'modelo-09': ['Thomson'],
      'modelo-10': ['Rutherford']
    },
    retro: {
      'modelo-01': ['Busca el modelo en el que la carga positiva está repartida por todo el átomo.', 'Thomson imaginó una masa positiva con electrones incrustados: el modelo del panqué con pasas.'],
      'modelo-02': ['¿Qué científico habló de niveles, como los escalones de una escalera?', 'Bohr propuso que los electrones sólo pueden estar en ciertos niveles de energía: K, L, M, N…'],
      'modelo-03': ['¿Qué experimento demostró que casi todo el átomo está vacío?', 'Rutherford concluyó que la carga positiva y casi toda la masa están en un núcleo diminuto.'],
      'modelo-04': ['¿Quién imaginó los átomos como esferas sólidas, sin partes?', 'Dalton describió los átomos como esferas indivisibles, iguales para un mismo elemento.'],
      'modelo-05': ['¿En qué modelo el electrón ya no tiene un camino fijo?', 'En el modelo de Schrödinger el electrón se describe como una nube: el orbital es la región donde es más probable encontrarlo.'],
      'modelo-06': ['Fue una idea de la antigua Grecia, mucho antes de los experimentos.', 'Demócrito, junto con Leucipo, llamó átomo a la partícula indivisible; fue una idea filosófica, sin experimentos.'],
      'modelo-07': ['Piensa en la escalera de energía: ¿quién explicó los saltos entre niveles?', 'Según Bohr, el electrón sube de nivel al absorber energía y baja al liberarla.'],
      'modelo-08': ['Uno de los postulados habla de proporciones de números enteros. ¿De quién es?', 'Dalton propuso que los átomos se combinan en números enteros: CO tiene un oxígeno por cada carbono; CO₂, dos.'],
      'modelo-09': ['¿Quién propuso un modelo con electrones incrustados? Primero tuvo que descubrirlos.', 'Thomson descubrió el electrón en 1897 y por eso lo incluyó en su modelo.'],
      'modelo-10': ['¿Quién hizo el experimento de la lámina de oro?', 'Rutherford explicó los rebotes con un núcleo pequeño y positivo que repele a las partículas alfa.']
    }
  });
})();
