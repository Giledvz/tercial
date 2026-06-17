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
       afirmacion: la oración completa que se muestra grande
       nota:       aclaración o mnemotecnia opcional ("" si no hay)
     }

   Para AGREGAR factos: copia una línea, cámbiale los textos.
   El orden no importa (la tanda se baraja sola). Si usas una
   materia nueva, añádela al mapa LABELS de factos.html.
   Set inicial sembrado y verificado · 67 afirmaciones.
   ============================================================ */
window.FACTOS = [
  /* —— Física —— */
  {"materia":"fisica","tema":"Transmisión del calor","afirmacion":"Existen tres formas de transmitir el calor: conducción, convección y radiación.","nota":"Conducción en sólidos, convección en fluidos (líquidos y gases), radiación sin necesidad de medio (ondas electromagnéticas)."},
  {"materia":"fisica","tema":"Estados de la materia","afirmacion":"El cambio de estado de líquido a sólido se llama solidificación, y el de sólido a líquido se llama fusión.","nota":"Fusión = se funde el hielo."},
  {"materia":"fisica","tema":"Cambios de estado","afirmacion":"El paso directo de sólido a gas, sin pasar por líquido, se llama sublimación.","nota":"Ejemplo: el hielo seco (dióxido de carbono sólido)."},
  {"materia":"fisica","tema":"Leyes de Newton","afirmacion":"La primera ley de Newton, o ley de la inercia, dice que un cuerpo permanece en reposo o en movimiento rectilíneo uniforme si ninguna fuerza neta actúa sobre él.","nota":"Inercia = resistencia al cambio de movimiento."},
  {"materia":"fisica","tema":"Leyes de Newton","afirmacion":"La tercera ley de Newton afirma que a toda acción corresponde una reacción de igual magnitud pero en sentido contrario.","nota":"Acción y reacción actúan sobre cuerpos distintos."},
  {"materia":"fisica","tema":"Unidades del SI","afirmacion":"En el Sistema Internacional, la unidad de masa es el kilogramo (kg), la de longitud es el metro (m) y la de tiempo es el segundo (s).","nota":"Masa en kg, no en gramos."},
  {"materia":"fisica","tema":"Unidades del SI","afirmacion":"En el Sistema Internacional, la unidad de fuerza es el newton (N) y la de energía o trabajo es el joule (J).","nota":""},
  {"materia":"fisica","tema":"Tipos de ondas","afirmacion":"Según el medio en que se propagan, las ondas se clasifican en mecánicas, que necesitan un medio material para propagarse, y electromagnéticas, que pueden viajar en el vacío.","nota":"El sonido es una onda mecánica; la luz es electromagnética."},
  {"materia":"fisica","tema":"Óptica básica","afirmacion":"La reflexión de la luz ocurre cuando un rayo rebota en una superficie, mientras que la refracción ocurre cuando la luz cambia de dirección al pasar de un medio a otro.","nota":"Refracción: por eso un lápiz se ve 'quebrado' en el agua."},

  /* —— Química —— */
  {"materia":"quimica","tema":"Tabla periódica","afirmacion":"En la tabla periódica, las filas horizontales se llaman periodos y las columnas verticales se llaman grupos o familias.","nota":"Periodo = fila; grupo = columna."},
  {"materia":"quimica","tema":"Tabla periódica","afirmacion":"Los elementos de la tabla periódica están ordenados de menor a mayor número atómico, es decir, según su número de protones.","nota":"El orden lo da el número atómico (Z), que es el número de protones del átomo."},
  {"materia":"quimica","tema":"Tipos de enlace","afirmacion":"Hay enlace iónico cuando un metal cede electrones a un no metal, formándose iones que se atraen, como en el cloruro de sodio (sal de mesa).","nota":"Iónico = metal + no metal; hay transferencia de electrones."},
  {"materia":"quimica","tema":"Tipos de enlace","afirmacion":"En el enlace covalente dos átomos no metálicos comparten electrones, como ocurre en la molécula de agua (H₂O).","nota":"Covalente = no metal + no metal; se comparten electrones."},
  {"materia":"quimica","tema":"Clasificación de materia","afirmacion":"Un elemento está formado por un solo tipo de átomo, un compuesto por dos o más elementos unidos químicamente, y una mezcla por sustancias que se combinan sin reaccionar y pueden separarse por métodos físicos.","nota":"Compuesto se separa por métodos químicos; mezcla por físicos."},
  {"materia":"quimica","tema":"Escala de pH","afirmacion":"La escala de pH va de 0 a 14: los valores menores que 7 son ácidos, el 7 es neutro y los mayores que 7 son básicos o alcalinos.","nota":"7 = neutro (agua pura); abajo ácido, arriba base."},
  {"materia":"quimica","tema":"Estados de agregación","afirmacion":"Los tres estados de agregación de la materia son sólido, líquido y gaseoso; el sólido tiene forma y volumen fijos, el líquido volumen fijo pero forma variable, y el gas no tiene forma ni volumen fijos.","nota":"Sólido fijo, líquido toma forma del recipiente, gas se expande."},
  {"materia":"quimica","tema":"Modelo atómico","afirmacion":"El átomo está formado por protones de carga positiva y neutrones sin carga, ambos en el núcleo, y electrones de carga negativa que giran alrededor.","nota":"Protones (+) y neutrones (0) en el núcleo; electrones (−) afuera."},
  {"materia":"quimica","tema":"Conservación de la materia","afirmacion":"La ley de la conservación de la materia, enunciada por Antoine Lavoisier, establece que en una reacción química la materia no se crea ni se destruye, solo se transforma.","nota":"Lavoisier: la masa de reactivos es igual a la de productos."},

  /* —— Biología —— */
  {"materia":"biologia","tema":"Niveles de organización","afirmacion":"Los niveles de organización de la vida, de lo más simple a lo más complejo, son: átomo, molécula, célula, tejido, órgano, aparato o sistema, organismo, población, comunidad, ecosistema, bioma y biosfera.","nota":"La célula es la unidad mínima con vida."},
  {"materia":"biologia","tema":"Tipos de célula","afirmacion":"Existen dos tipos de células: la procariota, que no tiene núcleo definido y su material genético está libre en el citoplasma, y la eucariota, que sí tiene núcleo rodeado por una membrana.","nota":"Bacterias = procariotas; plantas, animales y hongos = eucariotas."},
  {"materia":"biologia","tema":"Fotosíntesis","afirmacion":"En la fotosíntesis las plantas usan dióxido de carbono, agua y luz solar para producir glucosa y liberar oxígeno; en palabras: dióxido de carbono + agua + luz → glucosa + oxígeno.","nota":"La clorofila capta la luz; ocurre en el cloroplasto."},
  {"materia":"biologia","tema":"Reinos de los seres vivos","afirmacion":"Los cinco reinos de los seres vivos son: Monera (bacterias), Protista (protozoarios y algas), Fungi (hongos), Plantae (plantas) y Animalia (animales).","nota":"Mnemotecnia: 'Mi Primo Fue Por Agua' (Monera, Protista, Fungi, Plantae, Animalia)."},
  {"materia":"biologia","tema":"ADN y genes","afirmacion":"El ADN (ácido desoxirribonucleico) es la molécula que guarda la información genética, y un gen es un fragmento de ADN que contiene las instrucciones para una característica del organismo.","nota":"Los genes se ubican en los cromosomas dentro del núcleo."},
  {"materia":"biologia","tema":"Respiración celular","afirmacion":"La respiración celular es el proceso en que la célula descompone la glucosa usando oxígeno para obtener energía, liberando dióxido de carbono y agua; en palabras: glucosa + oxígeno → energía + dióxido de carbono + agua.","nota":"Es el proceso inverso de la fotosíntesis y ocurre principalmente en la mitocondria."},
  {"materia":"biologia","tema":"Cadena alimenticia","afirmacion":"En una cadena alimenticia los productores son los organismos que fabrican su propio alimento (como las plantas), los consumidores se alimentan de otros seres vivos y los descomponedores degradan la materia muerta (como hongos y bacterias).","nota":"El flujo de energía siempre va del productor hacia los consumidores."},
  {"materia":"biologia","tema":"Aparato circulatorio","afirmacion":"El aparato circulatorio está formado por el corazón, las venas, las arterias y los capilares, y su función es transportar la sangre con oxígeno y nutrientes a todo el cuerpo.","nota":"Las arterias llevan sangre desde el corazón; las venas la regresan a él."},

  /* —— Historia de México —— */
  {"materia":"historia","tema":"Independencia","afirmacion":"La Guerra de Independencia de México inició el 16 de septiembre de 1810 con el Grito de Dolores, encabezado por el cura Miguel Hidalgo y Costilla.","nota":"Por eso el 16 de septiembre es el Día de la Independencia."},
  {"materia":"historia","tema":"Independencia","afirmacion":"José María Morelos y Pavón continuó la lucha de independencia y en 1813 convocó el Congreso de Chilpancingo, donde presentó el documento 'Sentimientos de la Nación'.","nota":"Morelos tomó el relevo tras la muerte de Hidalgo."},
  {"materia":"historia","tema":"Independencia","afirmacion":"La Independencia de México se consumó el 27 de septiembre de 1821 con la entrada del Ejército Trigarante a la Ciudad de México, encabezado por Agustín de Iturbide.","nota":"Trigarante = tres garantías: religión, independencia y unión."},
  {"materia":"historia","tema":"Reforma","afirmacion":"Las Leyes de Reforma, impulsadas durante el gobierno de Benito Juárez, separaron a la Iglesia del Estado y establecieron el registro civil y el matrimonio civil.","nota":"Buscaban un Estado laico (sin poder de la Iglesia)."},
  {"materia":"historia","tema":"Reforma","afirmacion":"Benito Juárez es recordado por la frase \"El respeto al derecho ajeno es la paz\" y encabezó la defensa de la República contra la intervención francesa.","nota":"Juárez encabezó el gobierno republicano en resistencia, en oposición al Segundo Imperio de Maximiliano (1864-1867)."},
  {"materia":"historia","tema":"Porfiriato","afirmacion":"El Porfiriato es el periodo de más de 30 años (de 1876 a 1911) en que Porfirio Díaz gobernó México de manera casi continua, caracterizado por progreso material pero también por dictadura y desigualdad.","nota":"Su lema fue \"orden y progreso\"."},
  {"materia":"historia","tema":"Revolución Mexicana","afirmacion":"La Revolución Mexicana inició el 20 de noviembre de 1910, fecha en que Francisco I. Madero convocó al pueblo a levantarse contra Porfirio Díaz.","nota":"El 20 de noviembre se conmemora la Revolución."},
  {"materia":"historia","tema":"Planes y documentos","afirmacion":"El Plan de San Luis fue redactado por Francisco I. Madero y llamaba a desconocer a Porfirio Díaz e iniciar la Revolución; el Plan de Ayala fue proclamado por Emiliano Zapata para exigir la repartición de tierras.","nota":"San Luis = Madero; Ayala = Zapata ('Tierra y Libertad')."},
  {"materia":"historia","tema":"Constitución de 1917","afirmacion":"La Constitución Política de México fue promulgada el 5 de febrero de 1917 en Querétaro, bajo el gobierno de Venustiano Carranza, y sigue vigente como ley suprema del país.","nota":"Destacan los artículos 3 (educación), 27 (tierra) y 123 (trabajo)."},

  /* —— Geografía —— */
  {"materia":"geografia","tema":"Capas de la Tierra","afirmacion":"La Tierra tiene tres capas internas principales: corteza, manto y núcleo. La corteza es la capa más externa y delgada, y el núcleo es la más interna y caliente.","nota":"De afuera hacia adentro: corteza, manto, núcleo."},
  {"materia":"geografia","tema":"Movimientos terrestres","afirmacion":"La rotación es el giro de la Tierra sobre su propio eje y dura aproximadamente 24 horas; este movimiento produce el día y la noche.","nota":"Rotación = día y noche (24 h)."},
  {"materia":"geografia","tema":"Movimientos terrestres","afirmacion":"La traslación es el recorrido de la Tierra alrededor del Sol y dura aproximadamente 365 días (un año); este movimiento, junto con la inclinación del eje, produce las estaciones del año.","nota":"Traslación = un año y las estaciones."},
  {"materia":"geografia","tema":"Husos horarios","afirmacion":"El meridiano de Greenwich es el meridiano 0° y se usa como referencia para medir la longitud y para establecer los husos horarios del mundo.","nota":"Greenwich = longitud 0°."},
  {"materia":"geografia","tema":"Coordenadas geográficas","afirmacion":"La latitud es la distancia en grados desde el Ecuador hacia los polos (norte o sur), y la longitud es la distancia en grados desde el meridiano de Greenwich hacia el este o el oeste.","nota":"Latitud mide al norte/sur; longitud al este/oeste."},
  {"materia":"geografia","tema":"Capas de la atmósfera","afirmacion":"La atmósfera tiene cinco capas, de la más cercana a la más lejana de la superficie: troposfera, estratosfera, mesosfera, termosfera y exosfera. En la troposfera ocurren los fenómenos del clima.","nota":"En la estratosfera se encuentra la capa de ozono."},

  /* —— Formación Cívica y Ética —— */
  {"materia":"civismo","tema":"División de poderes","afirmacion":"En México el poder público de la Federación se divide en tres poderes: Ejecutivo, Legislativo y Judicial.","nota":"Mnemotecnia: E-L-J. La división evita que el poder se concentre en una sola persona."},
  {"materia":"civismo","tema":"Poder Ejecutivo","afirmacion":"El Poder Ejecutivo federal lo encabeza el Presidente de la República, quien dura seis años en el cargo y no puede reelegirse.","nota":"El periodo de seis años se llama sexenio."},
  {"materia":"civismo","tema":"Poder Legislativo","afirmacion":"El Poder Legislativo federal recae en el Congreso de la Unión, formado por la Cámara de Diputados y la Cámara de Senadores, y su función principal es hacer las leyes.","nota":"Por eso se le llama bicameral (dos cámaras)."},
  {"materia":"civismo","tema":"Poder Judicial","afirmacion":"El Poder Judicial de la Federación se encarga de impartir justicia e interpretar las leyes, y su máximo órgano es la Suprema Corte de Justicia de la Nación (SCJN).","nota":""},
  {"materia":"civismo","tema":"Constitución","afirmacion":"La Constitución Política de los Estados Unidos Mexicanos es la ley suprema del país y ninguna otra ley puede contradecirla; fue promulgada el 5 de febrero de 1917.","nota":"Por ser la ley máxima se le llama Carta Magna."},
  {"materia":"civismo","tema":"Democracia","afirmacion":"La democracia es una forma de gobierno en la que el pueblo elige a sus representantes mediante el voto libre, secreto y universal.","nota":"Del griego: demos (pueblo) y kratos (poder o gobierno)."},
  {"materia":"civismo","tema":"Derechos humanos","afirmacion":"Los derechos humanos son universales, inalienables e indivisibles: pertenecen a todas las personas por el solo hecho de existir y no pueden quitarse ni venderse.","nota":""},
  {"materia":"civismo","tema":"Instituciones","afirmacion":"El Instituto Nacional Electoral (INE) es el organismo encargado de organizar las elecciones federales en México, y la Comisión Nacional de los Derechos Humanos (CNDH) protege y defiende los derechos humanos.","nota":"INE organiza votaciones; CNDH defiende derechos."},
  {"materia":"civismo","tema":"Estado de derecho","afirmacion":"En un Estado de derecho todas las personas e instituciones, incluidas las autoridades, están sometidas a la ley y deben respetarla por igual.","nota":"Nadie está por encima de la ley."},

  /* —— Matemáticas —— */
  {"materia":"matematicas","tema":"Triángulos","afirmacion":"La suma de los ángulos internos de cualquier triángulo es igual a 180°.","nota":"Vale para todo triángulo, sin importar su forma."},
  {"materia":"matematicas","tema":"Teorema de Pitágoras","afirmacion":"En todo triángulo rectángulo, el cuadrado de la hipotenusa es igual a la suma de los cuadrados de los catetos: a² + b² = c².","nota":"La hipotenusa (c) es el lado opuesto al ángulo recto y el más largo del triángulo."},
  {"materia":"matematicas","tema":"Números primos","afirmacion":"Un número primo es aquel mayor que 1 que solo tiene dos divisores: el 1 y él mismo.","nota":"El 2 es el único número primo par."},
  {"materia":"matematicas","tema":"Jerarquía de operaciones","afirmacion":"El orden para resolver operaciones es: primero los paréntesis, luego potencias y raíces, después multiplicaciones y divisiones, y al final sumas y restas.","nota":"Se resuelven de izquierda a derecha cuando tienen igual jerarquía."},
  {"materia":"matematicas","tema":"Área del círculo","afirmacion":"El área de un círculo se calcula con la fórmula A = π·r², donde r es el radio.","nota":"El perímetro (circunferencia) es C = 2·π·r."},
  {"materia":"matematicas","tema":"Propiedad conmutativa","afirmacion":"La propiedad conmutativa establece que el orden de los sumandos o factores no altera el resultado: a + b = b + a y a·b = b·a.","nota":"Aplica a la suma y a la multiplicación, no a la resta ni a la división."},
  {"materia":"matematicas","tema":"Porcentaje","afirmacion":"Un porcentaje es una fracción cuyo denominador es 100; por ejemplo, 25% equivale a 25/100, es decir, 0.25.","nota":"\"Por ciento\" significa \"de cada cien\"."},
  {"materia":"matematicas","tema":"Área del triángulo","afirmacion":"El área de un triángulo es igual a la base por la altura dividida entre dos: A = (b·h)/2.","nota":"La altura debe ser perpendicular a la base."},
  {"materia":"matematicas","tema":"Fracción","afirmacion":"En una fracción, el numerador indica las partes que se toman y el denominador indica en cuántas partes iguales se divide el entero.","nota":"El numerador va arriba y el denominador abajo."},

  /* —— Español —— */
  {"materia":"espanol","tema":"Acentuación","afirmacion":"Las palabras agudas llevan la fuerza de voz (acento prosódico) en la última sílaba y se acentúan gráficamente (tilde) cuando terminan en n, s o vocal.","nota":"Ej: camión (n), compás (s), café (vocal). No llevan tilde cuando terminan en otra letra: reloj, papel, verdad."},
  {"materia":"espanol","tema":"Acentuación","afirmacion":"Las palabras graves o llanas llevan la fuerza de voz en la penúltima sílaba y se acentúan cuando NO terminan en n, s ni vocal.","nota":"Ej: árbol, lápiz, fácil."},
  {"materia":"espanol","tema":"Acentuación","afirmacion":"Las palabras esdrújulas llevan el acento en la antepenúltima sílaba y siempre se acentúan gráficamente, sin excepción.","nota":"Ej: pájaro, médico, lámpara."},
  {"materia":"espanol","tema":"Figuras retóricas","afirmacion":"El símil compara dos elementos usando un nexo como 'como', 'cual' o 'parecido a', mientras que la metáfora identifica un elemento con otro sin usar nexo comparativo.","nota":"Símil: 'ojos como luceros'; metáfora: 'sus ojos son luceros'."},
  {"materia":"espanol","tema":"Tipos de texto","afirmacion":"El texto narrativo cuenta hechos o sucesos en el tiempo, el expositivo informa o explica un tema de forma objetiva y el argumentativo defiende una opinión con razones para convencer.","nota":"Narra, explica, convence."},
  {"materia":"espanol","tema":"Partes de la oración","afirmacion":"El sustantivo nombra personas, animales, cosas o ideas; el adjetivo describe o califica al sustantivo; y el verbo expresa acción, estado o proceso.","nota":"Quién/qué, cómo es, qué hace."},
  {"materia":"espanol","tema":"Signos de puntuación","afirmacion":"El punto y coma (;) separa elementos de una enumeración que ya contienen comas o une oraciones relacionadas, marcando una pausa mayor que la coma y menor que el punto.","nota":"Pausa intermedia entre coma y punto."},
  {"materia":"espanol","tema":"Acentuación diacrítica","afirmacion":"La tilde diacrítica distingue palabras de igual escritura pero distinta función, como 'tú' (pronombre) frente a 'tu' (posesivo) o 'sí' (afirmación) frente a 'si' (condición).","nota":"Otros pares: él/el, más/mas, té/te."},
];
