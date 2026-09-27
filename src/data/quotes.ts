import { MoodConfig, MoodType, Quote } from '../types';

export const MOOD_CONFIGS: Record<MoodType, MoodConfig> = {
  general: {
    id: 'general',
    label: 'General',
    shortLabel: 'General',
    icon: 'Sparkles',
    description: 'Sabiduría y perspectiva para el día a día',
    accentColor: '#7c6cff',
    glowColor: 'rgba(124, 108, 255, 0.35)',
    gradient: 'from-[#7c6cff]/20 via-[#141830] to-[#0b0d18]',
    emoji: '✨',
  },
  tired: {
    id: 'tired',
    label: 'Cansado',
    shortLabel: 'Cansado',
    icon: 'Moon',
    description: 'Permiso para pausar, recuperar energía y ser gentil contigo',
    accentColor: '#60a5fa',
    glowColor: 'rgba(96, 165, 250, 0.35)',
    gradient: 'from-[#3b82f6]/20 via-[#141830] to-[#0b0d18]',
    emoji: '🌙',
  },
  unmotivated: {
    id: 'unmotivated',
    label: 'Desmotivado',
    shortLabel: 'Desmotivado',
    icon: 'Flame',
    description: 'Chispa interna cuando las ganas no alcanzan',
    accentColor: '#ff7a59',
    glowColor: 'rgba(255, 122, 89, 0.35)',
    gradient: 'from-[#ff7a59]/20 via-[#141830] to-[#0b0d18]',
    emoji: '🔥',
  },
  procrastinating: {
    id: 'procrastinating',
    label: 'Procrastinando',
    shortLabel: 'Procrastinando',
    icon: 'Zap',
    description: 'El empujón para vencer la inercia y dar el primer paso hoy',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.35)',
    gradient: 'from-[#f59e0b]/20 via-[#141830] to-[#0b0d18]',
    emoji: '⚡',
  },
  anxious: {
    id: 'anxious',
    label: 'Ansioso',
    shortLabel: 'Ansioso',
    icon: 'Wind',
    description: 'Anclaje en el presente, respiración y calma mental',
    accentColor: '#2dd4bf',
    glowColor: 'rgba(45, 212, 191, 0.35)',
    gradient: 'from-[#2dd4bf]/20 via-[#141830] to-[#0b0d18]',
    emoji: '🍃',
  },
  self_recognition: {
    id: 'self_recognition',
    label: 'Necesito reconocerme',
    shortLabel: 'Reconocerme',
    icon: 'HeartHandshake',
    description: 'Validar tu esfuerzo, tu valor y lo mucho que ya has superado',
    accentColor: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.35)',
    gradient: 'from-[#ec4899]/20 via-[#141830] to-[#0b0d18]',
    emoji: '🌸',
  },
};

export const INITIAL_QUOTES: Quote[] = [
  // --- GENERAL ---
  {
    id: 'gen-1',
    mood: 'general',
    text: 'Tienes poder sobre tu mente, no sobre los acontecimientos externos. Entiende esto y hallarás tu fuerza.',
    author: 'Marco Aurelio',
  },
  {
    id: 'gen-2',
    mood: 'general',
    text: 'A veces el paso más valiente no es avanzar rápido, sino decidir no rendirte hoy.',
    author: 'Reflexión de vida',
  },
  {
    id: 'gen-3',
    mood: 'general',
    text: 'No podemos controlar el viento, pero sí podemos ajustar las velas de nuestro barco.',
    author: 'Séneca',
  },
  {
    id: 'gen-4',
    mood: 'general',
    text: 'Cuando no podemos cambiar una situación, nos enfrentamos al reto de cambiarnos a nosotros mismos.',
    author: 'Viktor Frankl',
  },
  {
    id: 'gen-5',
    mood: 'general',
    text: 'Confía en el proceso silencioso de tus raíces antes de exigir ver tus flores.',
    author: 'Sabiduría ancestral',
  },
  {
    id: 'gen-6',
    mood: 'general',
    text: 'La vida es lo que va sucediendo mientras te empeñas en hacer otros planes.',
    author: 'John Lennon',
  },

  // --- CANSADO ---
  {
    id: 'tired-1',
    mood: 'tired',
    text: 'El descanso no es rendirse; es afilar el hacha para cuando llegue el momento de continuar.',
    author: 'Anónimo',
  },
  {
    id: 'tired-2',
    mood: 'tired',
    text: 'No tienes que solucionar toda tu vida esta noche. Solo necesitas soltar el peso y dormir.',
    author: 'Ánimo',
  },
  {
    id: 'tired-3',
    mood: 'tired',
    text: 'Aprende a descansar, no a renunciar. Tu cuerpo y tu mente han dado mucho.',
    author: 'Banksy',
  },
  {
    id: 'tired-4',
    mood: 'tired',
    text: 'Incluso la tierra más fértil necesita reposar una estación para volver a florecer.',
    author: 'Proverbio',
  },
  {
    id: 'tired-5',
    mood: 'tired',
    text: 'Bajar el ritmo también es avanzar si con ello evitas quebrarte.',
    author: 'Sabiduría estoica',
  },
  {
    id: 'tired-6',
    mood: 'tired',
    text: 'Date permiso para hacer una pausa sin culpa. Existir hoy ya es suficiente logro.',
    author: 'Reflexión interior',
  },

  // --- DESMOTIVADO ---
  {
    id: 'unmot-1',
    mood: 'unmotivated',
    text: 'No esperes a tener ganas para moverte. El entusiasmo casi siempre llega después de haber comenzado.',
    author: 'Ánimo',
  },
  {
    id: 'unmot-2',
    mood: 'unmotivated',
    text: 'Un día o el día uno. Tú decides desde este instante.',
    author: 'Paulo Coelho',
  },
  {
    id: 'unmot-3',
    mood: 'unmotivated',
    text: 'La motivación es lo que te pone en marcha, el hábito es lo que hace que sigas.',
    author: 'Jim Ryun',
  },
  {
    id: 'unmot-4',
    mood: 'unmotivated',
    text: 'Aunque sientas que avanzas a paso de tortuga, sigues yendo más rápido que quien no lo intenta.',
    author: 'Reflexión de coraje',
  },
  {
    id: 'unmot-5',
    mood: 'unmotivated',
    text: 'Recuerda por qué empezaste cuando el camino se vuelva empinado y gris.',
    author: 'Voz interior',
  },
  {
    id: 'unmot-6',
    mood: 'unmotivated',
    text: 'Tu futuro se crea con lo que haces hoy, no con lo que prometes hacer mañana.',
    author: 'Robert Kiyosaki',
  },

  // --- PROCRASTINANDO ---
  {
    id: 'proc-1',
    mood: 'procrastinating',
    text: 'No necesitas ver toda la escalera completa, solo da el primer escalón ahora.',
    author: 'Martin Luther King Jr.',
  },
  {
    id: 'proc-2',
    mood: 'procrastinating',
    text: 'Aplica la regla de los dos minutos: comprométete a hacerlo solo 120 segundos. El inicio romperá el hechizo.',
    author: 'James Clear',
  },
  {
    id: 'proc-3',
    mood: 'procrastinating',
    text: 'Hecho es infinitamente mejor que perfecto. Suelta la autoexigencia y haz la primera versión.',
    author: 'Sheryl Sandberg',
  },
  {
    id: 'proc-4',
    mood: 'procrastinating',
    text: 'La tarea no es tan grande como la resistencia mental que le has construido.',
    author: 'Ánimo',
  },
  {
    id: 'proc-5',
    mood: 'procrastinating',
    text: 'Dentro de un año desearás haber empezado hoy.',
    author: 'Karen Lamb',
  },
  {
    id: 'proc-6',
    mood: 'procrastinating',
    text: 'Cuenta hacia atrás: 5, 4, 3, 2, 1... y levántate a actuar antes de que tu mente invente una excusa.',
    author: 'Mel Robbins',
  },

  // --- ANSIOSO ---
  {
    id: 'anx-1',
    mood: 'anxious',
    text: 'Inhala hondo, sostén el aire y exhala despacio. En este segundo exacto estás a salvo.',
    author: 'Guía de calma',
  },
  {
    id: 'anx-2',
    mood: 'anxious',
    text: 'La ansiedad nos hace sufrir por catástrofes imaginarias que casi nunca llegan a suceder.',
    author: 'Séneca',
  },
  {
    id: 'anx-3',
    mood: 'anxious',
    text: 'No tienes que controlar las olas del mar, solo aprende a surfear la ola presente.',
    author: 'Jon Kabat-Zinn',
  },
  {
    id: 'anx-4',
    mood: 'anxious',
    text: 'Una cosa a la vez. No cargues con el mañana cuando hoy apenas necesita tu atención.',
    author: 'Ánimo',
  },
  {
    id: 'anx-5',
    mood: 'anxious',
    text: 'Tus pensamientos son solo nubes que cruzan el cielo. Tú eres el cielo, inmenso y en calma.',
    author: 'Pema Chödrön',
  },
  {
    id: 'anx-6',
    mood: 'anxious',
    text: 'Si algo tiene solución, ¿para qué te preocupas? Y si no la tiene, ¿para qué te preocupas?',
    author: 'Proverbio oriental',
  },

  // --- NECESITO RECONOCERME ---
  {
    id: 'rec-1',
    mood: 'self_recognition',
    text: 'Mira hacia atrás solo para ver todas las tormentas que creías que no superarías y que hoy quedaron atrás.',
    author: 'Ánimo',
  },
  {
    id: 'rec-2',
    mood: 'self_recognition',
    text: 'Tu valor intrínseco como ser humano no depende de cuántas cosas tildaste en tu lista de pendientes.',
    author: 'Brené Brown',
  },
  {
    id: 'rec-3',
    mood: 'self_recognition',
    text: 'Eres mucho más fuerte, resiliente y capaz de lo que tu voz autocrítica te hace creer.',
    author: 'Carl Rogers',
  },
  {
    id: 'rec-4',
    mood: 'self_recognition',
    text: 'Date el crédito que tan fácilmente le darías a un buen amigo en tu misma situación.',
    author: 'Kristin Neff',
  },
  {
    id: 'rec-5',
    mood: 'self_recognition',
    text: 'Has sobrevivido al 100% de tus peores días. Esa es una estadística innegable de tu tenacidad.',
    author: 'Reflexión de vida',
  },
  {
    id: 'rec-6',
    mood: 'self_recognition',
    text: 'No necesitas la aprobación de nadie para sentirte orgulloso de tus pequeños pasos silenciosos.',
    author: 'Voz propia',
  },
];
