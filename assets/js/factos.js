/* ============================================================
   factos.js — Afirmaciones (datos duros) para la modalidad
   "Factos". A diferencia de banco.js (opción múltiple), aquí
   cada item es un HECHO declarativo a memorizar al 100 %.

   Esquema por item:
     {
       materia:    clave en minúsculas sin acentos
                   (fisica · quimica · biologia · historia ·
                    geografia · civismo · matematicas · espanol)
       tema:       etiqueta corta (sale como "Materia · Tema")
       afirmacion: oración CORTA y directa (el dato)
       nota:       aclaración o mnemotecnia opcional ("" si no hay)
     }

   Estilo: afirmaciones breves, una idea por tarjeta; el detalle
   secundario va en la nota. Para AGREGAR factos: copia una línea
   y cámbiale los textos. El orden no importa (la tanda se baraja).
   Materia nueva → añádela al mapa LABELS de factos.html.
   Set verificado · 114 afirmaciones (tanda 1: fundamentos · tanda 2:
   recall COMIPEMS 2025).
   ============================================================ */
window.FACTOS = [
  /* —— Física —— */
  {"materia":"fisica","tema":"Transmisión del calor","afirmacion":"El calor se transmite de tres formas: conducción, convección y radiación.","nota":"Conducción en sólidos, convección en fluidos, radiación sin medio (ondas electromagnéticas)."},
  {"materia":"fisica","tema":"Estados de la materia","afirmacion":"De líquido a sólido es solidificación; de sólido a líquido, fusión.","nota":"Fusión = se funde el hielo."},
  {"materia":"fisica","tema":"Cambios de estado","afirmacion":"El paso directo de sólido a gas es sublimación.","nota":"Ejemplo: el hielo seco (dióxido de carbono sólido)."},
  {"materia":"fisica","tema":"Leyes de Newton","afirmacion":"Primera ley (inercia): sin fuerza neta, un cuerpo sigue en reposo o en movimiento rectilíneo uniforme.","nota":"Inercia = resistencia al cambio de movimiento."},
  {"materia":"fisica","tema":"Leyes de Newton","afirmacion":"Tercera ley: a toda acción corresponde una reacción de igual magnitud y sentido contrario.","nota":"Acción y reacción actúan sobre cuerpos distintos."},
  {"materia":"fisica","tema":"Unidades del SI","afirmacion":"En el SI: masa en kilogramo (kg), longitud en metro (m), tiempo en segundo (s).","nota":"Masa en kg, no en gramos."},
  {"materia":"fisica","tema":"Unidades del SI","afirmacion":"En el SI: fuerza en newton (N), energía o trabajo en joule (J).","nota":""},
  {"materia":"fisica","tema":"Tipos de ondas","afirmacion":"Las ondas son mecánicas (necesitan medio material) o electromagnéticas (viajan en el vacío).","nota":"El sonido es una onda mecánica; la luz es electromagnética."},
  {"materia":"fisica","tema":"Óptica básica","afirmacion":"En la reflexión la luz rebota en una superficie; en la refracción cambia de dirección al pasar de un medio a otro.","nota":"Refracción: por eso un lápiz se ve 'quebrado' en el agua."},

  /* —— Química —— */
  {"materia":"quimica","tema":"Tabla periódica","afirmacion":"Las filas horizontales son periodos; las columnas verticales son grupos o familias.","nota":"Periodo = fila; grupo = columna."},
  {"materia":"quimica","tema":"Tabla periódica","afirmacion":"Los elementos se ordenan de menor a mayor número atómico (número de protones).","nota":"El número atómico (Z) es el número de protones del átomo."},
  {"materia":"quimica","tema":"Tipos de enlace","afirmacion":"En el enlace iónico un metal cede electrones a un no metal y los iones se atraen.","nota":"Ejemplo: cloruro de sodio (sal de mesa)."},
  {"materia":"quimica","tema":"Tipos de enlace","afirmacion":"En el enlace covalente dos no metales comparten electrones.","nota":"Ejemplo: molécula de agua (H₂O). Covalente = no metal + no metal."},
  {"materia":"quimica","tema":"Clasificación de materia","afirmacion":"Elemento: un solo tipo de átomo. Compuesto: dos o más elementos unidos químicamente. Mezcla: sustancias combinadas sin reaccionar, separables por métodos físicos.","nota":"Compuesto se separa por métodos químicos; mezcla por físicos."},
  {"materia":"quimica","tema":"Escala de pH","afirmacion":"El pH va de 0 a 14: menor que 7 es ácido, 7 es neutro y mayor que 7 es básico.","nota":"7 = neutro (agua pura); abajo ácido, arriba base."},
  {"materia":"quimica","tema":"Estados de agregación","afirmacion":"Tres estados: sólido (forma y volumen fijos), líquido (volumen fijo, forma variable) y gas (sin forma ni volumen fijos).","nota":"Líquido toma la forma del recipiente; gas se expande."},
  {"materia":"quimica","tema":"Modelo atómico","afirmacion":"El núcleo tiene protones (carga positiva) y neutrones (sin carga); los electrones (carga negativa) giran alrededor.","nota":"Protones (+) y neutrones (0) en el núcleo; electrones (−) afuera."},
  {"materia":"quimica","tema":"Conservación de la materia","afirmacion":"Según Lavoisier, en una reacción química la materia no se crea ni se destruye, solo se transforma.","nota":"Ley de conservación de la materia: masa de reactivos = masa de productos."},

  /* —— Biología —— */
  {"materia":"biologia","tema":"Niveles de organización","afirmacion":"Niveles de la vida, de simple a complejo: átomo, molécula, célula, tejido, órgano, aparato o sistema, organismo, población, comunidad, ecosistema, bioma y biosfera.","nota":"La célula es la unidad mínima con vida."},
  {"materia":"biologia","tema":"Tipos de célula","afirmacion":"Hay dos tipos de células: procariota, sin núcleo definido y con material genético libre en el citoplasma; eucariota, con núcleo rodeado de membrana.","nota":"Bacterias = procariotas; plantas, animales y hongos = eucariotas."},
  {"materia":"biologia","tema":"Fotosíntesis","afirmacion":"En la fotosíntesis: dióxido de carbono + agua + luz → glucosa + oxígeno.","nota":"La clorofila capta la luz; ocurre en el cloroplasto."},
  {"materia":"biologia","tema":"Reinos de los seres vivos","afirmacion":"Los cinco reinos son: Monera (bacterias), Protista (protozoarios y algas), Fungi (hongos), Plantae (plantas) y Animalia (animales).","nota":"Mnemotecnia: 'Mi Primo Fue Por Agua' (Monera, Protista, Fungi, Plantae, Animalia)."},
  {"materia":"biologia","tema":"ADN y genes","afirmacion":"El ADN guarda la información genética; un gen es un fragmento de ADN con instrucciones para una característica.","nota":"El ADN es ácido desoxirribonucleico; los genes están en los cromosomas, dentro del núcleo."},
  {"materia":"biologia","tema":"Respiración celular","afirmacion":"En la respiración celular: glucosa + oxígeno → energía + dióxido de carbono + agua.","nota":"Es lo inverso a la fotosíntesis; ocurre en la mitocondria."},
  {"materia":"biologia","tema":"Cadena alimenticia","afirmacion":"Productores fabrican su alimento (plantas); consumidores comen otros seres vivos; descomponedores degradan materia muerta (hongos y bacterias).","nota":"La energía fluye del productor hacia los consumidores."},
  {"materia":"biologia","tema":"Aparato circulatorio","afirmacion":"El aparato circulatorio lo forman corazón, venas, arterias y capilares; transporta sangre con oxígeno y nutrientes a todo el cuerpo.","nota":"Las arterias llevan sangre desde el corazón; las venas la regresan."},

  /* —— Historia de México —— */
  {"materia":"historia","tema":"Independencia","afirmacion":"La Independencia inició el 16 de septiembre de 1810 con el Grito de Dolores, de Miguel Hidalgo.","nota":"Por eso el 16 de septiembre es el Día de la Independencia."},
  {"materia":"historia","tema":"Independencia","afirmacion":"Morelos convocó en 1813 el Congreso de Chilpancingo y presentó los 'Sentimientos de la Nación'.","nota":"Morelos tomó el relevo de la lucha de independencia tras la muerte de Hidalgo."},
  {"materia":"historia","tema":"Independencia","afirmacion":"La Independencia de México se consumó el 27 de septiembre de 1821, cuando el Ejército Trigarante entró a la Ciudad de México con Iturbide.","nota":"Trigarante = tres garantías: religión, independencia y unión."},
  {"materia":"historia","tema":"Reforma","afirmacion":"Las Leyes de Reforma, bajo Benito Juárez, separaron Iglesia y Estado y crearon el registro civil y el matrimonio civil.","nota":"Buscaban un Estado laico (sin poder de la Iglesia)."},
  {"materia":"historia","tema":"Reforma","afirmacion":"Benito Juárez dijo \"El respeto al derecho ajeno es la paz\" y defendió la República contra la intervención francesa.","nota":"Encabezó el gobierno republicano frente al Segundo Imperio de Maximiliano (1864-1867)."},
  {"materia":"historia","tema":"Porfiriato","afirmacion":"El Porfiriato (1876-1911): Porfirio Díaz gobernó más de 30 años con progreso material, pero dictadura y desigualdad.","nota":"Su lema fue \"orden y progreso\"."},
  {"materia":"historia","tema":"Revolución Mexicana","afirmacion":"La Revolución inició el 20 de noviembre de 1910, cuando Madero llamó a levantarse contra Porfirio Díaz.","nota":"El 20 de noviembre se conmemora la Revolución."},
  {"materia":"historia","tema":"Planes y documentos","afirmacion":"El Plan de San Luis (Madero) desconocía a Díaz e iniciaba la Revolución; el Plan de Ayala (Zapata) exigía repartir tierras.","nota":"San Luis = Madero; Ayala = Zapata ('Tierra y Libertad')."},
  {"materia":"historia","tema":"Constitución de 1917","afirmacion":"La Constitución se promulgó el 5 de febrero de 1917 en Querétaro, bajo Carranza, y sigue vigente.","nota":"Destacan los artículos 3 (educación), 27 (tierra) y 123 (trabajo)."},

  /* —— Geografía —— */
  {"materia":"geografia","tema":"Capas de la Tierra","afirmacion":"La Tierra tiene tres capas: corteza, manto y núcleo.","nota":"Corteza: la más externa y delgada; núcleo: la más interna y caliente."},
  {"materia":"geografia","tema":"Movimientos terrestres","afirmacion":"La rotación es el giro de la Tierra sobre su eje y dura 24 horas.","nota":"Rotación = día y noche."},
  {"materia":"geografia","tema":"Movimientos terrestres","afirmacion":"La traslación es el recorrido de la Tierra alrededor del Sol y dura 365 días.","nota":"Traslación + inclinación del eje = estaciones del año."},
  {"materia":"geografia","tema":"Husos horarios","afirmacion":"El meridiano de Greenwich es el meridiano 0° y mide la longitud.","nota":"Greenwich es la referencia de los husos horarios."},
  {"materia":"geografia","tema":"Coordenadas geográficas","afirmacion":"La latitud mide en grados desde el Ecuador al norte o sur; la longitud, desde Greenwich al este u oeste.","nota":"Latitud: norte/sur; longitud: este/oeste."},
  {"materia":"geografia","tema":"Capas de la atmósfera","afirmacion":"La atmósfera tiene cinco capas: troposfera, estratosfera, mesosfera, termosfera y exosfera.","nota":"En la troposfera ocurre el clima; en la estratosfera está la capa de ozono."},

  /* —— Formación Cívica y Ética —— */
  {"materia":"civismo","tema":"División de poderes","afirmacion":"En México el poder de la Federación se divide en tres: Ejecutivo, Legislativo y Judicial.","nota":"Mnemotecnia E-L-J. Evita que el poder se concentre en una persona."},
  {"materia":"civismo","tema":"Poder Ejecutivo","afirmacion":"El Poder Ejecutivo federal lo encabeza el Presidente: dura seis años y no se reelige.","nota":"El periodo de seis años se llama sexenio."},
  {"materia":"civismo","tema":"Poder Legislativo","afirmacion":"El Poder Legislativo es el Congreso de la Unión: Cámara de Diputados y Cámara de Senadores. Hace las leyes.","nota":"Por tener dos cámaras (Diputados y Senadores) se le llama bicameral."},
  {"materia":"civismo","tema":"Poder Judicial","afirmacion":"El Poder Judicial imparte justicia e interpreta las leyes; su máximo órgano es la SCJN.","nota":"SCJN: Suprema Corte de Justicia de la Nación."},
  {"materia":"civismo","tema":"Constitución","afirmacion":"La Constitución es la ley suprema; ninguna otra ley puede contradecirla. Se promulgó el 5 de febrero de 1917.","nota":"Por ser la ley máxima se le llama Carta Magna."},
  {"materia":"civismo","tema":"Democracia","afirmacion":"En la democracia el pueblo elige a sus representantes con voto libre, secreto y universal.","nota":"Del griego demos (pueblo) y kratos (poder o gobierno)."},
  {"materia":"civismo","tema":"Derechos humanos","afirmacion":"Los derechos humanos son universales, inalienables e indivisibles: no pueden quitarse ni venderse.","nota":"Pertenecen a todas las personas por el solo hecho de existir."},
  {"materia":"civismo","tema":"Instituciones","afirmacion":"El INE organiza las elecciones federales; la CNDH protege y defiende los derechos humanos.","nota":"INE: Instituto Nacional Electoral. CNDH: Comisión Nacional de los Derechos Humanos."},
  {"materia":"civismo","tema":"Estado de derecho","afirmacion":"En un Estado de derecho todas las personas y autoridades están sometidas a la ley.","nota":"Nadie está por encima de la ley."},

  /* —— Matemáticas —— */
  {"materia":"matematicas","tema":"Triángulos","afirmacion":"Los ángulos internos de un triángulo suman 180°.","nota":"Vale para todo triángulo, sin importar su forma."},
  {"materia":"matematicas","tema":"Teorema de Pitágoras","afirmacion":"En un triángulo rectángulo, donde c es la hipotenusa: a² + b² = c².","nota":"La hipotenusa (c) es el lado opuesto al ángulo recto y el más largo."},
  {"materia":"matematicas","tema":"Números primos","afirmacion":"Un primo es mayor que 1 y solo tiene dos divisores: 1 y él mismo.","nota":"El 2 es el único primo par."},
  {"materia":"matematicas","tema":"Jerarquía de operaciones","afirmacion":"Orden: paréntesis, potencias y raíces, multiplicaciones y divisiones, sumas y restas.","nota":"Con igual jerarquía, se resuelven de izquierda a derecha."},
  {"materia":"matematicas","tema":"Área del círculo","afirmacion":"El área del círculo es A = π·r², donde r es el radio.","nota":"El perímetro (circunferencia) es C = 2·π·r."},
  {"materia":"matematicas","tema":"Propiedad conmutativa","afirmacion":"El orden de los sumandos o factores no altera el resultado: a + b = b + a y a·b = b·a.","nota":"Aplica a suma y multiplicación, no a resta ni división."},
  {"materia":"matematicas","tema":"Porcentaje","afirmacion":"Un porcentaje es una fracción con denominador 100: 25% = 25/100 = 0.25.","nota":"\"Por ciento\" significa \"de cada cien\"."},
  {"materia":"matematicas","tema":"Área del triángulo","afirmacion":"El área del triángulo es A = (b·h)/2.","nota":"La altura debe ser perpendicular a la base."},
  {"materia":"matematicas","tema":"Fracción","afirmacion":"El numerador indica las partes tomadas; el denominador, en cuántas se divide el entero.","nota":"El numerador va arriba y el denominador abajo."},

  /* —— Español —— */
  {"materia":"espanol","tema":"Acentuación","afirmacion":"Las agudas llevan la fuerza en la última sílaba; tildan si terminan en n, s o vocal.","nota":"Ej: camión, compás, café. Sin tilde: reloj, papel, verdad."},
  {"materia":"espanol","tema":"Acentuación","afirmacion":"Las graves llevan la fuerza en la penúltima sílaba; tildan si NO terminan en n, s ni vocal.","nota":"Ej: árbol, lápiz, fácil."},
  {"materia":"espanol","tema":"Acentuación","afirmacion":"Las palabras esdrújulas llevan el acento en la antepenúltima sílaba y siempre se acentúan gráficamente, sin excepción.","nota":"Ej: pájaro, médico, lámpara."},
  {"materia":"espanol","tema":"Figuras retóricas","afirmacion":"El símil compara con un nexo ('como', 'cual'); la metáfora identifica un elemento con otro sin nexo.","nota":"Símil: 'ojos como luceros'; metáfora: 'sus ojos son luceros'."},
  {"materia":"espanol","tema":"Tipos de texto","afirmacion":"El narrativo cuenta hechos en el tiempo; el expositivo explica con objetividad; el argumentativo defiende una opinión con razones.","nota":"Narra, explica, convence."},
  {"materia":"espanol","tema":"Partes de la oración","afirmacion":"El sustantivo nombra; el adjetivo describe o califica al sustantivo; el verbo expresa acción, estado o proceso.","nota":"Quién/qué, cómo es, qué hace."},
  {"materia":"espanol","tema":"Signos de puntuación","afirmacion":"El punto y coma (;) separa elementos de una enumeración que ya tienen comas o une oraciones relacionadas; marca pausa entre coma y punto.","nota":"Pausa intermedia entre coma y punto."},
  {"materia":"espanol","tema":"Acentuación diacrítica","afirmacion":"La tilde diacrítica distingue palabras de igual escritura pero distinta función, como 'tú' (pronombre) frente a 'tu' (posesivo) o 'sí' (afirmación) frente a 'si' (condición).","nota":"Otros pares: él/el, más/mas, té/te."},

  /* ============================================================
     Tanda 2 · datos curados del recall COMIPEMS 2025.
     Solo hechos declarativos NUEVOS (lo numérico y las analogías
     de español van a banco.js; lo que ya estaba en química/física
     no se repite).
     ============================================================ */

  /* —— Biología —— */
  {"materia":"biologia","tema":"Biodiversidad de México","afirmacion":"La gran biodiversidad de México se debe a su clima y su topografía.","nota":"Por eso es un país megadiverso."},
  {"materia":"biologia","tema":"Cadena alimenticia","afirmacion":"Los descomponedores (desintegradores) se alimentan de cadáveres, excremento y residuos, y los descomponen.","nota":"Cierran el ciclo devolviendo nutrientes al suelo."},
  {"materia":"biologia","tema":"Medio ambiente","afirmacion":"El desarrollo sustentable es el conjunto de acciones para usar los recursos naturales sin agotarlos.","nota":"Cubre las necesidades de hoy sin comprometer las del futuro."},
  {"materia":"biologia","tema":"Genética","afirmacion":"El genotipo son los genes que se heredan; el fenotipo son los rasgos que se ven.","nota":"Gemelos idénticos: mismo fenotipo; cuando se parecen pero difieren, es en el genotipo."},
  {"materia":"biologia","tema":"Respiración","afirmacion":"La respiración aerobia (con oxígeno) libera más energía que la anaerobia (sin oxígeno).","nota":"Las bacterias de pantanos hacen respiración anaerobia."},
  {"materia":"biologia","tema":"Organismos autótrofos","afirmacion":"Los autótrofos, como las plantas (reino Plantae), transforman la energía luminosa en química y liberan oxígeno.","nota":"Lo hacen en la fotosíntesis."},
  {"materia":"biologia","tema":"Salud","afirmacion":"El virus del papiloma humano (VPH) se relaciona con el cáncer cervicouterino.","nota":"Es una infección de transmisión sexual."},
  {"materia":"biologia","tema":"Salud","afirmacion":"La candidiasis es causada por un hongo.","nota":""},
  {"materia":"biologia","tema":"Nutrición","afirmacion":"La vitamina A (en zanahoria y calabaza) ayuda a prevenir la ceguera nocturna.","nota":"En diabetes y obesidad se restringen carbohidratos y lípidos."},
  {"materia":"biologia","tema":"Contaminación","afirmacion":"Los principales gases de efecto invernadero son el dióxido de carbono y el metano.","nota":""},
  {"materia":"biologia","tema":"Contaminación","afirmacion":"La inversión térmica ocurre cuando una capa de aire frío atrapa los gases contaminantes cerca del suelo.","nota":"Frecuente en invierno; impide que se dispersen los contaminantes."},

  /* —— Geografía —— */
  {"materia":"geografia","tema":"Representación de la Tierra","afirmacion":"El plano representa un área pequeña sin coordenadas; el mapa topográfico representa el relieve.","nota":"Plano = sin coordenadas; topográfico = relieve."},
  {"materia":"geografia","tema":"Tecnología","afirmacion":"El GPS sirve para localizar objetos, personas o lugares en la superficie terrestre.","nota":"Sistema de Posicionamiento Global."},
  {"materia":"geografia","tema":"Recursos energéticos","afirmacion":"La energía eólica proviene del viento y la geotérmica del calor del subsuelo.","nota":"Ambas son renovables."},
  {"materia":"geografia","tema":"Economía de México","afirmacion":"México ocupa el primer lugar mundial en producción de plata.","nota":""},
  {"materia":"geografia","tema":"Territorio nacional","afirmacion":"El mar territorial mexicano se extiende 12 millas náuticas desde la costa.","nota":""},
  {"materia":"geografia","tema":"Megadiversidad","afirmacion":"México es megadiverso por su ubicación geográfica, su topografía y su clima.","nota":"Lo cruzan la Sierra Madre Oriental, Occidental y del Sur."},
  {"materia":"geografia","tema":"Desarrollo humano","afirmacion":"Entre los estados con menor índice de desarrollo humano están Oaxaca, Chiapas y Guerrero.","nota":""},
  {"materia":"geografia","tema":"Sismicidad","afirmacion":"Los estados más propensos a sismos son Oaxaca, Guerrero y Michoacán.","nota":"Por el contacto de placas en la costa del Pacífico."},
  {"materia":"geografia","tema":"Regiones naturales","afirmacion":"Las regiones de desierto y estepa de México se localizan en el norte del país.","nota":""},
  {"materia":"geografia","tema":"Medio rural","afirmacion":"El medio rural se caracteriza por actividades primarias, espacios amplios y menos servicios públicos.","nota":"Primarias = agricultura, ganadería, pesca."},

  /* —— Civismo (Formación cívica y ética) —— */
  {"materia":"civismo","tema":"Identidad","afirmacion":"La moral es el conjunto de valores, creencias y conductas que se transmiten de generación en generación.","nota":"Influye en la identidad personal."},
  {"materia":"civismo","tema":"Elecciones","afirmacion":"El INE (Instituto Nacional Electoral) organiza los procesos electorales en México.","nota":"Antes se llamó IFE, creado a finales de los años 1990."},
  {"materia":"civismo","tema":"Constitución","afirmacion":"El Artículo 3.º establece que la educación debe ser laica, gratuita y obligatoria.","nota":""},
  {"materia":"civismo","tema":"Constitución","afirmacion":"Los artículos 6.º y 7.º garantizan la libertad de expresión; el 1.º consagra los derechos para todas las personas.","nota":""},
  {"materia":"civismo","tema":"Violencia","afirmacion":"El acoso sexual es la molestia verbal o emocional constante; el abuso sexual es el contacto físico no consentido.","nota":""},
  {"materia":"civismo","tema":"Derechos humanos","afirmacion":"La Declaración Universal de los Derechos Humanos reconoce que toda persona tiene derecho al trabajo.","nota":""},

  /* —— Historia de México —— */
  {"materia":"historia","tema":"Revolución · Plan de Guadalupe","afirmacion":"Con el Plan de Guadalupe, Venustiano Carranza desconoció el gobierno de Victoriano Huerta.","nota":""},
  {"materia":"historia","tema":"Revolución · Zapatismo","afirmacion":"El zapatismo se basó en el Plan de Ayala, con el lema «Tierra y Libertad», para devolver la tierra a los campesinos.","nota":""},
  {"materia":"historia","tema":"México contemporáneo","afirmacion":"El presidente Adolfo Ruiz Cortines otorgó el voto a la mujer en México.","nota":"Voto femenino a nivel federal, en 1953."},
  {"materia":"historia","tema":"Culturas prehispánicas","afirmacion":"Los toltecas se asentaron en Tula, Hidalgo, y son célebres por los Atlantes de Tula.","nota":"El centro y sur de México forman parte de Mesoamérica."},

  /* —— Historia Universal —— */
  {"materia":"historia","tema":"Universal · Edad Moderna","afirmacion":"La caída de Constantinopla (1453) impulsó los viajes de exploración para buscar nuevas rutas a la India.","nota":"Se comerciaban especias, seda y porcelana."},
  {"materia":"historia","tema":"Universal · Humanismo","afirmacion":"El humanismo (siglos XV y XVI) puso al ser humano como centro del universo.","nota":"Base del Renacimiento, movimiento artístico y cultural."},
  {"materia":"historia","tema":"Universal · Ilustración","afirmacion":"La Ilustración fue un movimiento intelectual basado en la razón humana.","nota":"Influyó en la independencia de México y de las Trece Colonias."},
  {"materia":"historia","tema":"Universal · Independencia de EE. UU.","afirmacion":"La independencia de las Trece Colonias se detonó por los altos impuestos (al té y al timbre) y las ideas de la Ilustración.","nota":""},
  {"materia":"historia","tema":"Universal · Imperialismo","afirmacion":"El imperialismo es la dominación de una nación poderosa sobre otra más débil.","nota":"Se asocia con monopolios y concentración del poder."},
  {"materia":"historia","tema":"Universal · Siglo XX","afirmacion":"La ONU surgió en 1945, tras la Segunda Guerra Mundial, para mantener la paz.","nota":""},
  {"materia":"historia","tema":"Universal · Guerra Fría","afirmacion":"En el capitalismo la propiedad es privada (bloque de la OTAN); en el socialismo es pública (Pacto de Varsovia).","nota":"EE. UU. lideró el capitalismo; la URSS, el socialismo."},

  /* —— Química (solo lo nuevo; estados, enlaces, pH y ácidos/bases ya están arriba) —— */
  {"materia":"quimica","tema":"Electrones de valencia","afirmacion":"Los electrones de valencia están en el último nivel de energía y son los que se usan en la estructura de Lewis.","nota":"También determinan cómo se enlaza el átomo."},
  {"materia":"quimica","tema":"Partículas del átomo","afirmacion":"Los electrones están en la parte externa del átomo y le dan sus propiedades químicas.","nota":""},
  {"materia":"quimica","tema":"Cantidad de sustancia","afirmacion":"El mol es la unidad que mide la cantidad de sustancia.","nota":""},
  {"materia":"quimica","tema":"Reacción de neutralización","afirmacion":"Un ácido más una base producen una sal y agua: HCl + NaOH → NaCl + H₂O.","nota":"Es una reacción de neutralización."},

  /* —— Física (solo lo nuevo) —— */
  {"materia":"fisica","tema":"Equilibrio térmico","afirmacion":"El calor siempre fluye del cuerpo de mayor temperatura al de menor, hasta alcanzar el equilibrio térmico.","nota":""},
  {"materia":"fisica","tema":"Conductores y aislantes","afirmacion":"Son aislantes la madera, el plástico, la tela y la porcelana; los metales son buenos conductores.","nota":""},
  {"materia":"fisica","tema":"Magnetismo","afirmacion":"En un imán, los polos iguales se repelen y los opuestos se atraen.","nota":"Una bobina con corriente forma un electroimán."},
  {"materia":"fisica","tema":"Radiación","afirmacion":"El Sol nos llega por radiación: transmite energía luminosa y calorífica sin necesidad de un medio.","nota":""},
  {"materia":"fisica","tema":"Espectro electromagnético","afirmacion":"Los visores de visión nocturna funcionan con ondas infrarrojas.","nota":""},
];
