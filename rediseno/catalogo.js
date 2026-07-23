/* catalogo.js · Catálogo común de temas + rutas por nivel (Tercial)
   ───────────────────────────────────────────────────────────────
   El modelo del tronco común hecho DATOS (ver rediseno/TEMARIOS.md):
   - Un solo catálogo de TEMAS (nodos con id estable), definido una vez.
   - Dos RUTAS ordenadas (prepa / uni) que solo referencian ids.
   - El tronco común aparece en LAS DOS rutas con el MISMO id (no se
     duplica); cada nivel elige su "profundidad".
   Los generadores viven en ejercicios-motor.js; aquí solo se referencian
   por id. `estado: 'disponible'` = ya tiene generador; 'pendiente' = en
   camino (aparece en la ruta pero todavía no lanza práctica). */
window.TercialCatalogo = (function () {
  'use strict';

  /* tronco común (mate) — mismos nodos para prepa y uni */
  var TRONCO = [
    { id: 'mat-signos-suma', materia: 'matematicas', titulo: 'Signos', sub: 'suma y resta',
      niveles: { prepa: { profundidad: 'basica' }, uni: { profundidad: 'fundamentos' } },
      prerrequisitos: [], generadores: ['signos-suma'], estado: 'disponible' },

    { id: 'mat-signos-producto', materia: 'matematicas', titulo: 'Signos', sub: 'multiplicar y dividir',
      niveles: { prepa: { profundidad: 'basica' }, uni: { profundidad: 'fundamentos' } },
      prerrequisitos: ['mat-signos-suma'], generadores: ['signos-mul'], estado: 'disponible' },

    { id: 'mat-potencias', materia: 'matematicas', titulo: 'Potencias', sub: 'y radicales',
      niveles: { prepa: { profundidad: 'basica' }, uni: { profundidad: 'fundamentos' } },
      prerrequisitos: ['mat-signos-producto'], generadores: ['potencias'], estado: 'disponible' },

    { id: 'mat-fracciones-suma', materia: 'matematicas', titulo: 'Fracciones', sub: 'suma y resta',
      niveles: { prepa: { profundidad: 'basica' }, uni: { profundidad: 'fundamentos' } },
      prerrequisitos: ['mat-signos-suma'], generadores: ['frac-suma'], estado: 'disponible' },

    { id: 'mat-fracciones-producto', materia: 'matematicas', titulo: 'Fracciones', sub: 'multiplicar y dividir',
      niveles: { prepa: { profundidad: 'basica' }, uni: { profundidad: 'fundamentos' } },
      prerrequisitos: ['mat-fracciones-suma', 'mat-signos-producto'], generadores: ['frac-mul'], estado: 'disponible' },

    { id: 'mat-productos-notables', materia: 'matematicas', titulo: 'Productos', sub: 'notables',
      niveles: { prepa: { profundidad: 'basica' }, uni: { profundidad: 'fundamentos' } },
      prerrequisitos: ['mat-signos-producto', 'mat-fracciones-suma'], generadores: ['prod-notables'], estado: 'disponible' },

    { id: 'mat-factorizacion', materia: 'matematicas', titulo: 'Factorizar', sub: 'trinomios',
      niveles: { prepa: { profundidad: 'basica' }, uni: { profundidad: 'fundamentos' } },
      prerrequisitos: ['mat-productos-notables'], generadores: ['factorizacion'], estado: 'disponible' },

    { id: 'mat-ecuaciones-lineales', materia: 'matematicas', titulo: 'Ecuaciones', sub: '1er grado',
      niveles: { prepa: { profundidad: 'basica' }, uni: { profundidad: 'fundamentos' } },
      prerrequisitos: ['mat-signos-suma', 'mat-fracciones-suma'], generadores: ['ecuacion'], estado: 'disponible' },

    { id: 'mat-ecuaciones-cuadraticas', materia: 'matematicas', titulo: 'Ecuaciones', sub: '2º grado',
      niveles: { prepa: { profundidad: 'basica' }, uni: { profundidad: 'fundamentos' } },
      prerrequisitos: ['mat-factorizacion', 'mat-ecuaciones-lineales'], generadores: ['cuadratica'], estado: 'disponible' },

    { id: 'mat-sistemas-2x2', materia: 'matematicas', titulo: 'Sistemas', sub: '2×2',
      niveles: { prepa: { profundidad: 'basica' }, uni: { profundidad: 'fundamentos' } },
      prerrequisitos: ['mat-ecuaciones-lineales'], generadores: ['sistemas'], estado: 'disponible' }
  ];

  /* ramas divergentes (aún sin generador; marcan a dónde crece cada árbol) */
  var SOLO_PREPA = [
    { id: 'mat-estadistica', materia: 'matematicas', titulo: 'Estadística', sub: 'y probabilidad',
      niveles: { prepa: { profundidad: 'basica' } }, prerrequisitos: [], generadores: [], estado: 'pendiente' },
    { id: 'mat-geometria', materia: 'matematicas', titulo: 'Geometría', sub: 'perímetros, áreas, volúmenes',
      niveles: { prepa: { profundidad: 'basica' } }, prerrequisitos: [], generadores: [], estado: 'pendiente' }
  ];
  var SOLO_UNI = [
    { id: 'mat-desigualdades', materia: 'matematicas', titulo: 'Desigualdades', sub: '',
      niveles: { uni: { profundidad: 'completa' } }, prerrequisitos: ['mat-ecuaciones-lineales'], generadores: [], estado: 'pendiente' },
    { id: 'mat-funciones', materia: 'matematicas', titulo: 'Funciones', sub: 'algebraicas',
      niveles: { uni: { profundidad: 'completa' } }, prerrequisitos: ['mat-ecuaciones-lineales'], generadores: [], estado: 'pendiente' },
    { id: 'mat-trigonometria', materia: 'matematicas', titulo: 'Trigonometría', sub: '',
      niveles: { uni: { profundidad: 'completa' } }, prerrequisitos: ['mat-funciones'], generadores: [], estado: 'pendiente' },
    { id: 'mat-exp-log', materia: 'matematicas', titulo: 'Exp. y log.', sub: '',
      niveles: { uni: { profundidad: 'completa' } }, prerrequisitos: ['mat-funciones'], generadores: [], estado: 'pendiente' },
    { id: 'mat-conicas', materia: 'matematicas', titulo: 'Geometría analítica', sub: 'cónicas',
      niveles: { uni: { profundidad: 'completa' } }, prerrequisitos: ['mat-funciones'], generadores: [], estado: 'pendiente' },
    { id: 'mat-calculo', materia: 'matematicas', titulo: 'Cálculo', sub: 'límites, derivada, integral',
      niveles: { uni: { profundidad: 'completa' } }, prerrequisitos: ['mat-funciones'], generadores: [], estado: 'pendiente' }
  ];

  var TEMAS = TRONCO.concat(SOLO_PREPA, SOLO_UNI);
  var PORID = {};
  TEMAS.forEach(function (t) { PORID[t.id] = t; });

  /* rutas = orden de temas por nivel (el tronco es idéntico en ambas). */
  var idsTronco = TRONCO.map(function (t) { return t.id; });
  var RUTAS = {
    prepa: idsTronco.concat(['mat-estadistica', 'mat-geometria']),
    uni:   idsTronco.concat(['mat-desigualdades', 'mat-funciones', 'mat-trigonometria', 'mat-exp-log', 'mat-conicas', 'mat-calculo'])
  };

  function temaPorId(id) { return PORID[id] || null; }
  function temasDeRuta(nivel) { return (RUTAS[nivel] || RUTAS.uni).map(temaPorId).filter(Boolean); }
  function disponibles(nivel) { return temasDeRuta(nivel).filter(function (t) { return t.estado === 'disponible'; }); }
  function pendientes(nivel) { return temasDeRuta(nivel).filter(function (t) { return t.estado !== 'disponible'; }); }

  return { TEMAS: TEMAS, RUTAS: RUTAS, temaPorId: temaPorId,
           temasDeRuta: temasDeRuta, disponibles: disponibles, pendientes: pendientes };
})();
